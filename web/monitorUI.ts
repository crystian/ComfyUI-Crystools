import { app } from './comfy/index.js';

export class MonitorUI {
  htmlIdCrystoolsRoot = 'crystools-root';
  htmlIdCrystoolsMonitorContainer = 'crystools-monitor-container';

  constructor(
    public monitorCPUElement: TMonitorSettings,
    public monitorRAMElement: TMonitorSettings,
    public monitorHDDElement: TMonitorSettings,
    public monitorGPUSettings: TMonitorSettings[],
    public monitorVRAMSettings: TMonitorSettings[],
    public monitorTemperatureSettings: TMonitorSettings[],
    public currentRate: number
  ) {
    this.createVertical();

    window.addEventListener('resize', this.refreshDisplay);
  }

  refreshDisplay = (): void => {
    console.log('refreshDisplay');
    this.updateAllWidget();
  };

  createVertical = (): void => {
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

    htmlContainer.append(this.createMonitor(this.monitorCPUElement));
    htmlContainer.append(this.createMonitor(this.monitorRAMElement));

    // gpu0 > gpu1 > vram0 > vram1
    // this.monitorGPUSettings.forEach((monitorSettings) => {
    //   monitorSettings && htmlContainer.append(this.createMonitor(monitorSettings));
    // });
    // this.monitorVRAMSettings.forEach((monitorSettings) => {
    //   monitorSettings && htmlContainer.append(this.createMonitor(monitorSettings));
    // });
    // this.monitorTemperatureSettings.forEach((monitorSettings) => {
    //   monitorSettings && htmlContainer.append(this.createMonitor(monitorSettings));
    // });

    // gpu0 > vram0 > gpu1 > vram1
    this.monitorGPUSettings.forEach((_monitorSettings, index) => {
      this.monitorGPUSettings[index] && htmlContainer.append(this.createMonitor(this.monitorGPUSettings[index]));
      this.monitorVRAMSettings[index] && htmlContainer.append(this.createMonitor(this.monitorVRAMSettings[index]));
      this.monitorTemperatureSettings[index] &&
      htmlContainer.append(this.createMonitor(this.monitorTemperatureSettings[index]));
    });

    htmlContainer.append(this.createMonitor(this.monitorHDDElement));

    this.updateAllAnimationDuration(this.currentRate);
    this.updateAllWidget();
  };


  updateAllWidget = (): void => {
    this.updateWidget(this.monitorCPUElement);
    this.updateWidget(this.monitorRAMElement);
    this.updateWidget(this.monitorHDDElement);

    this.monitorGPUSettings.forEach((monitorSettings) => {
      monitorSettings && this.updateWidget(monitorSettings);
    });
    this.monitorVRAMSettings.forEach((monitorSettings) => {
      monitorSettings && this.updateWidget(monitorSettings);
    });
    this.monitorTemperatureSettings.forEach((monitorSettings) => {
      monitorSettings && this.updateWidget(monitorSettings);
    });
  };

  updateWidget = (monitorSettings: TMonitorSettings): void => {
    const value = app.ui.settings.getSettingValue(monitorSettings.id, monitorSettings.defaultValue);
    if (monitorSettings.htmlMonitorRef) {
      monitorSettings.htmlMonitorRef.style.display = value ? 'flex' : 'none';
    }
  };

  updateAllMonitors = (data: TStatsData): void => {
    // console.log('updateAllMonitors', data);
    this.updateMonitor(this.monitorCPUElement, data.cpu_utilization);
    this.updateMonitor(this.monitorRAMElement, data.ram_used_percent);
    this.updateMonitor(this.monitorHDDElement, data.hdd_used_percent);

    if (data.gpus === undefined || data.gpus.length === 0) {
      console.warn('UpdateAllMonitors: no GPU data');
      return;
    }

    this.monitorGPUSettings.forEach((monitorSettings, index) => {
      if (data.gpus[index]) {
        const gpu = data.gpus[index];
        if (gpu === undefined) {
          // console.error('UpdateAllMonitors: no GPU data for index', index);
          return;
        }

        this.updateMonitor(monitorSettings, gpu.gpu_utilization);
      } else {
        // console.error('UpdateAllMonitors: no GPU data for index', index);
      }
    });

    this.monitorVRAMSettings.forEach((monitorSettings, index) => {
      if (data.gpus[index]) {
        const gpu = data.gpus[index];
        if (gpu === undefined) {
          // console.error('UpdateAllMonitors: no GPU VRAM data for index', index);
          return;
        }

        this.updateMonitor(monitorSettings, gpu.vram_used_percent);
      } else {
        // console.error('UpdateAllMonitors: no GPU VRAM data for index', index);
      }
    });

    this.monitorTemperatureSettings.forEach((monitorSettings, index) => {
      if (data.gpus[index]) {
        const gpu = data.gpus[index];
        if (gpu === undefined) {
          // console.error('UpdateAllMonitors: no GPU VRAM data for index', index);
          return;
        }

        this.updateMonitor(monitorSettings, gpu.gpu_temperature);
        if(monitorSettings.cssColorFinal && monitorSettings.htmlMonitorSliderRef){
          monitorSettings.htmlMonitorSliderRef.style.backgroundColor =
            `color-mix(in srgb, ${monitorSettings.cssColorFinal} ${gpu.gpu_temperature}%, ${monitorSettings.cssColor})`;
        }
      } else {
        // console.error('UpdateAllMonitors: no GPU VRAM data for index', index);
      }
    });
  };

