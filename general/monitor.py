import asyncio
import server
import time
import threading
import psutil
import platform
import cpuinfo
import torch
import pynvml
from comfy.model_management import get_torch_device_name, get_torch_device

from ..core import logger

lock = threading.Lock()

class CMonitor:
    monitorThread = None
    threadController = threading.Event()
    rate = 0
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

    def __init__(self, rate=5, switchCPU=False, switchGPU=False, switchHDD=False, switchRAM=False, switchVRAM=False):
        self.rate = rate
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

        self.startMonitor()

    def buildMonitorData(self):
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
            hdd = psutil.disk_usage('/')
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

    async def send_message(self, data) -> None:
        # I'm not sure if it is ok, but works ¯\_(ツ)_/¯
        # I tried to use async with send_json, but eventually that don't send the message
        # await s.send_json('crystools.monitor', data)
        # lock.acquire()
        server.PromptServer.instance.send_sync('crystools.monitor', data)
        # lock.release()

    def monitorLoop(self):
        while self.rate > 0 and not self.threadController.is_set():
            data = self.buildMonitorData()
            asyncio.run(self.send_message(data))
            time.sleep(self.rate)

    def startMonitor(self):
        if self.monitorThread is not None:
            self.stopMonitor()
            logger.debug('Restarting monitor...')
        else:
            if self.rate == 0:
                logger.debug('Monitor rate is 0, not starting monitor.')
                return None

            logger.debug('Starting monitor...')

        if self.pynvmlLoaded and pynvml.nvmlDeviceGetCount() > 0:
            self.cudaDevicesFound = pynvml.nvmlDeviceGetCount()
            self.nvidia = True
            logger.info(f'NVIDIA Driver detected - {pynvml.nvmlSystemGetDriverVersion()} - {get_torch_device_name(get_torch_device())}')
        else:
            logger.warn('No NVIDIA GPU detected.')

        try:
            self.torchDevice = get_torch_device_name(get_torch_device())
        except Exception as e:
            logger.error('Could not pick default device.' + str(e))

        self.cudaDevice = 'cpu' if self.torchDevice == 'cpu' else 'cuda'
        self.cudaAvailable = torch.cuda.is_available()

        if self.nvidia and self.cudaAvailable and self.torchDevice == 'cpu':
            logger.warn('CUDA is available, but torch is using CPU.')

        self.threadController.clear()

        if self.monitorThread is None or not self.monitorThread.is_alive():
            lock.acquire()
            self.monitorThread = threading.Thread(target=self.monitorLoop)
            lock.release()
            self.monitorThread.daemon = True
            self.monitorThread.start()


    def stopMonitor(self):
        logger.debug('Stopping monitor...')
        self.threadController.set()


cmonitor = CMonitor(1, True, True, True, True, True)

