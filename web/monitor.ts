import { app, api } from './comfy/scripts.js';
import { commonPrefix } from './common.js';
import { MonitorUI } from './monitorUI.js';

class CrystoolsMonitor {
  idExtensionName = 'Crystools.monitor';
  menuPrefix = commonPrefix;

  monitorUI: MonitorUI;

  idInputRate = 'Crystools.inputRate';
  defaultRate = .5;
  idWhichHDD = 'Crystools.whichHDD';
  defaultWhichHDD = '/';
  monitorGPUSettings: TMonitorSettings[] = [];
  monitorVRAMSettings: TMonitorSettings[] = [];
  monitorTemperatureSettings: TMonitorSettings[] = [];

  // CPU Variables
  monitorCPUElement: TMonitorSettings = {
    id: 'Crystools.switchCPU',
    name: this.menuPrefix + ' [monitor] CPU Usage',
    type: 'boolean',
    label: 'CPU',
    symbol: '%',
    defaultValue: true,
    htmlMonitorRef: undefined,
    htmlMonitorSliderRef: undefined,
    htmlMonitorLabelRef: undefined,
    cssColor: '#0AA015',
    onChange: async(value: boolean) => {
      this.monitorUI?.updateWidget(this.monitorCPUElement);
      await this.updateServer({
        switchCPU: value,
      });
    },
  };

  // RAM Variables
  monitorRAMElement: TMonitorSettings = {
    id: 'Crystools.switchRAM',
    name: this.menuPrefix + ' [monitor] RAM Used',
    type: 'boolean',
    label: 'RAM',
    symbol: '%',
    defaultValue: true,
    htmlMonitorRef: undefined,
    htmlMonitorSliderRef: undefined,
    htmlMonitorLabelRef: undefined,
    cssColor: '#07630D',
    onChange: async(value: boolean) => {
      this.monitorUI?.updateWidget(this.monitorRAMElement);
      await this.updateServer({
        switchRAM: value,
      });
    },
  };

  // HDD Variables
  monitorHDDElement: TMonitorSettings = {
    id: 'Crystools.switchHDD',
    name: this.menuPrefix + ' [monitor] HDD Used',
    type: 'boolean',
    label: 'HDD',
    symbol: '%',
    tooltip: 'See Partition to show (HDD)',
    defaultValue: true,
    htmlMonitorRef: undefined,
    htmlMonitorSliderRef: undefined,
    htmlMonitorLabelRef: undefined,
    cssColor: '#730F92',
    onChange: async(value: boolean) => {
      this.monitorUI?.updateWidget(this.monitorHDDElement);
      await this.updateServer({
        switchHDD: value,
      });
    },
  };

  constructor() {
    this.createSettings();
  }

