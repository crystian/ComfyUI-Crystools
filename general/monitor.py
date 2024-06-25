import asyncio
import server
import time
import threading
from .hardware import CHardwareInfo

from ..core import logger

lock = threading.Lock()


class CMonitor:
    monitorThread = None
    threadController = threading.Event()
    rate = 0
    hardwareInfo = None

    def __init__(self, rate=5, switchCPU=False, switchGPU=False, switchHDD=False, switchRAM=False, switchVRAM=False):
        self.rate = rate
        self.hardwareInfo = CHardwareInfo(switchCPU, switchGPU, switchHDD, switchRAM, switchVRAM)

        self.startMonitor()

    async def send_message(self, data) -> None:
      # I'm not sure if it is ok, but works ¯\_(ツ)_/¯
      # I tried to use async with send_json, but eventually that don't send the message
      server.PromptServer.instance.send_sync('crystools.monitor', data)

    def startMonitorLoop(self):
      # logger.debug('Starting monitor loop...')
      asyncio.run(self.MonitorLoop())

    async def MonitorLoop(self):
        while self.rate > 0 and not self.threadController.is_set():
            data = self.hardwareInfo.getStatus()
            # logger.debug('data to send' + str(data))
            await self.send_message(data)
            await asyncio.sleep(self.rate)

    def startMonitor(self):
        if self.monitorThread is not None:
            self.stopMonitor()
            logger.debug('Restarting monitor...')
        else:
            if self.rate == 0:
                logger.debug('Monitor rate is 0, not starting monitor.')
                return None

            logger.debug('Starting monitor...')

        self.threadController.clear()

        if self.monitorThread is None or not self.monitorThread.is_alive():
            lock.acquire()
            self.monitorThread = threading.Thread(target=self.startMonitorLoop)
            lock.release()
            self.monitorThread.daemon = True
            self.monitorThread.start()


    def stopMonitor(self):
        logger.debug('Stopping monitor...')
        self.threadController.set()


cmonitor = CMonitor(1, True, True, True, True, True)