  updateMonitor = (monitorSettings: TMonitorSettings, percent: number): void => {
    if (!(monitorSettings.htmlMonitorSliderRef && monitorSettings.htmlMonitorLabelRef)) {
      return;
    }

    monitorSettings.htmlMonitorLabelRef.innerHTML = `${Math.floor(percent)}${monitorSettings.symbol}`;
    monitorSettings.htmlMonitorSliderRef.style.width = `${Math.floor(percent)}%`;
  };

  updateAllAnimationDuration = (value: number): void => {
    this.updatedAnimationDuration(this.monitorCPUElement, value);
    this.updatedAnimationDuration(this.monitorRAMElement, value);
    this.updatedAnimationDuration(this.monitorHDDElement, value);
    this.monitorGPUSettings.forEach((monitorSettings) => {
      monitorSettings && this.updatedAnimationDuration(monitorSettings, value);
    });
    this.monitorVRAMSettings.forEach((monitorSettings) => {
      monitorSettings && this.updatedAnimationDuration(monitorSettings, value);
    });
    this.monitorTemperatureSettings.forEach((monitorSettings) => {
      monitorSettings && this.updatedAnimationDuration(monitorSettings, value);
    });
  };

  updatedAnimationDuration = (monitorSettings: TMonitorSettings, value: number): void => {
    const slider = monitorSettings.htmlMonitorSliderRef;
    if (!slider) {
      return;
    }

    slider.style.transition = `width ${value.toFixed(1)}s`;
  };


  createMonitor = (monitorSettings?: TMonitorSettings): HTMLDivElement => {
    if (!monitorSettings) {
      // just for typescript
      return document.createElement('div');
    }
    const htmlMain = document.createElement('div');
    htmlMain.setAttribute('id', monitorSettings.id);
    htmlMain.style.margin = '2px 10px';
    htmlMain.style.height = '12px';
    htmlMain.style.position = 'relative';
    htmlMain.style.display = 'flex';
    htmlMain.style.alignItems = 'center';
    htmlMain.style.flexDirection = 'row';
    monitorSettings.htmlMonitorRef = htmlMain;

    if (monitorSettings.title) {
      htmlMain.title = monitorSettings.title;
    }

    const htmlMonitorText = document.createElement('div');
    htmlMonitorText.style.width = '35px';
    htmlMonitorText.style.fontSize = '10px';
    htmlMonitorText.innerHTML = monitorSettings.label;
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
    if(monitorSettings.cssColorFinal){
      htmlMonitorSlider.style.backgroundColor =
        `color-mix(in srgb, ${monitorSettings.cssColorFinal} 0%, ${monitorSettings.cssColor})`;
    } else {
      htmlMonitorSlider.style.backgroundColor = monitorSettings.cssColor;
    }
    monitorSettings.htmlMonitorSliderRef = htmlMonitorSlider;
    htmlMonitorContent.append(htmlMonitorSlider);

    const htmlMonitorLabel = document.createElement('div');
    htmlMonitorLabel.style.position = 'relative';
    htmlMonitorLabel.style.width = '100%';
    htmlMonitorLabel.style.color = 'var(--drag-text)';
    htmlMonitorLabel.style.fontSize = '10px';
    htmlMonitorLabel.innerHTML = '0%';
    monitorSettings.htmlMonitorLabelRef = htmlMonitorLabel;
    htmlMonitorContent.append(htmlMonitorLabel);

    return monitorSettings.htmlMonitorRef;
  };
}
