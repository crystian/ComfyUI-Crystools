import torch
import comfy.model_management
from ..core import logger
import os
import platform

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
    except Exception as e:
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
    Supports both AMD (via rocm-smi) and NVIDIA (via pynvml) GPUs.
    """
    cuda = False
    rocm = False
    pynvmlLoaded = False
    jtopLoaded = False
    cudaAvailable = False
    rocmAvailable = False
    torchDevice = 'cpu'
    cudaDevice = 'cpu'
    cudaDevicesFound = 0
    switchGPU = True
    switchVRAM = True
    switchTemperature = True
    gpus = []
    gpusUtilization = []
    gpusVRAM = []
    gpusTemperature = []
    gpuVendor = 'unknown'  # 'nvidia', 'amd', or 'unknown'

    def __init__(self):
        if IS_JETSON:
            # Try to import jtop for Jetson devices
            try:
                from jtop import jtop
                self.jtopInstance = jtop()
                self.jtopInstance.start()
                self.jtopLoaded = True
                self.gpuVendor = 'nvidia'
                logger.info('jtop initialized on Jetson device.')
            except ImportError as e:
                logger.error('jtop is not installed. ' + str(e))
            except Exception as e:
                logger.error('Could not initialize jtop. ' + str(e))
        else:
            # Try NVIDIA first
            try:
                import pynvml
                self.pynvml = pynvml
                self.pynvml.nvmlInit()
                # Check if NVIDIA GPUs are actually available
                device_count = self.pynvml.nvmlDeviceGetCount()
                if device_count and device_count > 0:
                    self.pynvmlLoaded = True
                    self.gpuVendor = 'nvidia'
                    logger.info('pynvml (NVIDIA) initialized.')
                else:
                    logger.debug('No NVIDIA GPUs detected.')
            except ImportError as e:
                logger.debug('pynvml is not installed. ' + str(e))
            except Exception as e:
                logger.debug('Could not init pynvml (NVIDIA). ' + str(e))

            # If NVIDIA not available, try to detect AMD GPUs using pyrsmi
            if self.gpuVendor != 'nvidia':
                try:
                    from pyrsmi import rocml
                    rocml.smi_initialize()
                    logger.debug('pyrsmi initialized')
                    device_count = rocml.smi_get_device_count()
                    logger.debug(f'pyrsmi device count: {device_count}')
                    if device_count and device_count > 0:
                        self.rocml = rocml
                        self.rocmAvailable = True
                        self.gpuVendor = 'amd'
                        logger.info(f'AMD ROCm detected via pyrsmi ({device_count} GPU(s)).')
                    else:
                        logger.debug(f'No AMD GPUs detected (device_count={device_count})')
                        rocml.smi_shutdown()
                except ImportError as e:
                    logger.debug(f'pyrsmi is not installed: {e}')
                except Exception as e:
                    logger.error(f'Could not detect AMD GPU via pyrsmi: {e}')

        self.anygpuLoaded = self.pynvmlLoaded or self.jtopLoaded or self.rocmAvailable

        try:
            self.torchDevice = comfy.model_management.get_torch_device_name(comfy.model_management.get_torch_device())
        except Exception as e:
            logger.error('Could not pick default device. ' + str(e))

        if (self.pynvmlLoaded or self.rocmAvailable) and not self.jtopLoaded and not self.deviceGetCount():
            logger.warning('No GPU detected, disabling GPU monitoring.')
            self.anygpuLoaded = False
            self.pynvmlLoaded = False
            self.rocmAvailable = False

        if self.anygpuLoaded:
            if self.deviceGetCount() > 0:
                self.cudaDevicesFound = self.deviceGetCount()

                logger.info(f"GPU/s:")

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

                self.cuda = self.pynvmlLoaded or self.jtopLoaded
                self.rocm = self.rocmAvailable
                logger.info(self.systemGetDriverVersion())
            else:
                logger.warning('No GPU with CUDA/ROCm detected.')
        else:
            logger.warning('No GPU monitoring libraries available.')

        self.cudaDevice = 'cpu' if self.torchDevice == 'cpu' else ('cuda' if self.cuda else 'rocm' if self.rocm else 'cpu')
        self.cudaAvailable = torch.cuda.is_available()
        
        # Check for ROCm availability (torch uses 'cuda' for both CUDA and ROCm)
        if torch.cuda.is_available() and self.rocm:
            self.rocmAvailable = True

        if (self.cuda or self.rocm) and self.cudaAvailable and self.torchDevice == 'cpu':
            logger.warning('GPU is available, but torch is using CPU.')

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

            if self.anygpuLoaded and (self.cuda or self.rocm) and (self.cudaAvailable or self.rocmAvailable):
                for deviceIndex in range(self.cudaDevicesFound):
                    deviceHandle = self.deviceGetHandleByIndex(deviceIndex)

                    gpuUtilization = -1
                    vramPercent = -1
                    vramUsed = -1
                    vramTotal = -1
                    gpuTemperature = -1

                    # GPU Utilization
                    if self.switchGPU and self.gpusUtilization[deviceIndex]:
                        try:
                            gpuUtilization = self.deviceGetUtilizationRates(deviceHandle)
                        except Exception as e:
                            logger.error('Could not get GPU utilization. ' + str(e))
                            logger.error('Monitor of GPU is turning off.')
                            self.switchGPU = False

                    if self.switchVRAM and self.gpusVRAM[deviceIndex]:
                        try:
                            memory = self.deviceGetMemoryInfo(deviceHandle)
                            vramUsed = memory['used']
                            vramTotal = memory['total']

                            # Check if vramTotal is not zero or None
                            if vramTotal and vramTotal != 0:
                                vramPercent = vramUsed / vramTotal * 100
                        except Exception as e:
                            logger.error('Could not get GPU memory info. ' + str(e))
                            self.switchVRAM = False

                    # Temperature
                    if self.switchTemperature and self.gpusTemperature[deviceIndex]:
                        try:
                            gpuTemperature = self.deviceGetTemperature(deviceHandle)
                        except Exception as e:
                            logger.error('Could not get GPU temperature. Turning off this feature. ' + str(e))
                            self.switchTemperature = False

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

    def deviceGetCount(self):
        if self.pynvmlLoaded:
            return self.pynvml.nvmlDeviceGetCount()
        elif self.rocmAvailable:
            return self.rocml.smi_get_device_count()
        elif self.jtopLoaded:
            # For Jetson devices, we assume there's one GPU
            return 1
        else:
            return 0

    def deviceGetHandleByIndex(self, index):
        if self.pynvmlLoaded:
            return self.pynvml.nvmlDeviceGetHandleByIndex(index)
        elif self.rocmAvailable:
            # For AMD, the device index itself acts as the handle
            return index
        elif self.jtopLoaded:
            return index  # On Jetson, index acts as handle
        else:
            return 0

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

            return gpuName
        elif self.rocmAvailable:
            try:
                return self.rocml.smi_get_device_name(deviceIndex)
            except Exception as e:
                logger.debug('Could not get AMD GPU name. ' + str(e))
                return f'AMD GPU {deviceIndex}'
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
        elif self.rocmAvailable:
            version = self.rocml.smi_get_kernel_version()
            return f'AMD ROCm Driver: {version}'
        elif self.jtopLoaded:
            # No direct method to get driver version from jtop
            return 'NVIDIA Driver: unknown'
        else:
            return 'Driver unknown'

    def deviceGetUtilizationRates(self, deviceHandle):
        if self.pynvmlLoaded:
            return self.pynvml.nvmlDeviceGetUtilizationRates(deviceHandle).gpu
        elif self.rocmAvailable:
            try:
                return self.rocml.smi_get_device_utilization(deviceHandle)
            except Exception as e:
                logger.debug('Could not get AMD GPU utilization. ' + str(e))
                return -1
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
        elif self.rocmAvailable:
            try:
                total = self.rocml.smi_get_device_memory_total(deviceHandle)
                used = self.rocml.smi_get_device_memory_used(deviceHandle)
                return {'total': total, 'used': used}
            except Exception as e:
                logger.debug('Could not get AMD GPU memory info. ' + str(e))
                return {'total': 1, 'used': 1}
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
        elif self.rocmAvailable:
            # AMD ROCm temperature reading is not available via pyrsmi, returning -1 to disable it
            return -1
        elif self.jtopLoaded:
            try:
                temperature = self.jtopInstance.stats.get('Temp gpu', -1)
                return temperature
            except Exception as e:
                logger.error('Could not get GPU temperature. ' + str(e))
                return -1
        else:
            return -1

    def close(self):
        if self.jtopLoaded and self.jtopInstance is not None:
            self.jtopInstance.close()
        if self.rocmAvailable and hasattr(self, 'rocml'):
            self.rocml.smi_shutdown()
