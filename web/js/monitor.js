import { app } from '../../../scripts/app.js';
import { api } from '../../../scripts/api.js';
import { commonPrefix } from './common.js';

//ram_used = ram.used / (1024 ** 3)
//    ram_total = ram.total / (1024 ** 3)
//    ram_stats = f"Used RAM: {ram_used:.2f} GB / Total RAM: {ram_total:.2f} GB"
//used_space = hard_drive.used / (1024 ** 3)
//    total_space = hard_drive.total / (1024 ** 3)
//    hard_drive_stats = f"Used Space: {used_space:.2f} GB / Total Space: {total_space:.2f} GB"
//    print(hard_drive_stats)
//    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
//    vram_used = torch.cuda.memory_allocated(device) / (1024 ** 3)
//    vram_total = torch.cuda.get_device_properties(device).total_memory / (1024 ** 3)
//    vram_stats = f"Used VRAM: {vram_used:.2f} GB / Total VRAM: {vram_total:.2f} GB"

class CrystoolsMonitor {
  idExtensionName = 'Crystools.monitor';
  menuPrefix = commonPrefix;
  htmlIdCrystoolsRoot = 'crystools-root';
  htmlIdCrystoolsMonitorContainer = 'crystools-monitor-container';

  idInputRate = 'Crystools.inputRate';
  defaultRate = .5;

  /** MONITORS */
    // CPU Variables
  idSwitchCPU = 'Crystools.switchCPU';
  defaultSwitchCPU = true;
  htmlMonitorCPURef = null;
  htmlMonitorCPUSliderRef = null;
  htmlMonitorCPULabelRef = null;
  cssColorCPU = '#0aa015';

  // RAM Variables
  idSwitchRAM = 'Crystools.switchRAM';
  defaultSwitchRAM = true;
  htmlMonitorRAMRef = null;
  htmlMonitorRAMSliderRef = null;
  htmlMonitorRAMLabelRef = null;
  cssColorRAM = '#07630d';

  // GPU Variables
  idSwitchGPU = 'Crystools.switchGPU';
  defaultSwitchGPU = true;
  htmlMonitorGPURef = null;
  htmlMonitorGPUSliderRef = null;
  htmlMonitorGPULabelRef = null;
  cssColorGPU = '#0c86f4';

  // VRAM Variables
  idSwitchVRAM = 'Crystools.switchVRAM';
  defaultSwitchVRAM = true;
  htmlMonitorVRAMRef = null;
  htmlMonitorVRAMSliderRef = null;
  htmlMonitorVRAMLabelRef = null;
  cssColorVRAM = '#176ec7';

  // HDD Variables
  idSwitchHDD = 'Crystools.switchHDD';
  defaultSwitchHDD = false;
  htmlMonitorHDDRef = null;
  htmlMonitorHDDSliderRef = null;
  htmlMonitorHDDLabelRef = null;
  cssColorHDD = '#730f92';

  idMonitorBigSize = 'Crystools.bigSize';
  defaultMonitorBigSize = true;

  constructor() {
    this.createSettings();
  }

