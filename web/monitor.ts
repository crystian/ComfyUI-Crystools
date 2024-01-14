import { app } from '/scripts/app.js';
import { api } from '/scripts/api.js';
import { commonPrefix } from './common.js';

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
  htmlMonitorCPURef?: HTMLDivElement = undefined;
  htmlMonitorCPUSliderRef?: HTMLDivElement = undefined;
  htmlMonitorCPULabelRef?: HTMLDivElement = undefined;
  cssColorCPU = '#0AA015';

  // RAM Variables
  idSwitchRAM = 'Crystools.switchRAM';
  defaultSwitchRAM = true;
  htmlMonitorRAMRef?: HTMLDivElement = undefined;
  htmlMonitorRAMSliderRef?: HTMLDivElement = undefined;
  htmlMonitorRAMLabelRef?: HTMLDivElement = undefined;
  cssColorRAM = '#07630D';

  // GPU Variables
  idSwitchGPU = 'Crystools.switchGPU';
  defaultSwitchGPU = true;
  htmlMonitorGPURef?: HTMLDivElement = undefined;
  htmlMonitorGPUSliderRef?: HTMLDivElement = undefined;
  htmlMonitorGPULabelRef?: HTMLDivElement = undefined;
  cssColorGPU = '#0C86F4';

  // VRAM Variables
  idSwitchVRAM = 'Crystools.switchVRAM';
  defaultSwitchVRAM = true;
  htmlMonitorVRAMRef?: HTMLDivElement = undefined;
  htmlMonitorVRAMSliderRef?: HTMLDivElement = undefined;
  htmlMonitorVRAMLabelRef?: HTMLDivElement = undefined;
  cssColorVRAM = '#176EC7';

  // HDD Variables
  idSwitchHDD = 'Crystools.switchHDD';
  idWhichHDD = 'Crystools.whichHDD';
  defaultWhichHDD = 'C:\\';
  defaultSwitchHDD = false;
  htmlMonitorHDDRef?: HTMLDivElement = undefined;
  htmlMonitorHDDSliderRef?: HTMLDivElement = undefined;
  htmlMonitorHDDLabelRef?: HTMLDivElement = undefined;
  cssColorHDD = '#730F92';

  constructor() {
    this.createSettings();
  }

  createSettings = (): void => {
    app.ui.settings.addSetting({
      id: this.idSwitchCPU,
      name: this.menuPrefix + '[menu] Display CPU monitor',
      type: 'boolean',
      defaultValue: this.defaultSwitchCPU,
      onChange: async(value: boolean) => {
        this.updateWidget(value, this.htmlMonitorCPURef);
        await this.updateServer({
          switchCPU: value,
        });
      },
    });
    app.ui.settings.addSetting({
      id: this.idSwitchRAM,
      name: this.menuPrefix + '[menu] Display RAM monitor',
      type: 'boolean',
      defaultValue: this.defaultSwitchRAM,
      onChange: async(value: boolean) => {
        this.updateWidget(value, this.htmlMonitorRAMRef);
        await this.updateServer({
          switchRAM: value,
        });
      },
    });
    app.ui.settings.addSetting({
      id: this.idSwitchGPU,
      name: this.menuPrefix + '[menu] Display GPU monitor',
      type: 'boolean',
      defaultValue: this.defaultSwitchGPU,
      onChange: async(value: boolean) => {
        this.updateWidget(value, this.htmlMonitorGPURef);
        await this.updateServer({
          switchGPU: value,
        });
      },
    });
    app.ui.settings.addSetting({
      id: this.idSwitchVRAM,
      name: this.menuPrefix + '[menu] Display Video RAM monitor',
      type: 'boolean',
      defaultValue: this.defaultSwitchVRAM,
      onChange: async(value: boolean) => {
        this.updateWidget(value, this.htmlMonitorVRAMRef);
        await this.updateServer({
          switchVRAM: value,
        });
      },
    });
    app.ui.settings.addSetting({
      id: this.idSwitchHDD,
      name: this.menuPrefix + '[menu] Display partition disk monitor (HDD)',
      type: 'boolean',
      defaultValue: this.defaultSwitchHDD,
      onChange: async(value: boolean) => {
        this.updateWidget(value, this.htmlMonitorHDDRef);
        await this.updateServer({
          switchHDD: value,
        });
      },
    });

    app.ui.settings.addSetting({
      id: this.idInputRate,
      name: this.menuPrefix + '[menu] Monitors refresh rate (in seconds)',
      tooltip: 'This is the time between each update of the monitors, 0 means no refresh',
      type: 'slider',
      attrs: {
        min: 0,
        max: 5,
        step: 0.25,
      },
      defaultValue: this.defaultRate,
      // eslint-disable-next-line complexity
      onChange: async(value: string) => {
        let valueNumber: number;

        try {
          valueNumber = parseFloat(value);
          if (isNaN(valueNumber)) {
            throw new Error('invalid value');
          }
        } catch (error) {
          console.error(error);
          return;
        }
        try {
          await this.updateServer({
            rate: valueNumber,
          });
        } catch (error) {
          console.error(error);
          return;
        }

        if (valueNumber === 0) {
          this.updateDisplay({
            cpu_utilization: 0,
            device: 'cpu',

            gpus: [
              {
                gpu_utilization: 0,
                vram_total: 0,
                vram_used: 0,
                vram_used_percent: 0,
              },
            ],
            hdd_total: 0,
            hdd_used: 0,
            hdd_used_percent: 0,
            ram_total: 0,
            ram_used: 0,
            ram_used_percent: 0,
          });
        }

        if (this.htmlMonitorCPUSliderRef
            && this.htmlMonitorGPUSliderRef
            && this.htmlMonitorHDDSliderRef
            && this.htmlMonitorRAMSliderRef
            && this.htmlMonitorVRAMSliderRef
        ) { // validation because this run before setup
          value = valueNumber.toFixed(1);
          const animationConfig = `width ${value}s`;
          this.htmlMonitorCPUSliderRef.style.transition = animationConfig;
          this.htmlMonitorGPUSliderRef.style.transition = animationConfig;
          this.htmlMonitorHDDSliderRef.style.transition = animationConfig;
          this.htmlMonitorRAMSliderRef.style.transition = animationConfig;
          this.htmlMonitorVRAMSliderRef.style.transition = animationConfig;
          this.htmlMonitorCPUSliderRef.style.width = value;
          this.htmlMonitorGPUSliderRef.style.width = value;
          this.htmlMonitorHDDSliderRef.style.width = value;
          this.htmlMonitorRAMSliderRef.style.width = value;
          this.htmlMonitorVRAMSliderRef.style.width = value;
        }
      },
    });

    void this.getHDDsFromServer().then((data: string[]): void => {
      const which = app.ui.settings.getSettingValue(this.idWhichHDD, this.defaultWhichHDD);

      app.ui.settings.addSetting({
        id: this.idWhichHDD,
        name: this.menuPrefix + 'Partition to show (HDD)',
        type: 'combo',
        defaultValue: this.defaultWhichHDD,
        options: (value: string) =>
          data.map((m) => ({
            value: m,
            text: m,
            selected: !value ? m === which : m === value,
          })),
        onChange: async(value: string) => {
          await this.updateServer({
            whichHDD: value,
          });
        },
      });
    });


    void this.getGPUsFromServer().then((gpus: TGpuName[]): void => {
      console.log(gpus);
      gpus?.forEach(({
        name, index
      }) => {
        const id = this.idSwitchGPU + index;
        app.ui.settings.addSetting({
          id,
          name: this.menuPrefix + `[menu] Display GPU monitor\r\n[${index}] ${name}`,
          type: 'boolean',
          defaultValue: this.defaultSwitchGPU,
          onChange: async(value: boolean)=> {
            // this.updateWidget(value, this.htmlMonitorGPURef);
            void await this.updateServerGPU(index,{
              utilization: value
            });
          },
        });
      });
    });
  };

  updateServer = async(data: TStatsSettings): Promise<string> => {
    const resp = await api.fetchApi('/crystools/monitor', {
      method: 'PATCH',
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    if (resp.status === 200) {
      return await resp.text();
    }
    throw new Error(resp.statusText);
  };

  updateServerGPU = async(index: number, data: TGpuSettings): Promise<string> => {
    console.log('updateServerGPU', index, data);
    const resp = await api.fetchApi(`/crystools/monitor/GPU/${index}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    if (resp.status === 200) {
      return await resp.text();
    }
    throw new Error(resp.statusText);
  };

  getHDDsFromServer = async(): Promise<string[]> => {
    return this.getDataFromServer('HDD');
  };

  getGPUsFromServer = async(): Promise<TGpuName[]> => {
    return this.getDataFromServer<TGpuName>('GPU');
  };

  getDataFromServer = async<T>(what: string): Promise<T[]> => {
    const resp = await api.fetchApi(`/crystools/monitor/${what}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (resp.status === 200) {
      return await resp.json();
    }
    throw new Error(resp.statusText);
  };

  updateAllWidget = (): void => {
    this.updateWidget(app.ui.settings.getSettingValue(this.idSwitchCPU, this.defaultSwitchCPU), this.htmlMonitorCPURef);
    this.updateWidget(app.ui.settings.getSettingValue(this.idSwitchGPU, this.defaultSwitchGPU), this.htmlMonitorGPURef);
    this.updateWidget(app.ui.settings.getSettingValue(this.idSwitchHDD, this.defaultSwitchHDD), this.htmlMonitorHDDRef);
    this.updateWidget(app.ui.settings.getSettingValue(this.idSwitchRAM, this.defaultSwitchRAM), this.htmlMonitorRAMRef);
    this.updateWidget(app.ui.settings.getSettingValue(this.idSwitchVRAM,
      this.defaultSwitchVRAM), this.htmlMonitorVRAMRef);
  };

  updateWidget = (value: boolean, container?: HTMLDivElement): void => {
    if (container) {
      container.style.display = value ? 'flex' : 'none';
    }
  };

  // eslint-disable-next-line complexity
  updateDisplay = (data: TStatsData): void => {
    // console.log('updateDisplay', data);
    if (!(this.htmlMonitorCPULabelRef
          && this.htmlMonitorCPUSliderRef
    )) {
      return;
    }
    this.htmlMonitorCPULabelRef.innerHTML = `${Math.floor(data.cpu_utilization)}%`;
    this.htmlMonitorCPUSliderRef.style.width = this.htmlMonitorCPULabelRef.innerHTML;

    const gpu = data.gpus[0];
    if (gpu) {
      if (this.htmlMonitorGPULabelRef
          && this.htmlMonitorGPUSliderRef
          && this.htmlMonitorVRAMLabelRef
          && this.htmlMonitorVRAMSliderRef) {

        this.htmlMonitorGPULabelRef.innerHTML = `${Math.floor(gpu.gpu_utilization)}%`;
        this.htmlMonitorGPUSliderRef.style.width = this.htmlMonitorGPULabelRef.innerHTML;
        this.htmlMonitorVRAMLabelRef.innerHTML = `${Math.floor(gpu.vram_used_percent)}%`;
        this.htmlMonitorVRAMSliderRef.style.width = this.htmlMonitorVRAMLabelRef.innerHTML;
      }
    } else {
      console.error('no gpu found');
    }

    if (this.htmlMonitorHDDLabelRef
        && this.htmlMonitorHDDSliderRef
    ) {
      this.htmlMonitorHDDLabelRef.innerHTML = `${Math.floor(data.hdd_used_percent)}%`;
      this.htmlMonitorHDDSliderRef.style.width = this.htmlMonitorHDDLabelRef.innerHTML;
      this.htmlMonitorHDDLabelRef.title =
        `Drive: ${app.ui.settings.getSettingValue(this.idWhichHDD, this.defaultWhichHDD)}`;
    }

    if (this.htmlMonitorHDDLabelRef
        && this.htmlMonitorHDDSliderRef
        && this.htmlMonitorRAMLabelRef
        && this.htmlMonitorRAMSliderRef
    ) {
      this.htmlMonitorRAMLabelRef.innerHTML = `${Math.floor(data.ram_used_percent)}%`;
      this.htmlMonitorRAMSliderRef.style.width = this.htmlMonitorRAMLabelRef.innerHTML;
    }

  };

  setup(): void {
    const parentElement = document.getElementById('queue-button');

    let ctoolsRoot = document.getElementById(this.htmlIdCrystoolsRoot);
    if (!ctoolsRoot) {
      ctoolsRoot = document.createElement('div');
      ctoolsRoot.setAttribute('id', this.htmlIdCrystoolsRoot);
      ctoolsRoot.style.display = 'flex';
      ctoolsRoot.style.width = '100%';
      ctoolsRoot.style.flexDirection = 'column';
      parentElement?.insertAdjacentElement('afterend', ctoolsRoot);
    }

    const htmlContainer = document.createElement('div');
    htmlContainer.setAttribute('id', this.htmlIdCrystoolsMonitorContainer);
    htmlContainer.style.width = '100%';
    htmlContainer.style.cursor = 'crosshair';
    htmlContainer.style.order = '3';
    htmlContainer.style.margin = '4px 0';
    ctoolsRoot.append(htmlContainer);

    htmlContainer.append(this.createMonitorCPU());
    htmlContainer.append(this.createMonitorRAM());
    htmlContainer.append(this.createMonitorGPU());
    htmlContainer.append(this.createMonitorVRAM());
    htmlContainer.append(this.createMonitorHDD());

    this.updateAllWidget();
    this.registerListeners();
  }

  createMonitor = (id: string, label: string, color: string): TMonitorRefs => {
    const option: TMonitorRefs = {
      rootRef: undefined,
      sliderRef: undefined,
      labelRef: undefined,
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

  createMonitorCPU = (): HTMLDivElement => {
    const options = this.createMonitor('crystools-monitor-cpu', 'CPU', this.cssColorCPU) as Required<TMonitorRefs>;

    this.htmlMonitorCPURef = options.rootRef;
    this.htmlMonitorCPUSliderRef = options.sliderRef;
    this.htmlMonitorCPULabelRef = options.labelRef;
    return this.htmlMonitorCPURef;
  };

  createMonitorRAM = (): HTMLDivElement => {
    const options = this.createMonitor('crystools-monitor-ram', 'RAM', this.cssColorRAM) as Required<TMonitorRefs>;

    this.htmlMonitorRAMRef = options.rootRef;
    this.htmlMonitorRAMSliderRef = options.sliderRef;
    this.htmlMonitorRAMLabelRef = options.labelRef;
    return this.htmlMonitorRAMRef;
  };

  createMonitorGPU = (): HTMLDivElement => {
    const options = this.createMonitor('crystools-monitor-gpu', 'GPU', this.cssColorGPU) as Required<TMonitorRefs>;

    this.htmlMonitorGPURef = options.rootRef;
    this.htmlMonitorGPUSliderRef = options.sliderRef;
    this.htmlMonitorGPULabelRef = options.labelRef;
    return this.htmlMonitorGPURef;
  };

  createMonitorVRAM = (): HTMLDivElement => {
    const options = this.createMonitor('crystools-monitor-vram', 'VRAM', this.cssColorVRAM) as Required<TMonitorRefs>;

    this.htmlMonitorVRAMRef = options.rootRef;
    this.htmlMonitorVRAMSliderRef = options.sliderRef;
    this.htmlMonitorVRAMLabelRef = options.labelRef;
    return this.htmlMonitorVRAMRef;
  };

  createMonitorHDD = (): HTMLDivElement => {
    const options = this.createMonitor('crystools-monitor-hdd', 'HDD', this.cssColorHDD) as Required<TMonitorRefs>;

    this.htmlMonitorHDDRef = options.rootRef;
    this.htmlMonitorHDDSliderRef = options.sliderRef;
    this.htmlMonitorHDDLabelRef = options.labelRef;
    return this.htmlMonitorHDDRef;
  };

  registerListeners = (): void => {
    api.addEventListener('crystools.monitor', (event: CustomEvent) => {
      if (event?.detail === undefined) {
        return;
      }
      this.updateDisplay(event.detail);
    }, false);
  };
}

const crystoolsMonitor = new CrystoolsMonitor();
app.registerExtension({
  name: crystoolsMonitor.idExtensionName,
  setup: crystoolsMonitor.setup.bind(crystoolsMonitor),
});
