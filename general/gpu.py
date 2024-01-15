import torch
import pynvml
import comfy.model_management

from ..core import logger


class CGPUInfo:
  """
  This class is responsible for getting information from GPU (ONLY).
  """
  cuda = False
  pynvmlLoaded = False
  cudaAvailable = False
  torchDevice = 'cpu'
  cudaDevice = 'cpu'
  cudaDevicesFound = 0
  switchGPU = False
  switchVRAM = False
  gpus = []
  gpusUtilization = []
  gpusVRAM = []

  def __init__(self):
    try:
      pynvml.nvmlInit()
      self.pynvmlLoaded = True
    except Exception as e:
      self.pynvmlLoaded = False
      logger.error('Could not init pynvml.' + str(e))

    if self.pynvmlLoaded and pynvml.nvmlDeviceGetCount() > 0:
      self.cudaDevicesFound = pynvml.nvmlDeviceGetCount()
      for deviceIndex in range(self.cudaDevicesFound):
        deviceHandle = pynvml.nvmlDeviceGetHandleByIndex(deviceIndex)
        gpuName = pynvml.nvmlDeviceGetName(deviceHandle)

        logger.info(f"GPU/s:")
        logger.info(f"{deviceIndex}) {gpuName}")

        self.gpus.append({
          'index': deviceIndex,
          'name': gpuName,
        })

        # same index as gpus, with default values
        self.gpusUtilization.append(False)
        self.gpusVRAM.append(False)

      self.cuda = True
      logger.info(f'NVIDIA Driver: {pynvml.nvmlSystemGetDriverVersion()}')
    else:
      logger.warn('No GPU with CUDA detected.')

    try:
      self.torchDevice = comfy.model_management.get_torch_device_name(comfy.model_management.get_torch_device())
    except Exception as e:
      logger.error('Could not pick default device.' + str(e))

    self.cudaDevice = 'cpu' if self.torchDevice == 'cpu' else 'cuda'
    self.cudaAvailable = torch.cuda.is_available()

    if self.cuda and self.cudaAvailable and self.torchDevice == 'cpu':
      logger.warn('CUDA is available, but torch is using CPU.')

  def getInfo(self):
    logger.debug('Getting GPUs info...')
    return self.gpus

  def getStatus(self):
    # logger.debug('CGPUInfo getStatus')
    gpuUtilization = -1
    vramUsed = -1
    vramTotal = -1
    vramPercent = -1

    gpuType = ''
    gpus = []

    if self.cudaDevice == 'cpu':
      gpuType = 'cpu'
      gpus.append({
        'gpu_utilization': -1,
        'vram_total': -1,
        'vram_used': -1,
        'vram_used_percent': -1,
      })
    else:
      gpuType = self.cudaDevice

      if self.pynvmlLoaded and self.cuda and self.cudaAvailable:
        for deviceIndex in range(self.cudaDevicesFound):
          deviceHandle = pynvml.nvmlDeviceGetHandleByIndex(deviceIndex)

          # GPU Utilization
          # if self.switchGPU and self.gpusUtilization[deviceIndex]:
          if self.switchGPU:
            print('switchGPU')
            utilization = pynvml.nvmlDeviceGetUtilizationRates(deviceHandle)
            gpuUtilization = utilization.gpu

          # VRAM
          if self.switchVRAM:
            # Torch or pynvml?, pynvml is more accurate with the system, torch is more accurate with comfyUI
            memory = pynvml.nvmlDeviceGetMemoryInfo(deviceHandle)
            vramUsed = memory.used
            vramTotal = memory.total

            # device = torch.device(gpuType)
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
      'device_type': gpuType,
      'gpus': gpus,
    }
