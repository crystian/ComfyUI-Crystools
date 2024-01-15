import platform
import cpuinfo
import psutil
from .gpu import CGPUInfo
from .hdd import getDrivesInfo

from ..core import logger


class CHardwareInfo:
    """
    This is only class to get information from hardware.
    Specially for share it to other software.
    """
    switchCPU = False
    switchHDD = False
    switchRAM = False
    whichHDD = '/' # breaks linux

    @property
    def switchGPU(self):
        return self.GPUInfo.switchGPU
    @switchGPU.setter
    def switchGPU(self, value):
        self.GPUInfo.switchGPU = value

    @property
    def switchVRAM(self):
        return self.GPUInfo.switchVRAM
    @switchVRAM.setter
    def switchVRAM(self, value):
        self.GPUInfo.switchVRAM = value

    def __init__(self, switchCPU=False, switchGPU=False, switchHDD=False, switchRAM=False, switchVRAM=False):
        self.switchCPU = switchCPU
        self.switchHDD = switchHDD
        self.switchRAM = switchRAM

        specName = 'CPU: ' + cpuinfo.get_cpu_info().get('brand_raw', "Unknown")
        specArch = 'Arch: ' + cpuinfo.get_cpu_info().get('arch_string_raw', "Unknown")
        specOs = 'OS: ' + str(platform.system()) + ' ' + str(platform.release())
        logger.info(f"{specName} - {specArch} - {specOs}")

        self.GPUInfo = CGPUInfo()
        self.switchGPU = switchGPU
        self.switchVRAM = switchVRAM

    def getHDDsInfo(self):
      return getDrivesInfo()

    def getGPUInfo(self):
      return self.GPUInfo.getInfo()

    def getStatus(self):
        cpu = -1
        ramTotal = -1
        ramUsed = -1
        ramUsedPercent = -1
        hddTotal = -1
        hddUsed = -1
        hddUsedPercent = -1

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

        getStatus = self.GPUInfo.getStatus()

        return {
            'cpu_utilization': cpu,
            'ram_total': ramTotal,
            'ram_used': ramUsed,
            'ram_used_percent': ramUsedPercent,
            'hdd_total': hddTotal,
            'hdd_used': hddUsed,
            'hdd_used_percent': hddUsedPercent,
            'device_type': getStatus['device_type'],
            'gpus': getStatus['gpus'],
        }
