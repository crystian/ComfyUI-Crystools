import { ProgressBarUIBase } from './progressBarUIBase.js';
export class MonitorHorizontalUI extends ProgressBarUIBase {
    constructor(monitorCPUElement, monitorRAMElement, monitorHDDElement, monitorGPUSettings, monitorVRAMSettings, monitorTemperatureSettings, currentRate, showSection) {
        super('comfyui-menu-push', 'crystools-root-horizontal', showSection);
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
        Object.defineProperty(this, "createDOM", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.htmlContainer.style.order = '2';
                this.htmlContainer.append(this.createMonitor(this.monitorCPUElement));
            }
        });
        Object.defineProperty(this, "createDOMGPUMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (monitorSettings) => {
            }
        });
        Object.defineProperty(this, "orderMonitors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
            }
        });
        Object.defineProperty(this, "updateAllWidget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.updateWidget(this.monitorCPUElement);
            }
        });
        Object.defineProperty(this, "updateWidget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (monitorSettings) => {
            }
        });
        Object.defineProperty(this, "updateDisplay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (data) => {
            }
        });
        Object.defineProperty(this, "updateMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (monitorSettings, percent) => {
            }
        });
        Object.defineProperty(this, "updateAllAnimationDuration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (value) => {
            }
        });
        Object.defineProperty(this, "updatedAnimationDuration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (monitorSettings, value) => {
            }
        });
        Object.defineProperty(this, "createMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (monitorSettings) => {
                console.log('createMonitor', monitorSettings);
                if (!monitorSettings) {
                    return document.createElement('div');
                }
                const htmlMain = document.createElement('div');
                htmlMain.classList.add(monitorSettings.id);
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