  createSettings = () => {
    app.ui.settings.addSetting({
      id: this.idSwitchCPU,
      name: this.menuPrefix + 'Display CPU monitor [menu]',
      type: 'boolean',
      defaultValue: this.defaultSwitchCPU,
      onChange: async(value) => {
        this.updateWidget(this.htmlMonitorCPURef, value);
        await this.updateServer({switchCPU: value});
      },
    });
    app.ui.settings.addSetting({
      id: this.idSwitchRAM,
      name: this.menuPrefix + 'Display RAM monitor [menu]',
      type: 'boolean',
      defaultValue: this.defaultSwitchRAM,
      onChange: async(value) => {
        this.updateWidget(this.htmlMonitorRAMRef, value);
        await this.updateServer({switchRAM: value});
      },
    });
    app.ui.settings.addSetting({
      id: this.idSwitchGPU,
      name: this.menuPrefix + 'Display GPU monitor [menu]',
      type: 'boolean',
      defaultValue: this.defaultSwitchGPU,
      onChange: async(value) => {
        this.updateWidget(this.htmlMonitorGPURef, value);
        await this.updateServer({switchGPU: value});
      },
    });
    app.ui.settings.addSetting({
      id: this.idSwitchVRAM,
      name: this.menuPrefix + 'Display Video RAM monitor [menu]',
      type: 'boolean',
      defaultValue: this.defaultSwitchVRAM,
      onChange: async(value) => {
        this.updateWidget(this.htmlMonitorVRAMRef, value);
        await this.updateServer({switchVRAM: value});
      },
    });
    app.ui.settings.addSetting({
      id: this.idSwitchHDD,
      name: this.menuPrefix + 'Display Hard disk monitor [menu]',
      tooltip: 'Only the drive where the comfyUI is installed',
      type: 'boolean',
      defaultValue: this.defaultSwitchHDD,
      onChange: async(value) => {
        this.updateWidget(this.htmlMonitorHDDRef, value);
        await this.updateServer({switchHDD: value});
      },
    });

    app.ui.settings.addSetting({
      id: this.idMonitorBigSize,
      name: this.menuPrefix + 'Display large monitors [menu]',
      type: 'boolean',
      defaultValue: this.defaultMonitorBigSize,
      onChange: (value) => {
        console.warn('show big monitors changed', value);
      },
    });
    app.ui.settings.addSetting({
      id: this.idInputRate,
      name: this.menuPrefix + 'Monitors refresh rate (in seconds) [menu]',
      tooltip: 'This is the time between each update of the monitors, 0 means no refresh',
      type: 'slider',
      attrs: {
        min: 0,
        max: 5,
        step: 0.25,
      },
      defaultValue: this.defaultRate,
      onChange: async(value) => {
        try {
          value = parseFloat(value);
        } catch (error) {
          console.error(error);
        }
        await this.updateServer({rate: value});

        if (this.htmlMonitorCPUSliderRef) { // validation because this run before setup
          value = value.toFixed(1);
          const animationConfig = `width ${value}s`
          this.htmlMonitorCPUSliderRef.style.transition = animationConfig;
          this.htmlMonitorGPUSliderRef.style.transition = animationConfig;
          this.htmlMonitorHDDSliderRef.style.transition = animationConfig;
          this.htmlMonitorRAMSliderRef.style.transition = animationConfig;
          this.htmlMonitorVRAMSliderRef.style.transition = animationConfig;
        }
      },
    });
  };

