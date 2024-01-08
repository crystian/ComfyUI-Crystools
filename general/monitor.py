import asyncio
import server
import time
import threading
import psutil
import torch
import pynvml
from comfy.model_management import get_torch_device_name, get_torch_device
from server import PromptServer
from aiohttp import web
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
        s = server.PromptServer.instance
        # logger.debug(f'Sending message... {data}')
        await s.send_json('crystools.monitor', data)

    def monitorLoop(self):
        while self.rate > 0 and not self.threadController.is_set():
            lock.acquire()
            asyncio.run(self.send_message(self.buildMonitorData()))
            lock.release()
            time.sleep(self.rate)

    def startMonitor(self):
        if self.monitorThread is not None:
            self.stopMonitor()
            logger.info('Restarting monitor...')
        else:
            if self.rate == 0:
                logger.debug('Monitor rate is 0, not starting monitor.')
                return None

            logger.info('Starting monitor...')

        if self.pynvmlLoaded and pynvml.nvmlDeviceGetCount() > 0:
            self.cudaDevicesFound = pynvml.nvmlDeviceGetCount()
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

        self.threadController.clear()

        if self.monitorThread is None or not self.monitorThread.is_alive():
            self.monitorThread = threading.Thread(target=self.monitorLoop)
            self.monitorThread.daemon = True
            self.monitorThread.start()


    def stopMonitor(self):
        logger.debug('Stopping monitor...')
        self.threadController.set()


cmonitor = CMonitor(1, True, True, True, True, True)


@PromptServer.instance.routes.patch("/crystools/monitor")
async def newSettings(request):
    try:
        settings = await request.json()

        if 'rate' in settings is not None:
            rate = settings['rate']
            if type(rate) is not int and type(rate) is not float:
                raise Exception('Rate must be an number.')

            if cmonitor.rate == 0 and rate > 0:
                cmonitor.rate = rate
                cmonitor.startMonitor()
            else:
                cmonitor.rate = rate


        if 'switchCPU' in settings is not None:
            switchCPU = settings['switchCPU']
            if type(switchCPU) is not bool:
                raise Exception('switchCPU must be an boolean.')

            cmonitor.switchCPU = switchCPU

        if 'switchGPU' in settings is not None:
            switchGPU = settings['switchGPU']
            if type(switchGPU) is not bool:
                raise Exception('switchGPU must be an boolean.')

            cmonitor.switchGPU = switchGPU

        if 'switchHDD' in settings is not None:
            switchHDD = settings['switchHDD']
            if type(switchHDD) is not bool:
                raise Exception('switchHDD must be an boolean.')

            cmonitor.switchHDD = switchHDD

        if 'switchRAM' in settings is not None:
            switchRAM = settings['switchRAM']
            if type(switchRAM) is not bool:
                raise Exception('switchRAM must be an boolean.')

            cmonitor.switchRAM = switchRAM

        if 'switchVRAM' in settings is not None:
            switchVRAM = settings['switchVRAM']
            if type(switchVRAM) is not bool:
                raise Exception('switchVRAM must be an boolean.')

            cmonitor.switchVRAM = switchVRAM

        return web.Response(status=200)
    except Exception as e:
        logger.error(e)
        return web.Response(status=400, text=str(e))


@PromptServer.instance.routes.post("/crystools/monitor/switch")
async def monitorSwitch(request):
    try:
        switch = await request.json()

        if 'monitor' in switch is not None:
            monitor = switch['monitor']
            if type(monitor) is not bool:
                raise Exception('monitor must be an boolean.')

            if monitor:
                cmonitor.startMonitor()
            else:
                cmonitor.stopMonitor()

        return web.Response(status=200)
    except Exception as e:
        logger.error(e)
        return web.Response(status=400, text=str(e))
