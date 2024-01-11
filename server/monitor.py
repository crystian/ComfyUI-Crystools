from server import PromptServer
from aiohttp import web
from ..core import logger
from ..general.monitor import cmonitor

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

            cmonitor.stats.switchCPU = switchCPU

        if 'switchGPU' in settings is not None:
            switchGPU = settings['switchGPU']
            if type(switchGPU) is not bool:
                raise Exception('switchGPU must be an boolean.')

            cmonitor.stats.switchGPU = switchGPU

        if 'switchHDD' in settings is not None:
            switchHDD = settings['switchHDD']
            if type(switchHDD) is not bool:
                raise Exception('switchHDD must be an boolean.')

            cmonitor.stats.switchHDD = switchHDD

        if 'switchRAM' in settings is not None:
            switchRAM = settings['switchRAM']
            if type(switchRAM) is not bool:
                raise Exception('switchRAM must be an boolean.')

            cmonitor.stats.switchRAM = switchRAM

        if 'switchVRAM' in settings is not None:
            switchVRAM = settings['switchVRAM']
            if type(switchVRAM) is not bool:
                raise Exception('switchVRAM must be an boolean.')

            cmonitor.stats.switchVRAM = switchVRAM

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
