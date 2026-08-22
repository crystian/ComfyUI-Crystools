import logging
import os
import platform
import re
import shutil
import subprocess
from ctypes import byref, c_int64, create_string_buffer
from pathlib import Path

import torch
import comfy.model_management
from ..core import logger

try:
    import pynvml
except ImportError:
    pynvml = None

try:
    from pyrsmi import rocml
except Exception:
    rocml = None

try:
    import amdsmi
except Exception:
    amdsmi = None


def is_jetson() -> bool:
    """
    Determines if the Python environment is running on a Jetson device by checking the device model
    information or the platform release.
    """
    PROC_DEVICE_MODEL = ''
    try:
        with open('/proc/device-tree/model', 'r') as f:
            PROC_DEVICE_MODEL = f.read().strip()
            logger.info(f"Device model: {PROC_DEVICE_MODEL}")
            return "NVIDIA" in PROC_DEVICE_MODEL
    except Exception:
        # logger.warning(f"JETSON: Could not read /proc/device-tree/model: {e} (If you're not using Jetson, ignore this warning)")
        # If /proc/device-tree/model is not available, check platform.release()
        platform_release = platform.release()
        logger.info(f"Platform release: {platform_release}")
        if 'tegra' in platform_release.lower():
            logger.info("Detected 'tegra' in platform release. Assuming Jetson device.")
            return True
        else:
            logger.info("JETSON: Not detected.")
            return False


IS_JETSON = is_jetson()


