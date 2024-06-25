import torch
import pynvml
import comfy.model_management
from ..core import logger

class CGPUInfo:
    """
    This class is responsible for getting information from GPU (ONLY).
    """
    cuda = False
    pynvmlLoaded = False
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
        except Exception as e:
            self.pynvmlLoaded = False
            logger.error('Could not init pynvml.' + str(e))

        if self.pynvmlLoaded and pynvml.nvmlDeviceGetCount() > 0:
            self.cudaDevicesFound = pynvml.nvmlDeviceGetCount()

            logger.info(f"GPU/s:")

            # for simulate multiple GPUs (for testing) interchange these comments:
            # for deviceIndex in range(3):
            #   deviceHandle = pynvml.nvmlDeviceGetHandleByIndex(0)
            for deviceIndex in range(self.cudaDevicesFound):
                deviceHandle = pynvml.nvmlDeviceGetHandleByIndex(deviceIndex)

                try:
                    gpuName = pynvml.nvmlDeviceGetName(deviceHandle).decode('utf-8', errors='ignore')
                except UnicodeDecodeError as e:
                    gpuName = 'Unknown GPU (decoding error)'
                    print(f"UnicodeDecodeError: {e}")

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
            logger.info(f'NVIDIA Driver: {pynvml.nvmlSystemGetDriverVersion()}')
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

            if self.pynvmlLoaded and self.cuda and self.cudaAvailable:
                # for simulate multiple GPUs (for testing) interchange these comments:
                # for deviceIndex in range(3):
                #   deviceHandle = pynvml.nvmlDeviceGetHandleByIndex(0)
                for deviceIndex in range(self.cudaDevicesFound):
                    deviceHandle = pynvml.nvmlDeviceGetHandleByIndex(deviceIndex)

                    gpuUtilization = 0
                    vramPercent = 0
                    vramUsed = 0
                    vramTotal = 0
                    gpuTemperature = 0

                    # GPU Utilization
                    if self.switchGPU and self.gpusUtilization[deviceIndex]:
                        try:
                            utilization = pynvml.nvmlDeviceGetUtilizationRates(deviceHandle)
                            gpuUtilization = utilization.gpu
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
                        memory = pynvml.nvmlDeviceGetMemoryInfo(deviceHandle)
                        vramUsed = memory.used
                        vramTotal = memory.total

                        # device = torch.device(gpuType)
                        # vramUsed = torch.cuda.memory_allocated(device)
                        # vramTotal = torch.cuda.get_device_properties(device).total_memory

                        vramPercent = vramUsed / vramTotal * 100

                    # Temperature
                    if self.switchTemperature and self.gpusTemperature[deviceIndex]:
                        try:
                            gpuTemperature = pynvml.nvmlDeviceGetTemperature(deviceHandle, 0)
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
