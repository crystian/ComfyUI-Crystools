import platform
import re
import cpuinfo
from cpuinfo import DataSource
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

        self.print_sys_info()

        self.GPUInfo = CGPUInfo()
        self.switchGPU = switchGPU
        self.switchVRAM = switchVRAM

    def print_sys_info(self):
        brand = None
        if DataSource.is_windows:   # Windows
            brand = DataSource.winreg_processor_brand().strip()
        elif DataSource.has_proc_cpuinfo():   # Linux
            return_code, output = DataSource.cat_proc_cpuinfo()
            if return_code == 0 and output is not None:
                for line in output.splitlines():
                    r = re.search(r'model name\s*:\s*(.+)', line)
                    if r:
                        brand = r.group(1)
                        break
        elif DataSource.has_sysctl():   # macOS
            return_code, output = DataSource.sysctl_machdep_cpu_hw_cpufrequency()
            if return_code == 0 and output is not None:
                for line in output.splitlines():
                    r = re.search(r'machdep\.cpu\.brand_string\s*:\s*(.+)', line)
                    if r:
                        brand = r.group(1)
                        break

        # fallback to use cpuinfo.get_cpu_info()
        if not brand:
            brand = cpuinfo.get_cpu_info().get('brand_raw', "Unknown")

        arch_string_raw = 'Arch unknown'

        try:
          arch_string_raw = DataSource.arch_string_raw
        except:
          pass

        specName = 'CPU: ' + brand
        specArch = 'Arch: ' + arch_string_raw
        specOs = 'OS: ' + str(platform.system()) + ' ' + str(platform.release())
        logger.info(f"{specName} - {specArch} - {specOs}")

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
