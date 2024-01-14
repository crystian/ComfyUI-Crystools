import platform
import cpuinfo
import psutil
import torch
import pynvml
import comfy.model_management

from ..core import logger


class CStats:
    """
    This is only class to get information from hardware.
    Specially for share it to other software.
    """
    nvidia = False
    pynvmlLoaded = False
    cudaAvailable = False
    torchDevice = 'cpu'
    cudaDevice = 'cpu'
    cudaDevicesFound = 0
    switchCPU = False
    switchGPU = False
    switchHDD = False
    switchRAM = False
    switchVRAM = False
    whichHDD = 'C:\\'

    def __init__(self, switchCPU=False, switchGPU=False, switchHDD=False, switchRAM=False, switchVRAM=False):
        self.switchCPU = switchCPU
        self.switchGPU = switchGPU
        self.switchHDD = switchHDD
        self.switchRAM = switchRAM
        self.switchVRAM = switchVRAM

        specName = 'CPU: ' + cpuinfo.get_cpu_info().get('brand_raw', "Unknown")
        specArch = 'Arch: ' + cpuinfo.get_cpu_info().get('arch_string_raw', "Unknown")
        specOs = 'OS: ' + str(platform.system()) + ' ' + str(platform.release())
        logger.info(f"{specName} - {specArch} - {specOs}")

        try:
            pynvml.nvmlInit()
            self.pynvmlLoaded = True
        except Exception as e:
            self.pynvmlLoaded = False
            logger.error('Could not init pynvml.' + str(e))

        self.diagnostic()

    def buildStatsData(self):
        cpu = -1
        ramTotal = -1
        ramUsed = -1
        ramUsedPercent = -1
        hddTotal = -1
        hddUsed = -1
        hddUsedPercent = -1
        gpuUtilization = -1
        vramUsed = -1
        vramTotal = -1
        vramPercent = -1

        if self.switchCPU:
            cpu = psutil.cpu_percent()

        if self.switchRAM:
            ram = psutil.virtual_memory()
            ramTotal = ram.total
            ramUsed = ram.used
            ramUsedPercent = ram.percent

        if self.switchHDD:
            hdd = psutil.disk_usage(self.whichHDD)
            hddTotal = hdd.total
            hddUsed = hdd.used
            hddUsedPercent = hdd.percent

        deviceType = 'cpu'
        gpus = []

        if self.cudaDevice == 'cpu':
            gpus.append({
                'gpu_utilization': -1,
                'vram_total': -1,
                'vram_used': -1,
                'vram_used_percent': -1,
            })
        else:
            deviceType = self.cudaDevice

            if self.pynvmlLoaded and self.nvidia and self.cudaAvailable:
                for deviceIndex in range(self.cudaDevicesFound):
                    deviceHandle = pynvml.nvmlDeviceGetHandleByIndex(deviceIndex)

                    # GPU Utilization
                    if self.switchGPU:
                        utilization = pynvml.nvmlDeviceGetUtilizationRates(deviceHandle)
                        gpuUtilization = utilization.gpu

                    # VRAM
                    if self.switchVRAM:
                        # Torch or pynvml?, pynvml is more accurate with the system, torch is more accurate with comfyUI
                        memory = pynvml.nvmlDeviceGetMemoryInfo(deviceHandle)
                        vramUsed = memory.used
                        vramTotal = memory.total

                        # device = torch.device(deviceType)
                        # vramUsed = torch.cuda.memory_allocated(device)
                        # vramTotal = torch.cuda.get_device_properties(device).total_memory

                        vramPercent = vramUsed / vramTotal * 100

                    gpus.append({
                        'gpu_utilization': gpuUtilization,
                        'vram_total': vramTotal,
                        'vram_used': vramUsed,
                        'vram_used_percent': vramPercent,
                    })

        return {
            'cpu_utilization': cpu,
            'ram_total': ramTotal,
            'ram_used': ramUsed,
            'ram_used_percent': ramUsedPercent,
            'hdd_total': hddTotal,
            'hdd_used': hddUsed,
            'hdd_used_percent': hddUsedPercent,
            'device_type': deviceType,
            'gpus': gpus,
        }

    def diagnostic(self):
        if self.pynvmlLoaded and pynvml.nvmlDeviceGetCount() > 0:
            self.cudaDevicesFound = pynvml.nvmlDeviceGetCount()
            self.nvidia = True
            logger.info(f'NVIDIA Driver detected - {pynvml.nvmlSystemGetDriverVersion()} - {comfy.model_management.get_torch_device_name(comfy.model_management.get_torch_device())}')
        else:
            logger.warn('No NVIDIA GPU detected.')

        try:
            self.torchDevice = comfy.model_management.get_torch_device_name(comfy.model_management.get_torch_device())
        except Exception as e:
            logger.error('Could not pick default device.' + str(e))

        self.cudaDevice = 'cpu' if self.torchDevice == 'cpu' else 'cuda'
        self.cudaAvailable = torch.cuda.is_available()

        if self.nvidia and self.cudaAvailable and self.torchDevice == 'cpu':
            logger.warn('CUDA is available, but torch is using CPU.')
