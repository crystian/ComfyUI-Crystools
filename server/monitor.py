from server import PromptServer
from aiohttp import web
from ..core import logger
from ..general import cmonitor

@PromptServer.instance.routes.patch("/crystools/monitor")
async def newSettings(request):
    try:
        settings = await request.json()
        # print(settings)

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

            cmonitor.hardwareInfo.switchCPU = switchCPU

        if 'switchHDD' in settings is not None:
            switchHDD = settings['switchHDD']
            if type(switchHDD) is not bool:
                raise Exception('switchHDD must be an boolean.')

            cmonitor.hardwareInfo.switchHDD = switchHDD

        if 'switchRAM' in settings is not None:
            switchRAM = settings['switchRAM']
            if type(switchRAM) is not bool:
                raise Exception('switchRAM must be an boolean.')

            cmonitor.hardwareInfo.switchRAM = switchRAM

        if 'whichHDD' in settings is not None:
            whichHDD = settings['whichHDD']
            if type(whichHDD) is not str:
                raise Exception('whichHDD must be an string.')

            cmonitor.hardwareInfo.whichHDD = whichHDD


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


@PromptServer.instance.routes.get("/crystools/monitor/HDD")
def getHDDs(request):
    try:
        return web.json_response(cmonitor.hardwareInfo.getHDDsInfo())
    except Exception as e:
        logger.error(e)
        return web.Response(status=400, text=str(e))


@PromptServer.instance.routes.get("/crystools/monitor/GPU")
def getGPUs(request):
    try:
        gpuInfo = cmonitor.hardwareInfo.getGPUInfo()
        return web.json_response(gpuInfo)
    except Exception as e:
        logger.error(e)
        return web.Response(status=400, text=str(e))


@PromptServer.instance.routes.patch("/crystools/monitor/GPU/{index}")
async def getGPUs(request):
  try:
    index = request.match_info["index"]
    settings = await request.json()
    if 'utilization' in settings is not None:
      if type(settings['utilization']) is not bool:
        raise Exception('utilization must be an boolean.')

      cmonitor.hardwareInfo.GPUInfo.gpusUtilization[int(index)] = settings['utilization']

    if 'vram' in settings is not None:
      if type(settings['vram']) is not bool:
        raise Exception('vram must be an boolean.')

      cmonitor.hardwareInfo.GPUInfo.gpusVRAM[int(index)] = settings['vram']

    if 'temperature' in settings is not None:
      if type(settings['temperature']) is not bool:
        raise Exception('temperature must be an boolean.')

      cmonitor.hardwareInfo.GPUInfo.gpusTemperature[int(index)] = settings['temperature']

    return web.Response(status=200)
  except Exception as e:
    logger.error(e)
    return web.Response(status=400, text=str(e))
