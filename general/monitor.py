import asyncio
import server
import time
import threading
from .stats import CStats

from ..core import logger

# lock = threading.Lock()


class CMonitor:
    monitorThread = None
    threadController = threading.Event()
    rate = 0
    stats = None

    def __init__(self, rate=5, switchCPU=False, switchGPU=False, switchHDD=False, switchRAM=False, switchVRAM=False):
        self.rate = rate
        self.stats = CStats(switchCPU, switchGPU, switchHDD, switchRAM, switchVRAM)
        self.stats.diagnostic()
        
        self.startMonitor()

    async def send_message(self, data) -> None:
        # I'm not sure if it is ok, but works ¯\_(ツ)_/¯
        # I tried to use async with send_json, but eventually that don't send the message
        # await s.send_json('crystools.monitor', data)
        # lock.acquire()
        server.PromptServer.instance.send_sync('crystools.monitor', data)
        # lock.release()

    def monitorLoop(self):
        while self.rate > 0 and not self.threadController.is_set():
            data = self.stats.buildStatsData()
            # print(data)
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

        self.threadController.clear()

        if self.monitorThread is None or not self.monitorThread.is_alive():
            self.monitorThread = threading.Thread(target=self.monitorLoop)
            self.monitorThread.daemon = True
            self.monitorThread.start()


    def stopMonitor(self):
        logger.debug('Stopping monitor...')
        self.threadController.set()


cmonitor = CMonitor(1, True, True, True, True, True)

