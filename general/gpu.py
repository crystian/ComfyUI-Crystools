import torch
import pynvml
import pyamdgpuinfo
import comfy.model_management

from ..core import logger

# could not put amdsmi in requirements.txt, user need to install it manually
from importlib.util import find_spec
if find_spec('amdsmi') is not None:
    import amdsmi

class CGPUInfo:
    """
    This class is responsible for getting information from GPU (ONLY).
    """
    cuda = False
    pynvmlLoaded = False
    amdsmiLoaded = False
    pyamdLoaded = False
    anygpuLoaded = False
    needRefresh = False
    cudaAvailable = False
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

    def __init__(self):
        try:
            pynvml.nvmlInit()
            self.pynvmlLoaded = True
            logger.info('pynvml initialized.')
        except Exception as e:
            logger.error('Could not init pynvml.' + str(e))

        if not self.pynvmlLoaded:
            try:
                amdsmi.amdsmi_init()
                self.amdsmiLoaded = True
                self.needRefresh = True # bug in amdsmi
                logger.info('amdsmi initialized.')
            except Exception as e:
                logger.error('Could not init amdsmi.' + str(e))

        if not self.pynvmlLoaded and not self.amdsmiLoaded:
            try:
                count = pyamdgpuinfo.detect_gpus()
                if count > 0:
                    self.pyamdLoaded = True
                    logger.info('pyamdgpuinfo initialized.')
                else:
                    # throw error
                    raise AssertionError('No AMD GPUs found.')
            except Exception as e:
                logger.error('Could not init pyamdgpuinfo.' + str(e))

        self.anygpuLoaded = self.pynvmlLoaded or self.amdsmiLoaded or self.pyamdLoaded

        if self.anygpuLoaded and self.deviceGetCount() > 0:
            self.cudaDevicesFound = self.deviceGetCount()

            logger.info(f"GPU/s:")

            # for simulate multiple GPUs (for testing) interchange these comments:
            # for deviceIndex in range(3):
            #     deviceHandle = pynvml.nvmlDeviceGetHandleByIndex(0)
            for deviceIndex in range(self.cudaDevicesFound):
                deviceHandle = self.deviceGetHandleByIndex(deviceIndex)

                gpuName = self.deviceGetName(deviceHandle, deviceIndex)

                logger.info(f"{deviceIndex}) {gpuName}")

                self.gpus.append({
                    'index': deviceIndex,
                    'name': gpuName,
                })

                # same index as gpus, with default values
                self.gpusUtilization.append(True)
                self.gpusVRAM.append(True)
                self.gpusTemperature.append(True)

            self.cuda = True
            logger.info(self.systemGetDriverVersion())
        else:
            logger.warn('No GPU with CUDA detected.')

        try:
            self.torchDevice = comfy.model_management.get_torch_device_name(comfy.model_management.get_torch_device())
        except Exception as e:
            logger.error('Could not pick default device.' + str(e))

        self.cudaDevice = 'cpu' if self.torchDevice == 'cpu' else 'cuda'
        self.cudaAvailable = torch.cuda.is_available()

        if self.cuda and self.cudaAvailable and self.torchDevice == 'cpu':
            logger.warn('CUDA is available, but torch is using CPU.')

    def getInfo(self):
        logger.debug('Getting GPUs info...')
        return self.gpus

    def getStatus(self):
        # logger.debug('CGPUInfo getStatus')
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
                'gpu_utilization': 0,
                'gpu_temperature': 0,
                'vram_total': 0,
                'vram_used': 0,
                'vram_used_percent': 0,
            })
        else:
            gpuType = self.cudaDevice

            if self.anygpuLoaded and self.cuda and self.cudaAvailable:
                if self.needRefresh:
                    self.reInit()

                # for simulate multiple GPUs (for testing) interchange these comments:
                # for deviceIndex in range(3):
                #     deviceHandle = pynvml.nvmlDeviceGetHandleByIndex(0)
                for deviceIndex in range(self.cudaDevicesFound):
                    deviceHandle = self.deviceGetHandleByIndex(deviceIndex)

                    gpuUtilization = 0
                    vramPercent = 0
                    vramUsed = 0
                    vramTotal = 0
                    gpuTemperature = 0

                    # GPU Utilization
                    if self.switchGPU and self.gpusUtilization[deviceIndex]:
                        try:
                            gpuUtilization = self.deviceGetUtilizationRates(deviceHandle)
                        except Exception as e:
                            if str(e) == "Unknown Error":
                                logger.error('For some reason, pynvml is not working in a laptop with only battery, try to connect and turn on the monitor')
                            else:
                                logger.error('Could not get GPU utilization.' + str(e))

                            logger.error('Monitor of GPU is turning off (not on UI!)')
                            self.switchGPU = False

                    # VRAM
                    if self.switchVRAM and self.gpusVRAM[deviceIndex]:
                        # Torch or pynvml?, pynvml is more accurate with the system, torch is more accurate with comfyUI
                        memory = self.deviceGetMemoryInfo(deviceHandle)
                        vramUsed = memory['used']
                        vramTotal = memory['total']

                        # device = torch.device(gpuType)
                        # vramUsed = torch.cuda.memory_allocated(device)
                        # vramTotal = torch.cuda.get_device_properties(device).total_memory

                        # check if vramTotal is not zero or None
                        if vramTotal and vramTotal != 0:
                            vramPercent = vramUsed / vramTotal * 100

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
            return pynvml.nvmlDeviceGetCount()
        elif self.amdsmiLoaded:
            return len(amdsmi.amdsmi_get_processor_handles())
        elif self.pyamdLoaded:
            return pyamdgpuinfo.detect_gpus()
        else:
            return 0

    def deviceGetHandleByIndex(self, index):
        if self.pynvmlLoaded:
            return pynvml.nvmlDeviceGetHandleByIndex(index)
        elif self.amdsmiLoaded:
            return amdsmi.amdsmi_get_processor_handles()[index]
        elif self.pyamdLoaded:
            return pyamdgpuinfo.get_gpu(index)
        else:
            return 0

    def deviceGetName(self, deviceHandle, deviceIndex):
        if self.pynvmlLoaded:
            return pynvml.nvmlDeviceGetName(deviceHandle)
        # amdsmi give no specific device name for AMD non-enterprise cards (only "NAVI22"), get from torch while it might be wrong
        elif self.amdsmiLoaded:
            return torch.cuda.get_device_name(deviceIndex)
        elif self.pyamdLoaded:
            return deviceHandle.name if deviceHandle else 'Generic AMD GPU'
        else:
            return ''

    def systemGetDriverVersion(self):
        if self.pynvmlLoaded:
            return f'NVIDIA Driver: {pynvml.nvmlSystemGetDriverVersion()}'
        elif self.amdsmiLoaded:
            device = amdsmi.amdsmi_get_processor_handles()[0]
            return f"AMD Driver: {amdsmi.amdsmi_get_gpu_driver_info(device)['driver_version']}"
        elif self.pyamdLoaded:
            return f'AMD Driver: unknown' # pyamdgpuinfo not supported
        else:
            return 'Driver unknown'

    def deviceGetUtilizationRates(self, deviceHandle):
        if self.pynvmlLoaded:
            return pynvml.nvmlDeviceGetUtilizationRates(deviceHandle).gpu
        elif self.amdsmiLoaded:
            return amdsmi.amdsmi_get_gpu_activity(deviceHandle)['gfx_activity']
        elif self.pyamdLoaded:
            return deviceHandle.query_load() * 100
        else:
            return 0

    def deviceGetMemoryInfo(self, deviceHandle):
        if self.pynvmlLoaded:
            mem = pynvml.nvmlDeviceGetMemoryInfo(deviceHandle)
            return {'total': mem.total, 'used': mem.used}
        elif self.amdsmiLoaded:
            mem_used = amdsmi.amdsmi_get_gpu_memory_usage(deviceHandle, amdsmi.AmdSmiMemoryType.VRAM)
            mem_total = amdsmi.amdsmi_get_gpu_memory_total(deviceHandle, amdsmi.AmdSmiMemoryType.VRAM)
            return {'total': mem_total, 'used': mem_used}
        elif self.pyamdLoaded:
            mem_used = deviceHandle.query_vram_usage()
            mem_total = deviceHandle.memory_info["vram_size"]
            return {'total': mem_total, 'used': mem_used}
        else:
            return {'total': 1, 'used': 1}

    def deviceGetTemperature(self, deviceHandle):
        if self.pynvmlLoaded:
            return pynvml.nvmlDeviceGetTemperature(deviceHandle, pynvml.NVML_TEMPERATURE_GPU)
        elif self.amdsmiLoaded:
            return amdsmi.amdsmi_get_temp_metric(deviceHandle, amdsmi.AmdSmiTemperatureType.JUNCTION, amdsmi.AmdSmiTemperatureMetric.CURRENT)
        elif self.pyamdLoaded:
            return deviceHandle.query_temperature()
        else:
            return 0

    def reInit(self):
        if self.pynvmlLoaded:
            pynvml.nvmlShutdown()
            pynvml.nvmlInit()
        elif self.amdsmiLoaded:
            amdsmi.amdsmi_shut_down()
            amdsmi.amdsmi_init()
