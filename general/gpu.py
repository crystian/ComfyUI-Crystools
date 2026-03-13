"""
gpu.py — AMD Linux support patch for ComfyUI-Crystools
=======================================================

Adds AMD GPU monitoring on Linux without breaking NVIDIA support.

Backend priority order:
  1. pynvml        — NVIDIA (original, unchanged)
  2. pyrsmi        — AMD via ROCm SMI (requires full ROCm stack)
  3. pyamdgpuinfo  — AMD via amdgpu kernel driver (pip install pyamdgpuinfo)
  4. sysfs         — AMD via /sys/class/drm (no extra libs needed, always works)
  5. jtop          — Jetson devices

Installation:
  - No extra packages required (sysfs fallback works out of the box)
  - Optional: pip install pyamdgpuinfo  (for more accurate GPU utilization)
  - Optional: pip install pyrsmi        (requires full ROCm installation)

Tested on:
  - RX 6600 (RDNA2 / gfx1032) + ROCm 7.2 + Debian Linux
  - NVIDIA users are unaffected (pynvml path unchanged)
"""

import os
import platform
import torch
import comfy.model_management
from ..core import logger

# ──────────────────────────────────────────────────────────────────────────────
# Optional backend imports — all fail gracefully
# ──────────────────────────────────────────────────────────────────────────────

try:
    import pynvml
    _PYNVML_AVAILABLE = True
except ImportError:
    _PYNVML_AVAILABLE = False

try:
    from pyrsmi import rocml
    _PYRSMI_AVAILABLE = True
except ImportError:
    _PYRSMI_AVAILABLE = False

try:
    import pyamdgpuinfo
    _PYAMDGPUINFO_AVAILABLE = True
except ImportError:
    _PYAMDGPUINFO_AVAILABLE = False

try:
    from jtop import jtop, JtopException
    _JTOP_AVAILABLE = True
except ImportError:
    _JTOP_AVAILABLE = False


# ──────────────────────────────────────────────────────────────────────────────
# AMD sysfs helpers — reads /sys/class/drm directly, no extra libs needed
# ──────────────────────────────────────────────────────────────────────────────

def _get_amd_drm_cards():
    """Return sorted list of AMD DRM card names found in /sys/class/drm."""
    try:
        drm = "/sys/class/drm"
        return sorted([
            d for d in os.listdir(drm)
            if d.startswith("card") and not d.endswith("-")
            and os.path.exists(f"{drm}/{d}/device/mem_info_vram_total")
        ])
    except Exception:
        return []


def _sysfs_int(path):
    try:
        with open(path) as f:
            return int(f.read().strip())
    except Exception:
        return 0


def _sysfs_float(path):
    try:
        with open(path) as f:
            return float(f.read().strip())
    except Exception:
        return 0.0


def _sysfs_vram(card):
    """Return (total_mb, used_mb) VRAM for a given DRM card."""
    base  = f"/sys/class/drm/{card}/device"
    total = _sysfs_int(f"{base}/mem_info_vram_total") // (1024 * 1024)
    used  = _sysfs_int(f"{base}/mem_info_vram_used")  // (1024 * 1024)
    return total, used


def _sysfs_gpu_busy(card):
    """Return GPU utilization % from sysfs gpu_busy_percent."""
    return _sysfs_float(f"/sys/class/drm/{card}/device/gpu_busy_percent")


def _sysfs_temperature(card):
    """Return GPU temperature in °C from hwmon (junction preferred over edge)."""
    hwmon_base = f"/sys/class/drm/{card}/device/hwmon"
    try:
        for hwmon in sorted(os.listdir(hwmon_base)):
            for tname in ["temp2_input", "temp1_input"]:
                p = f"{hwmon_base}/{hwmon}/{tname}"
                if os.path.exists(p):
                    return _sysfs_float(p) / 1000.0
    except Exception:
        pass
    return 0.0


def _sysfs_gpu_name(card):
    """Get GPU name via torch.cuda first, fall back to generic name."""
    try:
        if torch.cuda.is_available():
            return torch.cuda.get_device_name(0)
    except Exception:
        pass
    return f"AMD GPU [{card}]"


