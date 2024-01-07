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
  cssColorCPU = '#0AA015';

  // RAM Variables
  idSwitchRAM = 'Crystools.switchRAM';
  defaultSwitchRAM = true;
  htmlMonitorRAMRef = null;
  htmlMonitorRAMSliderRef = null;
  htmlMonitorRAMLabelRef = null;
  cssColorRAM = '#07630D';

  // GPU Variables
  idSwitchGPU = 'Crystools.switchGPU';
  defaultSwitchGPU = true;
  htmlMonitorGPURef = null;
  htmlMonitorGPUSliderRef = null;
  htmlMonitorGPULabelRef = null;
  cssColorGPU = '#0C86F4';

  // VRAM Variables
  idSwitchVRAM = 'Crystools.switchVRAM';
  defaultSwitchVRAM = true;
  htmlMonitorVRAMRef = null;
  htmlMonitorVRAMSliderRef = null;
  htmlMonitorVRAMLabelRef = null;
  cssColorVRAM = '#176EC7';

  // HDD Variables
  idSwitchHDD = 'Crystools.switchHDD';
  defaultSwitchHDD = false;
  htmlMonitorHDDRef = null;
  htmlMonitorHDDSliderRef = null;
  htmlMonitorHDDLabelRef = null;
  cssColorHDD = '#730F92';

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

        if (value === 0) {
          this.updateDisplay({
            cpu_utilization: -1,
            device: 'cpu',

            gpus: [{
              gpu_utilization: -1,
              vram_total: -1,
              vram_used: -1,
              vram_used_percent: -1,
            }],
            hdd_total: -1,
            hdd_used: -1,
            hdd_used_percent: -1,
            ram_total: -1,
            ram_used: -1,
            ram_used_percent: -1,
          });
        }

        if (this.htmlMonitorCPUSliderRef) { // validation because this run before setup
          value = value.toFixed(1);
          const animationConfig = `width ${value}s`;
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
      container.style.display = value ? 'flex' : 'none';
    }
  };

  updateDisplay = (data) => {
    // console.debug('updateDisplay', data);
    this.htmlMonitorCPULabelRef.innerHTML = `${Math.floor(data.cpu_utilization)}%`;
    this.htmlMonitorCPURef.title = `${Math.floor(data.cpu_utilization)}%`;
    this.htmlMonitorCPUSliderRef.style.width = this.htmlMonitorCPULabelRef.innerHTML;

    const gpu = data.gpus[0];
    if (gpu) {
      this.htmlMonitorGPULabelRef.innerHTML = `${Math.floor(gpu.gpu_utilization)}%`;
      this.htmlMonitorGPUSliderRef.style.width = this.htmlMonitorGPULabelRef.innerHTML;
      this.htmlMonitorVRAMLabelRef.innerHTML = `${Math.floor(gpu.vram_used_percent)}%`;
      this.htmlMonitorVRAMSliderRef.style.width = this.htmlMonitorVRAMLabelRef.innerHTML;
    } else {
      console.error('no gpu found');
    }

    this.htmlMonitorHDDLabelRef.innerHTML = `${Math.floor(data.hdd_used_percent)}%`;
    this.htmlMonitorHDDSliderRef.style.width = this.htmlMonitorHDDLabelRef.innerHTML;

    this.htmlMonitorRAMLabelRef.innerHTML = `${Math.floor(data.ram_used_percent)}%`;
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

  createMonitor = (id, label, color) => {
    const option = {
      rootRef: null,
      sliderRef: null,
      labelRef: null,
    };

    const htmlMain = document.createElement('div');
    htmlMain.setAttribute('id', id);
    htmlMain.style.margin = '2px 10px';
    htmlMain.style.height = '12px';
    htmlMain.style.position = 'relative';
    htmlMain.style.display = 'flex';
    htmlMain.style.alignItems = 'center';
    htmlMain.style.flexDirection = 'row';
    option.rootRef = htmlMain;

    const htmlMonitorText = document.createElement('div');
    htmlMonitorText.style.width = '35px';
    htmlMonitorText.style.fontSize = '10px';
    htmlMonitorText.innerHTML = label;
    htmlMain.append(htmlMonitorText);

    const htmlMonitorContent = document.createElement('div');
    htmlMonitorContent.style.height = '100%';
    htmlMonitorContent.style.flexGrow = '1';
    htmlMonitorContent.style.position = 'relative';
    htmlMonitorContent.style.backgroundColor = 'var(--bg-color)';
    htmlMain.append(htmlMonitorContent);

    const htmlMonitorSlider = document.createElement('div');
    htmlMonitorSlider.style.position = 'absolute';
    htmlMonitorSlider.style.height = '100%';
    htmlMonitorSlider.style.width = '0';
    htmlMonitorSlider.style.backgroundColor = color;
    htmlMonitorSlider.style.transition = 'width 0.5s';
    option.sliderRef = htmlMonitorSlider;
    htmlMonitorContent.append(htmlMonitorSlider);

    const htmlMonitorLabel = document.createElement('div');
    htmlMonitorLabel.style.position = 'relative';
    htmlMonitorLabel.style.width = '100%';
    htmlMonitorLabel.style.color = 'var(--drag-text)';
    htmlMonitorLabel.style.fontSize = '10px';
    htmlMonitorLabel.innerHTML = '0%';
    option.labelRef = htmlMonitorLabel;
    htmlMonitorContent.append(htmlMonitorLabel);

    return option;
  };

  createMonitorCPU = () => {
    const options = this.createMonitor('crystools-monitor-cpu', 'CPU', this.cssColorCPU);

    this.htmlMonitorCPURef = options.rootRef;
    this.htmlMonitorCPUSliderRef = options.sliderRef;
    this.htmlMonitorCPULabelRef = options.labelRef;
    return this.htmlMonitorCPURef;
  };

  createMonitorRAM = () => {
    const options = this.createMonitor('crystools-monitor-ram', 'RAM', this.cssColorRAM);

    this.htmlMonitorRAMRef = options.rootRef;
    this.htmlMonitorRAMSliderRef = options.sliderRef;
    this.htmlMonitorRAMLabelRef = options.labelRef;
    return this.htmlMonitorRAMRef;
  };

  createMonitorGPU = () => {
    const options = this.createMonitor('crystools-monitor-gpu', 'GPU', this.cssColorGPU);

    this.htmlMonitorGPURef = options.rootRef;
    this.htmlMonitorGPUSliderRef = options.sliderRef;
    this.htmlMonitorGPULabelRef = options.labelRef;
    return this.htmlMonitorGPURef;
  };

  createMonitorVRAM = () => {
    const options = this.createMonitor('crystools-monitor-vram', 'VRAM', this.cssColorVRAM);

    this.htmlMonitorVRAMRef = options.rootRef;
    this.htmlMonitorVRAMSliderRef = options.sliderRef;
    this.htmlMonitorVRAMLabelRef = options.labelRef;
    return this.htmlMonitorVRAMRef;
  };

  createMonitorHDD = () => {
    const options = this.createMonitor('crystools-monitor-hdd', 'HDD', this.cssColorHDD);

    this.htmlMonitorHDDRef = options.rootRef;
    this.htmlMonitorHDDSliderRef = options.sliderRef;
    this.htmlMonitorHDDLabelRef = options.labelRef;
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
