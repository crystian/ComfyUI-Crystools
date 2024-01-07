import asyncio
import server
import time
import threading
import psutil
import torch
import pynvml
from comfy.model_management import get_torch_device_name, get_torch_device
from ..core import logger


class CMonitor:
    monitorThread = None
    frequency = 0
    nvidia = False
    cudaAvailable = False
    torchDevice = 'cpu'
    cudaDevice = 'cpu'

    # TODO: fixed to first device
    deviceIndex = 0

    def __init__(self, frequency=10):
        self.frequency = frequency
        pynvml.nvmlInit()
        self.startMonitor()

    def buildMonitorData(self):
        cpu = psutil.cpu_percent()
        ram = psutil.virtual_memory()
        hdd = psutil.disk_usage('/')
        deviceType = 'cpu'
        gpuUtilization = -1
        vramUsed = -1
        vramTotal = -1
        vramPercent = -1

        if self.cudaDevice != 'cpu':
            deviceType = self.cudaDevice
            device = torch.device(deviceType)

            if self.nvidia and self.cudaAvailable:
                deviceHandle = pynvml.nvmlDeviceGetHandleByIndex(self.deviceIndex)
                # GPU
                utilization = pynvml.nvmlDeviceGetUtilizationRates(deviceHandle)
                gpuUtilization = utilization.gpu

                # VRAM
                # Torch or pynvml?, pynvml is more accurate with the system, torch is more accurate with comfyUI
                memory = pynvml.nvmlDeviceGetMemoryInfo(deviceHandle)
                vramUsed = memory.used
                vramTotal = memory.total

                # vramUsed = torch.cuda.memory_allocated(device)
                # vramTotal = torch.cuda.get_device_properties(device).total_memory

                vramPercent = vramUsed / vramTotal * 100

        return {
            'ram_used': ram.used,
            'ram_total': ram.total,
            'ram_used_percent': round(ram.percent, 2),
            'cpu_utilization': cpu,
            'hdd_used': hdd.used,
            'hdd_total': hdd.total,
            'hdd_used_percent': round(hdd.percent, 2),
            'device_type': deviceType,
            'gpu_utilization': gpuUtilization,
            'vram_used': vramUsed,
            'vram_total': vramTotal,
            'vram_used_percent': round(vramPercent, 2),
        }


    async def send_message(self, data) -> None:
        s = server.PromptServer.instance
        # logger.debug(f'Sending message... {data}')
        await s.send_json('crystools.monitor', data)

    def monitorLoop(self):
        while self.frequency > 0:
            asyncio.run(self.send_message(self.buildMonitorData()))
            time.sleep(self.frequency)

    def startMonitor(self):
        if self.monitorThread is not None:
            logger.info('Restarting monitor...')
            self.stopMonitor()
        else:
            logger.info('Starting monitor...')

        if pynvml.nvmlDeviceGetCount() > 0:
            self.nvidia = True
            logger.info(f'NVIDIA Driver detected - {pynvml.nvmlSystemGetDriverVersion()}')
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

        monitorThread = threading.Thread(target=self.monitorLoop)
        # monitorThread.set()
        monitorThread.daemon = True
        monitorThread.start()

    def stopMonitor(self):
        logger.debug('Stopping monitor...')
        # monitorThread.stop()


cmonitor = CMonitor(3)