class CGPUInfo:
    """
    This class is responsible for getting information from GPU (ONLY).
    """
    cuda = False
    pynvmlLoaded = False
    pyamdLoaded = False
    jtopLoaded = False
    amdsmiLoaded = False
    cudaAvailable = False
    torchDevice = 'cpu'
    cudaDevice = 'cpu'
    cudaDevicesFound = 0
    switchGPU = True
    linuxAmdSysfsAvailable = False
    linuxAmdCardCount = 0
    switchVRAM = True
    switchTemperature = True
    gpus = []
    gpusUtilization = []
    gpusVRAM = []
    gpusTemperature = []

    def __init__(self):
        self.jtopInstance = None
        self.pynvml = None
        self.amdsmi = None
        self.amdsmiHandles = None
        self.amdsmiActivityAvailable = True

        if IS_JETSON:
            # Try to import jtop for Jetson devices
            try:
                from jtop import jtop
                self.jtopInstance = jtop()
                self.jtopInstance.start()
                self.jtopLoaded = True
                logger.info('jtop initialized on Jetson device.')
            except ImportError as e:
                logger.error('jtop is not installed. ' + str(e))
            except Exception as e:
                logger.error('Could not initialize jtop. ' + str(e))
        else:
            # Try to import pynvml for non-Jetson devices
            if pynvml is not None:
                try:
                    self.pynvml = pynvml
                    self.pynvml.nvmlInit()
                    self.pynvmlLoaded = True
                    logger.info('pynvml (NVIDIA) initialized.')
                except Exception as e:
                    logger.debug('pynvml (NVIDIA) unavailable, skipping NVIDIA monitoring. ' + str(e))

            if not self.pynvmlLoaded and amdsmi is not None:
                try:
                    self._quiet_external_logs(amdsmi.amdsmi_init)
                    self.amdsmi = amdsmi
                    self.amdsmiLoaded = True
                    self.amdsmiHandles = self._get_amdsmi_handles(log_failure=False)
                    if self.amdsmiHandles:
                        logger.info('amdsmi initialized.')
                    else:
                        logger.info('amdsmi initialized, but no AMD GPU handles were reported. Using fallback monitoring.')
                        try:
                            self._quiet_external_logs(amdsmi.amdsmi_shut_down)
                        except Exception:
                            pass
                        self.amdsmi = None
                        self.amdsmiLoaded = False
                except Exception as e:
                    logger.info('Could not init amdsmi, using fallback monitoring. ' + str(e))

            if not self.pynvmlLoaded and (not self.amdsmiLoaded or not self._get_amdsmi_handles()) and rocml is not None:
                try:
                    self._quiet_external_logs(rocml.smi_initialize)
                    self.pyamdLoaded = True
                    logger.info('pyrsmi (AMD/ROCm) initialized.')
                except Exception as e:
                    logger.info('Could not init pyrsmi (AMD/ROCm), using fallback monitoring. ' + str(e))

        self.linuxAmdSysfsAvailable, self.linuxAmdCardCount = self._detect_linux_amd_sysfs()
        self.anygpuLoaded = self.pynvmlLoaded or self.pyamdLoaded or self.jtopLoaded or self.amdsmiLoaded or self.linuxAmdSysfsAvailable

        try:
            self.torchDevice = comfy.model_management.get_torch_device_name(comfy.model_management.get_torch_device())
        except Exception as e:
            logger.error('Could not pick default device. ' + str(e))

        if self.anygpuLoaded and not self.deviceGetCount():
            logger.warning('No GPU detected, disabling GPU monitoring.')
            self.anygpuLoaded = False
            self.pynvmlLoaded = False
            self.pyamdLoaded = False
            self.jtopLoaded = False

        if self.anygpuLoaded:
            if self.deviceGetCount() > 0:
                self.cudaDevicesFound = self.deviceGetCount()

                logger.info("GPU/s:")

                for deviceIndex in range(self.cudaDevicesFound):
                    deviceHandle = self.deviceGetHandleByIndex(deviceIndex)

                    gpuName = self.deviceGetName(deviceHandle, deviceIndex)

                    logger.info(f"{deviceIndex}) {gpuName}")

                    self.gpus.append({
                        'index': deviceIndex,
                        'name': gpuName,
                    })

                    # Same index as gpus, with default values
                    self.gpusUtilization.append(True)
                    self.gpusVRAM.append(True)
                    self.gpusTemperature.append(True)

                self.cuda = True
                logger.info(self.systemGetDriverVersion())
            else:
                logger.warning('No GPU detected.')
        else:
            logger.warning('No GPU monitoring libraries available.')

        self.cudaDevice = 'cpu' if self.torchDevice == 'cpu' and not (self.pynvmlLoaded or self.pyamdLoaded or self.jtopLoaded or self.amdsmiLoaded) else 'cuda'
        self.cudaAvailable = torch.cuda.is_available() if hasattr(torch, 'cuda') else False

        if self.cuda and self.cudaAvailable and self.torchDevice == 'cpu':
            logger.warning('CUDA is available, but torch is using CPU.')

    def getInfo(self):
        logger.debug('Getting GPUs info...')
        return self.gpus

    def getStatus(self):
        gpuUtilization = -1
        gpuTemperature = -1
        vramUsed = -1
        vramTotal = -1
        vramPercent = -1

        gpuType = ''
        gpus = []

        if self.cudaDevice == 'cpu':
            gpuType = 'cpu'
            gpus.append({
                'gpu_utilization': -1,
                'gpu_temperature': -1,
                'vram_total': -1,
                'vram_used': -1,
                'vram_used_percent': -1,
            })
        else:
            gpuType = self.cudaDevice

            if self.anygpuLoaded and self.cuda and (self.cudaAvailable or self.pyamdLoaded or self.jtopLoaded or self.amdsmiLoaded):
                for deviceIndex in range(self.cudaDevicesFound):
                    gpuUtilization = -1
                    vramPercent = -1
                    vramUsed = -1
                    vramTotal = -1
                    gpuTemperature = -1

                    try:
                        deviceHandle = self.deviceGetHandleByIndex(deviceIndex)
                    except Exception as e:
                        self._handle_metric_error('handle', e)
                        gpus.append({
                            'gpu_utilization': gpuUtilization,
                            'gpu_temperature': gpuTemperature,
                            'vram_total': vramTotal,
                            'vram_used': vramUsed,
                            'vram_used_percent': vramPercent,
                        })
                        continue

                    # GPU Utilization
                    if self.switchGPU and self.gpusUtilization[deviceIndex]:
                        try:
                            gpuUtilization = self.deviceGetUtilizationRates(deviceHandle)
                        except Exception as e:
                            self._handle_metric_error('utilization', e, 'switchGPU')

                    if self.switchVRAM and self.gpusVRAM[deviceIndex]:
                        try:
                            memory = self.deviceGetMemoryInfo(deviceHandle)
                            vramUsed = memory['used']
                            vramTotal = memory['total']

                            # Check if vramTotal is not zero or None
                            if vramTotal and vramTotal != 0:
                                vramPercent = vramUsed / vramTotal * 100

                        except Exception as e:
                            self._handle_metric_error('memory info', e, 'switchVRAM')

                    # Temperature
                    if self.switchTemperature and self.gpusTemperature[deviceIndex]:
                        try:
                            gpuTemperature = self.deviceGetTemperature(deviceHandle)
                        except Exception as e:
                            self._handle_metric_error('temperature', e, 'switchTemperature')

                    gpus.append({
                        'gpu_utilization': gpuUtilization,
                        'gpu_temperature': gpuTemperature,
                        'vram_total': vramTotal,
                        'vram_used': vramUsed,
                        'vram_used_percent': vramPercent,
                    })

        return {
            'device_type': gpuType,
            'gpus': gpus,
        }

    def _read_text_file(self, path):
        try:
            with open(path, 'r', encoding='utf-8') as handle:
                return handle.read().strip()
        except Exception:
            return None

    def _list_amd_sysfs_device_paths(self, sysfs_root=None):
        root = Path(sysfs_root or '/sys/class/drm')
        if not root.exists():
            return []
        return sorted([
            path for path in root.glob('card*/device')
            if path.is_dir() and re.fullmatch(r'card\d+', path.parent.name)
        ])

    def _detect_linux_amd_sysfs(self, sysfs_root=None):
        device_paths = self._list_amd_sysfs_device_paths(sysfs_root)
        if not device_paths:
            return False, 0

        for device_path in device_paths:
            if (device_path / 'gpu_busy_percent').exists() or (device_path / 'mem_info_vram_used').exists() or (device_path / 'mem_info_vram_total').exists():
                return True, len(device_paths)

        return False, 0

    def _find_amd_sysfs_device_path(self, deviceIndex, sysfs_root=None):
        device_paths = self._list_amd_sysfs_device_paths(sysfs_root)
        if not device_paths:
            return None

        card_path = Path(sysfs_root or '/sys/class/drm') / f'card{deviceIndex}' / 'device'
        if card_path.exists() and card_path.is_dir():
            return card_path

        if deviceIndex < len(device_paths):
            return device_paths[deviceIndex]
        return device_paths[0] if device_paths else None

    def _read_amd_gpu_busy_percent(self, deviceIndex, sysfs_root=None):
        device_path = self._find_amd_sysfs_device_path(deviceIndex, sysfs_root)
        if device_path is None:
            return None

        busy_path = device_path / 'gpu_busy_percent'
        busy_text = self._read_text_file(busy_path)
        if busy_text is None:
            return None

        try:
            busy_value = float(busy_text)
            return max(0.0, min(100.0, busy_value))
        except ValueError:
            return None

    def _read_amd_vram_info(self, deviceIndex, sysfs_root=None):
        device_path = self._find_amd_sysfs_device_path(deviceIndex, sysfs_root)
        if device_path is None:
            return None

        used_text = self._read_text_file(device_path / 'mem_info_vram_used')
        total_text = self._read_text_file(device_path / 'mem_info_vram_total')
        if used_text is None or total_text is None:
            return None

        try:
            used = int(used_text)
            total = int(total_text)
        except ValueError:
            return None

        if total <= 0:
            return None

        return {'total': total, 'used': used}

    def _read_amd_temperature(self, deviceIndex, sysfs_root=None):
        sensors_bin = shutil.which('sensors')
        if sensors_bin:
            try:
                result = subprocess.run([sensors_bin], capture_output=True, text=True, timeout=1.5)
                if result.returncode == 0:
                    output = result.stdout or ''
                    match = re.search(r'edge:\s+\+?([\d.]+)°C', output)
                    if match is None:
                        match = re.search(r'edge:\s+([\d.]+)°C', output)
                    if match is not None:
                        return float(match.group(1))
            except Exception:
                pass

        device_path = self._find_amd_sysfs_device_path(deviceIndex, sysfs_root)
        if device_path is None:
            return None

        hwmon_dir = device_path / 'hwmon'
        if not hwmon_dir.exists():
            return None

        for hwmon_path in sorted(hwmon_dir.glob('hwmon*')):
            for candidate in [hwmon_path / 'temp1_input', hwmon_path / 'temp2_input', hwmon_path / 'temp_input']:
                temp_text = self._read_text_file(candidate)
                if temp_text is None:
                    continue
                try:
                    temp_value = int(float(temp_text))
                except ValueError:
                    continue
                if temp_value > 1000:
                    temp_value = temp_value / 1000
                return float(temp_value)
        return None

    def deviceGetCount(self):
        if self.pynvmlLoaded:
            return self.pynvml.nvmlDeviceGetCount()
        elif self.amdsmiLoaded:
            handle_count = len(self._get_amdsmi_handles())
            if handle_count > 0:
                return handle_count
            if self.pyamdLoaded:
                count = self._quiet_external_logs(rocml.smi_get_device_count)
                if count > 0:
                    return count
            if self.linuxAmdSysfsAvailable:
                return self.linuxAmdCardCount if self.linuxAmdCardCount > 0 else len(self._list_amd_sysfs_device_paths())
            return 0
        elif self.pyamdLoaded:
            count = self._quiet_external_logs(rocml.smi_get_device_count)
            if count > 0:
                return count
            if self.linuxAmdSysfsAvailable:
                return self.linuxAmdCardCount if self.linuxAmdCardCount > 0 else len(self._list_amd_sysfs_device_paths())
            return 0
        elif self.jtopLoaded:
            # For Jetson devices, we assume there's one GPU
            return 1
        elif self.linuxAmdSysfsAvailable:
            return self.linuxAmdCardCount if self.linuxAmdCardCount > 0 else len(self._list_amd_sysfs_device_paths())
        else:
            return 0

    def deviceGetHandleByIndex(self, index):
        if self.pynvmlLoaded:
            try:
                return self.pynvml.nvmlDeviceGetHandleByIndex(index)
            except Exception as e:
                if self._recover_nvidia_nvml(e):
                    return self.pynvml.nvmlDeviceGetHandleByIndex(index)
                raise
        elif self.amdsmiLoaded:
            return index
        elif self.pyamdLoaded:
            return index
        elif self.jtopLoaded:
            return index  # On Jetson, index acts as handle
        else:
            return index

    def deviceGetName(self, deviceHandle, deviceIndex):
        if self.pynvmlLoaded:
            gpuName = 'Unknown GPU'

            try:
                gpuName = self.pynvml.nvmlDeviceGetName(deviceHandle)
                try:
                    gpuName = gpuName.decode('utf-8', errors='ignore')
                except AttributeError:
                    pass

            except UnicodeDecodeError as e:
                gpuName = 'Unknown GPU (decoding error)'
                logger.error(f"UnicodeDecodeError: {e}")
            except Exception as e:
                logger.debug(f'Could not get NVIDIA GPU name. {e}')

            return gpuName
        elif self.amdsmiLoaded:
            try:
                handle = self._get_amdsmi_handle(deviceIndex)
                if handle is None:
                    return f'AMD GPU {deviceIndex + 1}'
                info = self.amdsmi.amdsmi_get_gpu_asic_info(handle)
                name = info.get('market_name') or info.get('vendor_name') or info.get('asic_serial') or ''
                return name if name else f'AMD GPU {deviceIndex + 1}'
            except Exception as e:
                logger.warning(f'Could not get AMD GPU name via amdsmi. {e}')
                return f'AMD GPU {deviceIndex + 1}'
        elif self.pyamdLoaded:
            try:
                gpuName = self._quiet_external_logs(rocml.smi_get_device_name, deviceIndex)
                if gpuName:
                    return gpuName
            except Exception as e:
                logger.debug(f'Could not get AMD GPU name via pyrsmi. {e}')
            if self.linuxAmdSysfsAvailable:
                return f'AMD GPU {deviceIndex + 1}'
            return ''
        elif self.linuxAmdSysfsAvailable:
            return f'AMD GPU {deviceIndex + 1}'
        elif self.jtopLoaded:
            # Access the GPU name from self.jtopInstance.gpu
            try:
                gpu_info = self.jtopInstance.gpu
                gpu_name = next(iter(gpu_info.keys()))
                return gpu_name
            except Exception as e:
                logger.error('Could not get GPU name. ' + str(e))
                return 'Unknown GPU'
        else:
            return ''

    def systemGetDriverVersion(self):
        if self.pynvmlLoaded:
            return f'NVIDIA Driver: {self.pynvml.nvmlSystemGetDriverVersion()}'
        elif self.amdsmiLoaded:
            try:
                handle = self._get_amdsmi_handle(0)
                if handle is not None:
                    info = self.amdsmi.amdsmi_get_gpu_driver_info(handle)
                    driver_name = info.get('driver_name', 'AMD')
                    driver_version = info.get('driver_version', 'unknown')
                    return f'AMD Driver: {driver_name} {driver_version}'
            except Exception as e:
                logger.warning(f'Could not get AMD driver version via amdsmi. {e}')

            try:
                if rocml is not None:
                    return f'AMD Driver: {self._quiet_external_logs(rocml.smi_get_kernel_version)}'
            except Exception as e:
                logger.warning(f'Could not get AMD driver version via pyrsmi fallback. {e}')
            return 'AMD Driver: unknown'
        elif self.pyamdLoaded:
            try:
                if rocml is None or getattr(rocml, 'rocm_lib', None) is None:
                    return 'AMD Driver: unknown'
                ver_str = create_string_buffer(256)
                rocml.rocm_lib.rsmi_version_str_get(0, ver_str, 256)
                return f'AMD Driver: {ver_str.value.decode()}'
            except Exception as e:
                logger.warning(f'Could not get AMD driver version. {e}')
                return 'AMD Driver: unknown'
        elif self.jtopLoaded:
            # No direct method to get driver version from jtop
            return 'NVIDIA Driver: unknown'
        else:
            return 'Driver unknown'

    def deviceGetUtilizationRates(self, deviceHandle):
        if self.pynvmlLoaded:
            return self.pynvml.nvmlDeviceGetUtilizationRates(deviceHandle).gpu
        elif self.amdsmiLoaded:
            if self.amdsmiActivityAvailable:
                try:
                    handle = self._get_amdsmi_handle(deviceHandle)
                    if handle is not None:
                        activity = self.amdsmi.amdsmi_get_gpu_activity(handle)
                        return activity.get('gfx_activity', activity.get('umc_activity', 0))
                except Exception as e:
                    self.amdsmiActivityAvailable = False
                    logger.debug(f'AMD SMI utilization is unavailable, using sysfs fallback. {e}')

            gpu_utilization = self._read_amd_gpu_busy_percent(deviceHandle)
            if gpu_utilization is not None:
                return gpu_utilization
            return 0
        elif self.linuxAmdSysfsAvailable:
            gpu_utilization = self._read_amd_gpu_busy_percent(deviceHandle)
            if gpu_utilization is not None:
                return gpu_utilization
            return 0
        elif self.pyamdLoaded:
            return rocml.smi_get_device_utilization(deviceHandle)
        elif self.jtopLoaded:
            # GPU utilization from jtop stats
            try:
                gpu_util = self.jtopInstance.stats.get('GPU', -1)
                return gpu_util
            except Exception as e:
                logger.error('Could not get GPU utilization. ' + str(e))
                return -1
        else:
            return 0

    def deviceGetMemoryInfo(self, deviceHandle):
        if self.pynvmlLoaded:
            mem = self.pynvml.nvmlDeviceGetMemoryInfo(deviceHandle)
            return {'total': mem.total, 'used': mem.used}
        elif self.amdsmiLoaded:
            try:
                handle = self._get_amdsmi_handle(deviceHandle)
                if handle is not None:
                    total = self.amdsmi.amdsmi_get_gpu_memory_total(handle, self.amdsmi.AmdSmiMemoryType.VRAM)
                    used = self.amdsmi.amdsmi_get_gpu_memory_usage(handle, self.amdsmi.AmdSmiMemoryType.VRAM)
                    return {'total': total, 'used': used}
            except Exception as e:
                logger.warning(f'Could not get AMD GPU memory via amdsmi. {e}')

            mem_info = self._read_amd_vram_info(deviceHandle)
            if mem_info is not None:
                return mem_info
            return {'total': 1, 'used': 1}
        elif self.linuxAmdSysfsAvailable:
            mem_info = self._read_amd_vram_info(deviceHandle)
            if mem_info is not None:
                return mem_info
            return {'total': 1, 'used': 1}
        elif self.pyamdLoaded:
            mem_used = rocml.smi_get_device_memory_used(deviceHandle)
            mem_total = rocml.smi_get_device_memory_total(deviceHandle)
            return {'total': mem_total, 'used': mem_used}
        elif self.jtopLoaded:
            mem_data = self.jtopInstance.memory['RAM']
            total = mem_data['tot']
            used = mem_data['used']
            return {'total': total, 'used': used}
        else:
            return {'total': 1, 'used': 1}

    def deviceGetTemperature(self, deviceHandle):
        if self.pynvmlLoaded:
            return self.pynvml.nvmlDeviceGetTemperature(deviceHandle, self.pynvml.NVML_TEMPERATURE_GPU)
        elif self.amdsmiLoaded:
            temperature = self._get_amdsmi_temperature(deviceHandle)
            if temperature is not None:
                return temperature

            temperature = self._read_amd_temperature(deviceHandle)
            if temperature is not None:
                return temperature

            if self.pyamdLoaded:
                try:
                    if rocml is None or getattr(rocml, 'rocm_lib', None) is None:
                        return -1
                    temp = c_int64(0)
                    rocml.rocm_lib.rsmi_dev_temp_metric_get(deviceHandle, 1, 0, byref(temp))
                    return temp.value / 1000
                except Exception as e:
                    logger.warning(f'Could not get AMD GPU temperature via pyrsmi fallback. {e}')
            return -1
        elif self.linuxAmdSysfsAvailable:
            temperature = self._read_amd_temperature(deviceHandle)
            if temperature is not None:
                return temperature
            return -1
        elif self.pyamdLoaded:
            try:
                if rocml is None or getattr(rocml, 'rocm_lib', None) is None:
                    return -1
                temp = c_int64(0)
                rocml.rocm_lib.rsmi_dev_temp_metric_get(deviceHandle, 1, 0, byref(temp))
                return temp.value / 1000
            except Exception as e:
                logger.warning(f'Could not get AMD GPU temperature. {e}')
                return -1
        elif self.jtopLoaded:
            try:
                temperature = self.jtopInstance.stats.get('Temp gpu', -1)
                return temperature
            except Exception as e:
                logger.error('Could not get GPU temperature. ' + str(e))
                return -1
        else:
            return 0

    def _quiet_external_logs(self, func, *args, **kwargs):
        previous_disable_level = logging.root.manager.disable
        logging.disable(logging.CRITICAL)
        try:
            return func(*args, **kwargs)
        finally:
            logging.disable(previous_disable_level)

    def _handle_metric_error(self, metric_name, error, switch_attr=None):
        if self.pynvmlLoaded:
            logger.warning(f'Could not get NVIDIA GPU {metric_name}; will retry. {error}')
            self._recover_nvidia_nvml(error)
            return

        logger.error(f'Could not get GPU {metric_name}. {error}')
        if switch_attr is not None:
            logger.error(f'Monitor of GPU {metric_name} is turning off.')
            setattr(self, switch_attr, False)

    def _recover_nvidia_nvml(self, error):
        if not self.pynvmlLoaded or self.pynvml is None:
            return False

        logger.debug(f'Attempting NVIDIA NVML recovery after monitoring error. {error}')
        try:
            self.pynvml.nvmlShutdown()
        except Exception:
            pass

        try:
            self.pynvml.nvmlInit()
            return True
        except Exception as recovery_error:
            logger.warning(f'Could not recover NVIDIA NVML monitoring yet. {recovery_error}')
            return False

    def _get_amdsmi_handles(self, log_failure=True):
        if not self.amdsmiLoaded or self.amdsmi is None:
            return self.amdsmiHandles or []

        if self.amdsmiHandles:
            return self.amdsmiHandles
        try:
            self.amdsmiHandles = self._quiet_external_logs(self.amdsmi.amdsmi_get_processor_handles)
            return self.amdsmiHandles
        except Exception as e:
            if log_failure:
                logger.debug(f'Could not get AMD SMI processor handles. {e}')
            return []

    def _get_amdsmi_handle(self, deviceIndex):
        handles = self._get_amdsmi_handles()
        if not handles:
            return None
        return handles[deviceIndex] if deviceIndex < len(handles) else handles[0]

    def _get_amdsmi_temperature(self, deviceIndex):
        handle = self._get_amdsmi_handle(deviceIndex)
        if handle is None:
            return None

        for temperature_type in (
            self.amdsmi.AmdSmiTemperatureType.EDGE,
            self.amdsmi.AmdSmiTemperatureType.HOTSPOT,
        ):
            try:
                temperature = self.amdsmi.amdsmi_get_temp_metric(
                    handle,
                    temperature_type,
                    self.amdsmi.AmdSmiTemperatureMetric.CURRENT,
                )
                return float(temperature) / 1000.0 if temperature > 1000 else float(temperature)
            except Exception as e:
                logger.warning(f'Could not get AMD SMI temperature metric {temperature_type}. {e}')

        return None

    def close(self):
        if self.jtopLoaded and self.jtopInstance is not None:
            self.jtopInstance.close()
        if self.amdsmiLoaded and self.amdsmi is not None:
            try:
                self.amdsmi.amdsmi_shut_down()
            except Exception:
                pass