  updateServer = async(data) => {
    const resp = await api.fetchApi('/crystools/monitor', {
      method: 'PATCH',
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    if (resp.status === 200) {
      return await resp.text();
    } else {
      console.error(resp);
    }
    return undefined;
  };

  updateAllWidget = () => {
    this.updateWidget(this.htmlMonitorCPURef, app.ui.settings.getSettingValue(this.idSwitchCPU, this.defaultSwitchCPU));
    this.updateWidget(this.htmlMonitorGPURef, app.ui.settings.getSettingValue(this.idSwitchGPU, this.defaultSwitchGPU));
    this.updateWidget(this.htmlMonitorHDDRef, app.ui.settings.getSettingValue(this.idSwitchHDD, this.defaultSwitchHDD));
    this.updateWidget(this.htmlMonitorRAMRef, app.ui.settings.getSettingValue(this.idSwitchRAM, this.defaultSwitchRAM));
    this.updateWidget(this.htmlMonitorVRAMRef, app.ui.settings.getSettingValue(this.idSwitchVRAM, this.defaultSwitchVRAM));
  };

  updateWidget = (container, value) => {
    if (container) {
      container.style.display = value ? 'block' : 'none';
    }
  };

  updateDisplay = (data) => {
    // console.debug('updateDisplay', data);
    this.htmlMonitorCPULabelRef.innerHTML = `${data.cpu_utilization.toFixed(1)}%`;
    this.htmlMonitorCPUSliderRef.style.width = this.htmlMonitorCPULabelRef.innerHTML;

    const gpu = data.gpus[0];
    if (gpu) {
      this.htmlMonitorGPULabelRef.innerHTML = `${gpu.gpu_utilization.toFixed(1)}%`;
      this.htmlMonitorGPUSliderRef.style.width = this.htmlMonitorGPULabelRef.innerHTML;
      this.htmlMonitorVRAMLabelRef.innerHTML = `${gpu.vram_used_percent.toFixed(1)}%`;
      this.htmlMonitorVRAMSliderRef.style.width = this.htmlMonitorVRAMLabelRef.innerHTML;
    } else {
      console.error('no gpu found');
    }

    this.htmlMonitorHDDLabelRef.innerHTML = `${data.hdd_used_percent.toFixed(1)}%`;
    this.htmlMonitorHDDSliderRef.style.width = this.htmlMonitorHDDLabelRef.innerHTML;

    this.htmlMonitorRAMLabelRef.innerHTML = `${data.ram_used_percent?.toFixed(1)}%`;
    this.htmlMonitorRAMSliderRef.style.width = this.htmlMonitorRAMLabelRef.innerHTML;
  };

  setup() {
    const parentElement = document.getElementById('queue-button');

    let ctoolsRoot = document.getElementById(this.htmlIdCrystoolsRoot);
    if (!ctoolsRoot) {
      ctoolsRoot = document.createElement('div');
      ctoolsRoot.setAttribute('id', this.htmlIdCrystoolsRoot);
      ctoolsRoot.style.display = 'flex';
      ctoolsRoot.style.width = '100%';
      ctoolsRoot.style.flexDirection = 'column';
      parentElement.insertAdjacentElement('afterend', ctoolsRoot);
    }

    const htmlContainer = document.createElement('div');
    htmlContainer.setAttribute('id', this.htmlIdCrystoolsMonitorContainer);
    htmlContainer.style.width = '100%';
    htmlContainer.style.cursor = 'crosshair';
    htmlContainer.style.order = '3';
    ctoolsRoot.append(htmlContainer);

    htmlContainer.append(this.createMonitorCPU());
    htmlContainer.append(this.createMonitorRAM());
    htmlContainer.append(this.createMonitorGPU());
    htmlContainer.append(this.createMonitorVRAM());
    htmlContainer.append(this.createMonitorHDD());

    this.updateAllWidget();
    this.registerListeners();
  }

  createMonitorCPU = () => {
    const htmlMonitorCPU = document.createElement('div');
    htmlMonitorCPU.setAttribute('id', 'crystools-monitor-cpu');
    htmlMonitorCPU.style.margin = '2px 10px';
    htmlMonitorCPU.style.height = '18px';
    htmlMonitorCPU.style.position = 'relative';
    htmlMonitorCPU.style.backgroundColor = 'var(--bg-color)';
    this.htmlMonitorCPURef = htmlMonitorCPU;

    const htmlMonitorCPUSlider = document.createElement('div');
    htmlMonitorCPUSlider.style.position = 'absolute';
    htmlMonitorCPUSlider.style.height = '100%';
    htmlMonitorCPUSlider.style.width = '0';
    htmlMonitorCPUSlider.style.backgroundColor = this.cssColorCPU;
    htmlMonitorCPUSlider.style.transition = 'width 0.5s';
    this.htmlMonitorCPUSliderRef = htmlMonitorCPUSlider;
    htmlMonitorCPU.append(this.htmlMonitorCPUSliderRef);

    const htmlMonitorCPULabel = document.createElement('div');
    htmlMonitorCPULabel.style.position = 'absolute';
    htmlMonitorCPULabel.style.margin = 'auto 0';
    htmlMonitorCPULabel.style.width = '100%';
    htmlMonitorCPULabel.style.color = 'var(--drag-text)';
    htmlMonitorCPULabel.style.fontSize = '14px';
    htmlMonitorCPULabel.innerHTML = '0%';
    this.htmlMonitorCPULabelRef = htmlMonitorCPULabel;
    htmlMonitorCPU.append(this.htmlMonitorCPULabelRef);
    return this.htmlMonitorCPURef;
  };

  createMonitorRAM = () => {
    const htmlMonitorRAM = document.createElement('div');
    htmlMonitorRAM.setAttribute('id', 'crystools-monitor-gpu');
    htmlMonitorRAM.style.margin = '2px 10px';
    htmlMonitorRAM.style.height = '18px';
    htmlMonitorRAM.style.position = 'relative';
    htmlMonitorRAM.style.backgroundColor = 'var(--bg-color)';
    this.htmlMonitorRAMRef = htmlMonitorRAM;

    const htmlMonitorRAMSlider = document.createElement('div');
    htmlMonitorRAMSlider.style.position = 'absolute';
    htmlMonitorRAMSlider.style.height = '100%';
    htmlMonitorRAMSlider.style.width = '0';
    htmlMonitorRAMSlider.style.backgroundColor = this.cssColorRAM;
    htmlMonitorRAMSlider.style.transition = 'width 0.5s';
    this.htmlMonitorRAMSliderRef = htmlMonitorRAMSlider;
    htmlMonitorRAM.append(this.htmlMonitorRAMSliderRef);

    const htmlMonitorRAMLabel = document.createElement('div');
    htmlMonitorRAMLabel.style.position = 'absolute';
    htmlMonitorRAMLabel.style.margin = 'auto 0';
    htmlMonitorRAMLabel.style.width = '100%';
    htmlMonitorRAMLabel.style.color = 'var(--drag-text)';
    htmlMonitorRAMLabel.style.fontSize = '14px';
    htmlMonitorRAMLabel.innerHTML = '0%';
    this.htmlMonitorRAMLabelRef = htmlMonitorRAMLabel;
    htmlMonitorRAM.append(this.htmlMonitorRAMLabelRef);
    return this.htmlMonitorRAMRef;
  };

  createMonitorGPU = () => {
    const htmlMonitorGPU = document.createElement('div');
    htmlMonitorGPU.setAttribute('id', 'crystools-monitor-gpu');
    htmlMonitorGPU.style.margin = '2px 10px';
    htmlMonitorGPU.style.height = '18px';
    htmlMonitorGPU.style.position = 'relative';
    htmlMonitorGPU.style.backgroundColor = 'var(--bg-color)';
    this.htmlMonitorGPURef = htmlMonitorGPU;

    const htmlMonitorGPUSlider = document.createElement('div');
    htmlMonitorGPUSlider.style.position = 'absolute';
    htmlMonitorGPUSlider.style.height = '100%';
    htmlMonitorGPUSlider.style.width = '0';
    htmlMonitorGPUSlider.style.backgroundColor = this.cssColorGPU;
    htmlMonitorGPUSlider.style.transition = 'width 0.5s';
    this.htmlMonitorGPUSliderRef = htmlMonitorGPUSlider;
    htmlMonitorGPU.append(this.htmlMonitorGPUSliderRef);

    const htmlMonitorGPULabel = document.createElement('div');
    htmlMonitorGPULabel.style.position = 'absolute';
    htmlMonitorGPULabel.style.margin = 'auto 0';
    htmlMonitorGPULabel.style.width = '100%';
    htmlMonitorGPULabel.style.color = 'var(--drag-text)';
    htmlMonitorGPULabel.style.fontSize = '14px';
    htmlMonitorGPULabel.innerHTML = '0%';
    this.htmlMonitorGPULabelRef = htmlMonitorGPULabel;
    htmlMonitorGPU.append(this.htmlMonitorGPULabelRef);
    return this.htmlMonitorGPURef;
  };

  createMonitorVRAM = () => {
    const htmlMonitorVRAM = document.createElement('div');
    htmlMonitorVRAM.setAttribute('id', 'crystools-monitor-gpu');
    htmlMonitorVRAM.style.margin = '2px 10px';
    htmlMonitorVRAM.style.height = '18px';
    htmlMonitorVRAM.style.position = 'relative';
    htmlMonitorVRAM.style.backgroundColor = 'var(--bg-color)';
    this.htmlMonitorVRAMRef = htmlMonitorVRAM;

    const htmlMonitorVRAMSlider = document.createElement('div');
    htmlMonitorVRAMSlider.style.position = 'absolute';
    htmlMonitorVRAMSlider.style.height = '100%';
    htmlMonitorVRAMSlider.style.width = '0';
    htmlMonitorVRAMSlider.style.backgroundColor = this.cssColorVRAM;
    htmlMonitorVRAMSlider.style.transition = 'width 0.5s';
    this.htmlMonitorVRAMSliderRef = htmlMonitorVRAMSlider;
    htmlMonitorVRAM.append(this.htmlMonitorVRAMSliderRef);

    const htmlMonitorVRAMLabel = document.createElement('div');
    htmlMonitorVRAMLabel.style.position = 'absolute';
    htmlMonitorVRAMLabel.style.margin = 'auto 0';
    htmlMonitorVRAMLabel.style.width = '100%';
    htmlMonitorVRAMLabel.style.color = 'var(--drag-text)';
    htmlMonitorVRAMLabel.style.fontSize = '14px';
    htmlMonitorVRAMLabel.innerHTML = '0%';
    this.htmlMonitorVRAMLabelRef = htmlMonitorVRAMLabel;
    htmlMonitorVRAM.append(this.htmlMonitorVRAMLabelRef);
    return this.htmlMonitorVRAMRef;
  };

  createMonitorHDD = () => {
    const htmlMonitorHDD = document.createElement('div');
    htmlMonitorHDD.setAttribute('id', 'crystools-monitor-gpu');
    htmlMonitorHDD.style.margin = '2px 10px';
    htmlMonitorHDD.style.height = '18px';
    htmlMonitorHDD.style.position = 'relative';
    htmlMonitorHDD.style.backgroundColor = 'var(--bg-color)';
    this.htmlMonitorHDDRef = htmlMonitorHDD;

    const htmlMonitorHDDSlider = document.createElement('div');
    htmlMonitorHDDSlider.style.position = 'absolute';
    htmlMonitorHDDSlider.style.height = '100%';
    htmlMonitorHDDSlider.style.width = '0';
    htmlMonitorHDDSlider.style.backgroundColor = this.cssColorHDD;
    htmlMonitorHDDSlider.style.transition = 'width 0.5s';
    this.htmlMonitorHDDSliderRef = htmlMonitorHDDSlider;
    htmlMonitorHDD.append(this.htmlMonitorHDDSliderRef);

    const htmlMonitorHDDLabel = document.createElement('div');
    htmlMonitorHDDLabel.style.position = 'absolute';
    htmlMonitorHDDLabel.style.margin = 'auto 0';
    htmlMonitorHDDLabel.style.width = '100%';
    htmlMonitorHDDLabel.style.color = 'var(--drag-text)';
    htmlMonitorHDDLabel.style.fontSize = '14px';
    htmlMonitorHDDLabel.innerHTML = '0%';
    this.htmlMonitorHDDLabelRef = htmlMonitorHDDLabel;
    htmlMonitorHDD.append(this.htmlMonitorHDDLabelRef);
    return this.htmlMonitorHDDRef;
  };


  registerListeners = () => {
    api.addEventListener('crystools.monitor', (event) => {
      if (event?.detail === undefined) {
        return;
      }
      this.updateDisplay(event.detail);
    });
  };
}

const crystoolsMonitor = new CrystoolsMonitor();
app.registerExtension({
  name: crystoolsMonitor.idExtensionName,
  setup: crystoolsMonitor.setup.bind(crystoolsMonitor),
});