# ──────────────────────────────────────────────────────────────────────────────
# CGPUInfo
# ──────────────────────────────────────────────────────────────────────────────

class CGPUInfo:
    """
    GPU information and real-time status for the Crystools resource monitor.

    Backend priority:
      NVIDIA pynvml → AMD pyrsmi → AMD pyamdgpuinfo → AMD sysfs → Jetson jtop
    """

    pynvmlLoaded   = False
    pyrsmiLoaded   = False
    pyamdgpuLoaded = False
    sysfsLoaded    = False
    jtopLoaded     = False
    anygpuLoaded   = False

    cuda             = False
    cudaAvailable    = False
    torchDevice      = "cpu"
    cudaDevice       = "cpu"   # 'cpu' or 'cuda' — used as device_type by hardware.py
    cudaDevicesFound = 0
    isAmd            = False

    gpus             = []
    gpusUtilization  = []   # per-GPU utilization switch (set by settings UI)
    gpusVRAM         = []   # per-GPU VRAM switch
    gpusTemperature  = []   # per-GPU temperature switch
    _amdCards        = []   # DRM card names for sysfs backend, e.g. ["card0"]

    switchGPU         = True
    switchVRAM        = True
    switchTemperature = True

    def __init__(self):
        self.gpus            = []
        self.gpusUtilization = []
        self.gpusVRAM        = []
        self.gpusTemperature = []
        self._amdCards       = []

        try:
            self.torchDevice = comfy.model_management.get_torch_device_name(
                comfy.model_management.get_torch_device()
            )
        except Exception as e:
            logger.error(f"Could not pick default device. {e}")

        self.cudaAvailable = torch.cuda.is_available()
        self.cudaDevice    = "cpu" if self.torchDevice == "cpu" else "cuda"

        # Try each backend in priority order, stop at the first that succeeds
        if not self._initNvidia():
            if not self._initAmdPyrsmi():
                if not self._initAmdPyamdgpuinfo():
                    if not self._initAmdSysfs():
                        self._initJetson()

        if not self.anygpuLoaded:
            logger.warning("No GPU backend loaded.")

        if self.cuda and self.cudaAvailable and self.torchDevice == "cpu":
            logger.warning("CUDA is available, but torch is using CPU.")

    # ── Backend initializers ──────────────────────────────────────────────────

    def _initNvidia(self):
        if not _PYNVML_AVAILABLE:
            return False
        if "zluda" in self.torchDevice.lower():
            logger.warning("ZLUDA detected — skipping NVIDIA backend.")
            return False
        try:
            pynvml.nvmlInit()
        except Exception as e:
            logger.error(f"Could not init pynvml (Nvidia). {e}")
            return False
        count = pynvml.nvmlDeviceGetCount()
        if count == 0:
            return False

        self.pynvmlLoaded     = True
        self.cuda             = True
        self.cudaDevice       = "cuda"
        self.cudaDevicesFound = count
        self.anygpuLoaded     = True
        logger.info("pynvml (NVIDIA) initialized.")
        logger.info("GPU/s:")
        for i in range(count):
            h    = pynvml.nvmlDeviceGetHandleByIndex(i)
            name = pynvml.nvmlDeviceGetName(h)
            if isinstance(name, bytes):
                name = name.decode()
            logger.info(f"  {i}) {name}")
            self.gpus.append(name)
            self.gpusUtilization.append(True)
            self.gpusVRAM.append(True)
            self.gpusTemperature.append(True)
        try:
            logger.info(f"NVIDIA Driver: {pynvml.nvmlSystemGetDriverVersion()}")
        except Exception:
            pass
        return True

    def _initAmdPyrsmi(self):
        if not _PYRSMI_AVAILABLE:
            return False
        try:
            rocml.smi_initialize()
            count = rocml.smi_get_device_count()
        except Exception as e:
            logger.error(f"Could not init pyrsmi (AMD). {e}")
            return False
        if count == 0:
            return False

        self.pyrsmiLoaded     = True
        self.isAmd            = True
        self.cuda             = True
        self.cudaDevice       = "cuda"
        self.cudaDevicesFound = count
        self.anygpuLoaded     = True
        logger.info("pyrsmi (AMD ROCm) initialized.")
        logger.info("GPU/s:")
        for i in range(count):
            name = rocml.smi_get_device_name(i)
            logger.info(f"  {i}) {name}")
            self.gpus.append(name)
            self.gpusUtilization.append(True)
            self.gpusVRAM.append(True)
            self.gpusTemperature.append(True)
        try:
            logger.info(f"AMD Driver: {rocml.smi_get_driver_version()}")
        except Exception:
            pass
        return True

    def _initAmdPyamdgpuinfo(self):
        """
        AMD backend using pyamdgpuinfo.
        Install: pip install pyamdgpuinfo
        Requires only the amdgpu kernel driver, not the full ROCm stack.
        """
        if not _PYAMDGPUINFO_AVAILABLE:
            return False
        try:
            count = pyamdgpuinfo.detect_gpus()
        except Exception as e:
            logger.error(f"Could not init pyamdgpuinfo. {e}")
            return False
        if count == 0:
            return False

        self.pyamdgpuLoaded   = True
        self.isAmd            = True
        self.cuda             = True
        self.cudaDevice       = "cuda"
        self.cudaDevicesFound = count
        self.anygpuLoaded     = True
        logger.info("pyamdgpuinfo (AMD) initialized.")
        logger.info("GPU/s:")
        for i in range(count):
            gpu  = pyamdgpuinfo.get_gpu(i)
            name = getattr(gpu, "name", f"AMD GPU #{i}")
            logger.info(f"  {i}) {name}")
            self.gpus.append(name)
            self.gpusUtilization.append(True)
            self.gpusVRAM.append(True)
            self.gpusTemperature.append(True)
        return True

    def _initAmdSysfs(self):
        """
        AMD sysfs fallback — reads /sys/class/drm directly from the kernel.
        No extra packages needed. Works with any AMD card that has the amdgpu driver.
        Provides: VRAM total/used, GPU utilization %, temperature.
        """
        if platform.system() != "Linux":
            return False
        cards = _get_amd_drm_cards()
        if not cards:
            return False

        self._amdCards        = cards
        self.sysfsLoaded      = True
        self.isAmd            = True
        self.cuda             = True
        self.cudaDevicesFound = len(cards)
        self.anygpuLoaded     = True
        # Must be 'cuda' so hardware.py sets device_type='cuda'
        # and the frontend renders the GPU/VRAM panel
        self.cudaDevice = "cuda"

        logger.info("AMD GPU sysfs backend initialized (no extra libs needed).")
        logger.info("GPU/s:")
        for i, card in enumerate(cards):
            name = _sysfs_gpu_name(card)
            logger.info(f"  {i}) {name}")
            self.gpus.append(name)
            self.gpusUtilization.append(True)
            self.gpusVRAM.append(True)
            self.gpusTemperature.append(True)
        return True

    def _initJetson(self):
        if not _JTOP_AVAILABLE:
            return False
        try:
            with jtop() as j:
                if not j.ok():
                    return False
            self.jtopLoaded       = True
            self.anygpuLoaded     = True
            self.cudaDevicesFound = 1
            self.gpus.append("Jetson GPU")
            self.gpusUtilization.append(True)
            self.gpusVRAM.append(True)
            self.gpusTemperature.append(True)
            logger.info("Jetson jtop initialized.")
            return True
        except Exception as e:
            logger.error(f"Could not init jtop (Jetson). {e}")
            return False

    # ── Public API ────────────────────────────────────────────────────────────

    def getInfo(self):
        logger.debug("Getting GPU info...")
        # Frontend JS expects [{name, index}, ...] not a plain list of strings
        return [{"name": name, "index": i} for i, name in enumerate(self.gpus)]

    def getStatus(self):
        """
        Return a dict consumed by hardware.py and forwarded to the frontend via WebSocket.

        Format:
          {
            'device_type': 'cpu' | 'cuda',
            'device':      'cpu' | 'cuda',   # alias used by frontend JS
            'gpus': [
              {
                'gpu_utilization':   float,  # 0-100 %
                'gpu_temperature':   float,  # degrees Celsius
                'vram_total':        int,    # MB
                'vram_used':         int,    # MB
                'vram_used_percent': float,  # 0-100 %
              },
              ...
            ]
          }
        """
        device_type = self.cudaDevice
        gpus        = []

        # No GPU backend available — return zeroed dummy entry
        if not self.anygpuLoaded or self.cudaDevice == "cpu":
            gpus.append({
                'gpu_utilization':   0,
                'gpu_temperature':   0,
                'vram_total':        0,
                'vram_used':         0,
                'vram_used_percent': 0,
            })
            return {'device_type': device_type, 'device': device_type, 'gpus': gpus}

        for i in range(self.cudaDevicesFound):
            util  = 0.0
            temp  = 0.0
            total = 0
            used  = 0

            # ── NVIDIA via pynvml ────────────────────────────────────────────
            if self.pynvmlLoaded:
                try:
                    h     = pynvml.nvmlDeviceGetHandleByIndex(i)
                    util  = float(pynvml.nvmlDeviceGetUtilizationRates(h).gpu)
                    mem   = pynvml.nvmlDeviceGetMemoryInfo(h)
                    total = mem.total // (1024 * 1024)
                    used  = mem.used  // (1024 * 1024)
                    if self.switchTemperature:
                        temp = float(pynvml.nvmlDeviceGetTemperature(
                            h, pynvml.NVML_TEMPERATURE_GPU))
                except Exception as e:
                    logger.debug(f"pynvml getStatus [{i}]: {e}")

            # ── AMD via pyrsmi ───────────────────────────────────────────────
            elif self.pyrsmiLoaded:
                try:
                    util  = float(rocml.smi_get_device_utilization(i))
                    total = rocml.smi_get_device_vram_size(i) // (1024 * 1024)
                    used  = rocml.smi_get_device_vram_used(i) // (1024 * 1024)
                    if self.switchTemperature:
                        temp = float(rocml.smi_get_device_temp(i, 0))
                except Exception as e:
                    logger.debug(f"pyrsmi getStatus [{i}]: {e}")

            # ── AMD via pyamdgpuinfo ─────────────────────────────────────────
            elif self.pyamdgpuLoaded:
                try:
                    gpu   = pyamdgpuinfo.get_gpu(i)
                    mem   = gpu.memory_info
                    total = mem.get("vram_size", 0) // (1024 * 1024)
                    used  = gpu.query_vram_usage() // (1024 * 1024)
                    util  = float(gpu.query_load() * 100)
                    if self.switchTemperature:
                        temp = float(gpu.query_temperature())
                except Exception as e:
                    logger.debug(f"pyamdgpuinfo getStatus [{i}]: {e}")

            # ── AMD via sysfs (no extra libs) ────────────────────────────────
            elif self.sysfsLoaded and i < len(self._amdCards):
                card        = self._amdCards[i]
                total, used = _sysfs_vram(card)
                util        = _sysfs_gpu_busy(card)
                if self.switchTemperature:
                    temp    = _sysfs_temperature(card)

            # ── Jetson via jtop ──────────────────────────────────────────────
            elif self.jtopLoaded:
                try:
                    with jtop() as j:
                        s     = j.stats
                        util  = float(s.get("GPU", 0))
                        total = s.get("RAM tot", 0)
                        used  = s.get("RAM use", 0)
                        temp  = float(s.get("Temp GPU", 0))
                except Exception as e:
                    logger.debug(f"jtop getStatus: {e}")

            percent = round((used / total * 100) if total > 0 else 0.0, 1)
            gpus.append({
                'gpu_utilization':   util,
                'gpu_temperature':   temp,
                'vram_total':        total,
                'vram_used':         used,
                'vram_used_percent': percent,
            })

        return {'device_type': device_type, 'device': device_type, 'gpus': gpus}
