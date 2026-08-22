import importlib.util
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest import mock

repo_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(repo_root))

fake_comfy = types.ModuleType('comfy')
fake_model_management = types.ModuleType('comfy.model_management')
fake_model_management.get_torch_device_name = lambda device: 'cpu'
fake_model_management.get_torch_device = lambda: None
fake_comfy.model_management = fake_model_management
sys.modules.setdefault('comfy', fake_comfy)
sys.modules.setdefault('comfy.model_management', fake_model_management)

fake_torch = types.ModuleType('torch')
fake_torch.cuda = types.SimpleNamespace(is_available=lambda: False)
sys.modules.setdefault('torch', fake_torch)

fake_crystools_pkg = types.ModuleType('crystools')
fake_crystools_pkg.__path__ = [str(repo_root)]
sys.modules['crystools'] = fake_crystools_pkg

fake_general_pkg = types.ModuleType('crystools.general')
fake_general_pkg.__path__ = [str(repo_root / 'general')]
sys.modules['crystools.general'] = fake_general_pkg

fake_logger = types.SimpleNamespace(
    debug=lambda *args, **kwargs: None,
    error=lambda *args, **kwargs: None,
    info=lambda *args, **kwargs: None,
    warning=lambda *args, **kwargs: None,
)
fake_core_pkg = types.ModuleType('crystools.core')
fake_core_pkg.logger = fake_logger
sys.modules['crystools.core'] = fake_core_pkg

spec = importlib.util.spec_from_file_location('crystools.general.gpu', repo_root / 'general' / 'gpu.py')
gpu_module = importlib.util.module_from_spec(spec)
sys.modules['crystools.general.gpu'] = gpu_module
assert spec.loader is not None
spec.loader.exec_module(gpu_module)

CGPUInfo = gpu_module.CGPUInfo


class TestAmdSysfsMetrics(unittest.TestCase):
    def test_gpu_busy_and_vram_are_read_from_sysfs(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            device_path = root / 'card1' / 'device'
            device_path.mkdir(parents=True, exist_ok=True)
            (device_path / 'gpu_busy_percent').write_text('72\n', encoding='utf-8')
            (device_path / 'mem_info_vram_used').write_text('8589934592\n', encoding='utf-8')
            (device_path / 'mem_info_vram_total').write_text('17179869184\n', encoding='utf-8')

            info = CGPUInfo.__new__(CGPUInfo)
            self.assertEqual(72.0, info._read_amd_gpu_busy_percent(1, sysfs_root=root))
            self.assertEqual(
                {'total': 17179869184, 'used': 8589934592},
                info._read_amd_vram_info(1, sysfs_root=root),
            )

    def test_temperature_is_read_from_hwmon_when_sensors_missing(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            device_path = root / 'card0' / 'device'
            hwmon_path = device_path / 'hwmon' / 'hwmon1'
            hwmon_path.mkdir(parents=True, exist_ok=True)
            (hwmon_path / 'temp1_input').write_text('55000\n', encoding='utf-8')

            info = CGPUInfo.__new__(CGPUInfo)
            with mock.patch('crystools.general.gpu.shutil.which', return_value=None):
                self.assertEqual(55.0, info._read_amd_temperature(0, sysfs_root=root))


class TestNvidiaNvmlRecovery(unittest.TestCase):
    def _make_nvidia_info(self, nvml):
        info = CGPUInfo.__new__(CGPUInfo)
        info.pynvml = nvml
        info.pynvmlLoaded = True
        info.pyamdLoaded = False
        info.jtopLoaded = False
        info.amdsmiLoaded = False
        info.linuxAmdSysfsAvailable = False
        info.anygpuLoaded = True
        info.cuda = True
        info.cudaAvailable = True
        info.cudaDevice = 'cuda'
        info.cudaDevicesFound = 1
        info.switchGPU = True
        info.switchVRAM = True
        info.switchTemperature = True
        info.gpusUtilization = [False]
        info.gpusVRAM = [True]
        info.gpusTemperature = [False]
        return info

    def test_memory_error_does_not_permanently_disable_vram_monitoring(self):
        class FakeNvml:
            def __init__(self):
                self.memory_calls = 0
                self.init_calls = 0

            def nvmlDeviceGetHandleByIndex(self, index):
                return f'gpu-{index}'

            def nvmlDeviceGetMemoryInfo(self, handle):
                self.memory_calls += 1
                if self.memory_calls == 1:
                    raise RuntimeError('temporary NVML memory failure')
                return types.SimpleNamespace(total=100, used=40)

            def nvmlShutdown(self):
                pass

            def nvmlInit(self):
                self.init_calls += 1

        nvml = FakeNvml()
        info = self._make_nvidia_info(nvml)

        first_status = info.getStatus()
        second_status = info.getStatus()

        self.assertTrue(info.switchVRAM)
        self.assertEqual(-1, first_status['gpus'][0]['vram_used'])
        self.assertEqual(40, second_status['gpus'][0]['vram_used'])
        self.assertEqual(40.0, second_status['gpus'][0]['vram_used_percent'])
        self.assertEqual(1, nvml.init_calls)

    def test_handle_error_returns_placeholder_status_instead_of_raising(self):
        class FakeNvml:
            def nvmlDeviceGetHandleByIndex(self, index):
                raise RuntimeError('temporary NVML handle failure')

            def nvmlShutdown(self):
                pass

            def nvmlInit(self):
                pass

        info = self._make_nvidia_info(FakeNvml())

        status = info.getStatus()

        self.assertEqual(-1, status['gpus'][0]['vram_used'])
        self.assertTrue(info.switchVRAM)


if __name__ == '__main__':
    unittest.main()
