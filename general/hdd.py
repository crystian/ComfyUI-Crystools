import psutil
from ..core import logger

def getDrivesInfo():
  hdds = []
  logger.debug('Getting HDDs info...')
  for partition in psutil.disk_partitions():
    hdds.append(partition.mountpoint)

  return hdds