  createSettings = (): void => {
    app.ui.settings.addSetting(this.monitorCPUElement);
    app.ui.settings.addSetting(this.monitorRAMElement);
    app.ui.settings.addSetting(this.monitorHDDElement);

    app.ui.settings.addSetting({
      id: this.idInputRate,
      name: this.menuPrefix + '[monitor] Refresh rate',
      tooltip: 'This is the time (in seconds) between each update of the monitors, 0 means no refresh',
      type: 'slider',
      attrs: {
        min: 0,
        max: 5,
        step: 0.25,
      },
      defaultValue: this.defaultRate,
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
          this.monitorUI.updateAllMonitors({
            cpu_utilization: 0,
            device: 'cpu',

            gpus: [
              {
                gpu_utilization: 0,
                gpu_temperature: 0,
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

        this.monitorUI?.updateAllAnimationDuration(valueNumber);
      },
    });

    void this.getHDDsFromServer().then((data: string[]): void => {
      const which = app.ui.settings.getSettingValue(this.idWhichHDD, this.defaultWhichHDD);
      app.ui.settings.addSetting({
        id: this.idWhichHDD,
        name: this.menuPrefix + '[monitor] Partition to show',
        type: 'combo',
        defaultValue: this.defaultWhichHDD,
        // @ts-ignore bad definition from comfyUI: `options?: undefined;`??
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
      let moreThanOneGPU = false;
      if (gpus.length > 1) {
        moreThanOneGPU = true;
      }

      gpus?.forEach(({
        name, index
      }) => {

        if(name === undefined || index === undefined) {
          console.warn('getGPUsFromServer: name or index undefined', name, index);
          return;
        }

        let label = 'GPU';
        let labelVRAM = 'VRAM';
        let labelTemperature = 'Temp';
        if (moreThanOneGPU) {
          label = 'GPU '+index;
          labelVRAM = 'VRAM'+index;
          labelTemperature = 'Temp '+index;
        }

        // GPU Utilization Variables
        const monitorGPUNElement: TMonitorSettings = {
          id: 'Crystools.switchGPU' + index,
          name: this.menuPrefix + `[menu] Display GPU\r\n[${index}] ${name}`,
          type: 'boolean',
          label,
          symbol: '%',
          title: `${index}: ${name}`,
          defaultValue: true,
          htmlMonitorRef: undefined,
          htmlMonitorSliderRef: undefined,
          htmlMonitorLabelRef: undefined,
          cssColor: '#0C86F4',
          onChange: async(value: boolean) => {
            this.monitorUI?.updateWidget(monitorGPUNElement);
            void await this.updateServerGPU(index,{
              utilization: value
            });
          },
        };

        // GPU VRAM Variables
        const monitorVRAMNElement: TMonitorSettings = {
          id: 'Crystools.switchVRAM' + index,
          name: this.menuPrefix + `[menu] Display GPU VRAM\r\n[${index}] ${name}`,
          type: 'boolean',
          label: labelVRAM,
          symbol: '%',
          title: `${index}: ${name}`,
          defaultValue: true,
          htmlMonitorRef: undefined,
          htmlMonitorSliderRef: undefined,
          htmlMonitorLabelRef: undefined,
          cssColor: '#176EC7',
          onChange: async(value: boolean) => {
            this.monitorUI?.updateWidget(monitorVRAMNElement);
            void await this.updateServerGPU(index,{
              vram: value
            });
          },
        };

        // GPU Temperature Variables
        const monitorTemperatureNElement: TMonitorSettings = {
          id: 'Crystools.switchTemperature' + index,
          name: this.menuPrefix + `[menu] Display GPU Temperature\r\n[${index}] ${name}`,
          type: 'boolean',
          label: labelTemperature,
          symbol: '°',
          title: `${index}: ${name}`,
          defaultValue: true,
          htmlMonitorRef: undefined,
          htmlMonitorSliderRef: undefined,
          htmlMonitorLabelRef: undefined,
          cssColor: '#00ff00',
          cssColorFinal: '#ff0000',
          onChange: async(value: boolean) => {
            this.monitorUI?.updateWidget(monitorTemperatureNElement);
            void await this.updateServerGPU(index,{
              temperature: value
            });
          },
        };

        this.monitorGPUSettings[index] = monitorGPUNElement;
        this.monitorVRAMSettings[index] = monitorVRAMNElement;
        this.monitorTemperatureSettings[index] = monitorTemperatureNElement;
        // @ts-ignore
        app.ui.settings.addSetting(this.monitorGPUSettings[index]);
        // @ts-ignore
        app.ui.settings.addSetting(this.monitorVRAMSettings[index]);
        // @ts-ignore
        app.ui.settings.addSetting(this.monitorTemperatureSettings[index]);
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

  setup(): void {
    const currentRate = parseFloat(app.ui.settings.getSettingValue(this.idInputRate, this.defaultRate));

    this.monitorUI = new MonitorUI(
      this.monitorCPUElement,
      this.monitorRAMElement,
      this.monitorHDDElement,
      this.monitorGPUSettings,
      this.monitorVRAMSettings,
      this.monitorTemperatureSettings,
      currentRate
     );

    this.registerListeners();
  }

  registerListeners = (): void => {
    api.addEventListener('crystools.monitor', (event: CustomEvent) => {
      if (event?.detail === undefined) {
        return;
      }
      this.monitorUI.updateAllMonitors(event.detail);
    }, false);
  };
}

const crystoolsMonitor = new CrystoolsMonitor();
app.registerExtension({
  name: crystoolsMonitor.idExtensionName,
  setup: crystoolsMonitor.setup.bind(crystoolsMonitor),
});
