import { app } from './comfy/index.js';
import { ProgressBarUIBase } from './progressBarUI.js';
export class MonitorUI extends ProgressBarUIBase {
    constructor(monitorCPUElement, monitorRAMElement, monitorHDDElement, monitorGPUSettings, monitorVRAMSettings, monitorTemperatureSettings, currentRate) {
        super();
        Object.defineProperty(this, "monitorCPUElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: monitorCPUElement
        });
        Object.defineProperty(this, "monitorRAMElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: monitorRAMElement
        });
        Object.defineProperty(this, "monitorHDDElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: monitorHDDElement
        });
        Object.defineProperty(this, "monitorGPUSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: monitorGPUSettings
        });
        Object.defineProperty(this, "monitorVRAMSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: monitorVRAMSettings
        });
        Object.defineProperty(this, "monitorTemperatureSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: monitorTemperatureSettings
        });
        Object.defineProperty(this, "currentRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: currentRate
        });
        Object.defineProperty(this, "refreshDisplay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                console.log('refreshDisplay');
                this.updateAllWidget();
            }
        });
        Object.defineProperty(this, "createDOM", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.htmlContainer.append(this.createMonitor(this.monitorCPUElement));
                this.htmlContainer.append(this.createMonitor(this.monitorRAMElement));
                this.monitorGPUSettings.forEach((_monitorSettings, index) => {
                    this.monitorGPUSettings[index] && this.htmlContainer.append(this.createMonitor(this.monitorGPUSettings[index]));
                    this.monitorVRAMSettings[index] && this.htmlContainer.append(this.createMonitor(this.monitorVRAMSettings[index]));
                    this.monitorTemperatureSettings[index] &&
                        this.htmlContainer.append(this.createMonitor(this.monitorTemperatureSettings[index]));
                });
                this.htmlContainer.append(this.createMonitor(this.monitorHDDElement));
                this.updateAllAnimationDuration(this.currentRate);
                this.updateAllWidget();
            }
        });
        Object.defineProperty(this, "updateAllWidget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
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
            }
        });
        Object.defineProperty(this, "updateWidget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (monitorSettings) => {
                const value = app.ui.settings.getSettingValue(monitorSettings.id, monitorSettings.defaultValue);
                if (monitorSettings.htmlMonitorRef) {
                    monitorSettings.htmlMonitorRef.style.display = value ? 'flex' : 'none';
                }
            }
        });
        Object.defineProperty(this, "updateAllMonitors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (data) => {
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
                            return;
                        }
                        this.updateMonitor(monitorSettings, gpu.gpu_utilization);
                    }
                    else {
                    }
                });
                this.monitorVRAMSettings.forEach((monitorSettings, index) => {
                    if (data.gpus[index]) {
                        const gpu = data.gpus[index];
                        if (gpu === undefined) {
                            return;
                        }
                        this.updateMonitor(monitorSettings, gpu.vram_used_percent);
                    }
                    else {
                    }
                });
                this.monitorTemperatureSettings.forEach((monitorSettings, index) => {
                    if (data.gpus[index]) {
                        const gpu = data.gpus[index];
                        if (gpu === undefined) {
                            return;
                        }
                        this.updateMonitor(monitorSettings, gpu.gpu_temperature);
                        if (monitorSettings.cssColorFinal && monitorSettings.htmlMonitorSliderRef) {
                            monitorSettings.htmlMonitorSliderRef.style.backgroundColor =
                                `color-mix(in srgb, ${monitorSettings.cssColorFinal} ${gpu.gpu_temperature}%, ${monitorSettings.cssColor})`;
                        }
                    }
                    else {
                    }
                });
            }
        });
        Object.defineProperty(this, "updateMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (monitorSettings, percent) => {
                if (!(monitorSettings.htmlMonitorSliderRef && monitorSettings.htmlMonitorLabelRef)) {
                    return;
                }
                monitorSettings.htmlMonitorLabelRef.innerHTML = `${Math.floor(percent)}${monitorSettings.symbol}`;
                monitorSettings.htmlMonitorSliderRef.style.width = `${Math.floor(percent)}%`;
            }
        });
        Object.defineProperty(this, "updateAllAnimationDuration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (value) => {
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
            }
        });
        Object.defineProperty(this, "updatedAnimationDuration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (monitorSettings, value) => {
                const slider = monitorSettings.htmlMonitorSliderRef;
                if (!slider) {
                    return;
                }
                slider.style.transition = `width ${value.toFixed(1)}s`;
            }
        });
        Object.defineProperty(this, "createMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (monitorSettings) => {
                if (!monitorSettings) {
                    return document.createElement('div');
                }
                const htmlMain = document.createElement('div');
                htmlMain.setAttribute('id', monitorSettings.id);
                htmlMain.classList.add('crystools-monitor');
                monitorSettings.htmlMonitorRef = htmlMain;
                if (monitorSettings.title) {
                    htmlMain.title = monitorSettings.title;
                }
                const htmlMonitorText = document.createElement('div');
                htmlMonitorText.classList.add('crystools-text');
                htmlMonitorText.innerHTML = monitorSettings.label;
                htmlMain.append(htmlMonitorText);
                const htmlMonitorContent = document.createElement('div');
                htmlMonitorContent.classList.add('crystools-content');
                htmlMain.append(htmlMonitorContent);
                const htmlMonitorSlider = document.createElement('div');
                htmlMonitorSlider.classList.add('crystools-slider');
                if (monitorSettings.cssColorFinal) {
                    htmlMonitorSlider.style.backgroundColor =
                        `color-mix(in srgb, ${monitorSettings.cssColorFinal} 0%, ${monitorSettings.cssColor})`;
                }
                else {
                    htmlMonitorSlider.style.backgroundColor = monitorSettings.cssColor;
                }
                monitorSettings.htmlMonitorSliderRef = htmlMonitorSlider;
                htmlMonitorContent.append(htmlMonitorSlider);
                const htmlMonitorLabel = document.createElement('div');
                htmlMonitorLabel.classList.add('crystools-label');
                monitorSettings.htmlMonitorLabelRef = htmlMonitorLabel;
                htmlMonitorContent.append(htmlMonitorLabel);
                htmlMonitorLabel.innerHTML = '0%';
                return monitorSettings.htmlMonitorRef;
            }
        });
        this.createDOM();
    }
}
