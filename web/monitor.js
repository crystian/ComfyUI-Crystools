import { app } from '/scripts/app.js';
import { api } from '/scripts/api.js';
import { commonPrefix } from './common.js';
class CrystoolsMonitor {
    constructor() {
        Object.defineProperty(this, "idExtensionName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Crystools.monitor'
        });
        Object.defineProperty(this, "menuPrefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: commonPrefix
        });
        Object.defineProperty(this, "htmlIdCrystoolsRoot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'crystools-root'
        });
        Object.defineProperty(this, "htmlIdCrystoolsMonitorContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'crystools-monitor-container'
        });
        Object.defineProperty(this, "idInputRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Crystools.inputRate'
        });
        Object.defineProperty(this, "defaultRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: .5
        });
        Object.defineProperty(this, "idWhichHDD", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Crystools.whichHDD'
        });
        Object.defineProperty(this, "defaultWhichHDD", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: '/'
        });
        Object.defineProperty(this, "monitorCPUElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                id: 'Crystools.switchCPU',
                name: this.menuPrefix + '[menu] Display CPU monitor',
                type: 'boolean',
                label: 'CPU',
                defaultValue: true,
                htmlMonitorRef: undefined,
                htmlMonitorSliderRef: undefined,
                htmlMonitorLabelRef: undefined,
                cssColor: '#0AA015',
                onChange: async (value) => {
                    this.updateWidget(this.monitorCPUElement);
                    await this.updateServer({
                        switchCPU: value,
                    });
                },
            }
        });
        Object.defineProperty(this, "monitorRAMElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                id: 'Crystools.switchRAM',
                name: this.menuPrefix + '[menu] Display RAM monitor',
                type: 'boolean',
                label: 'RAM',
                defaultValue: true,
                htmlMonitorRef: undefined,
                htmlMonitorSliderRef: undefined,
                htmlMonitorLabelRef: undefined,
                cssColor: '#07630D',
                onChange: async (value) => {
                    this.updateWidget(this.monitorRAMElement);
                    await this.updateServer({
                        switchRAM: value,
                    });
                },
            }
        });
        Object.defineProperty(this, "monitorHDDElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                id: 'Crystools.switchHDD',
                name: this.menuPrefix + '[menu] Display partition disk monitor (HDD)',
                type: 'boolean',
                label: 'HDD',
                tooltip: `Drive: ${app.ui.settings.getSettingValue(this.idWhichHDD, this.defaultWhichHDD)}`,
                defaultValue: true,
                htmlMonitorRef: undefined,
                htmlMonitorSliderRef: undefined,
                htmlMonitorLabelRef: undefined,
                cssColor: '#730F92',
                onChange: async (value) => {
                    this.updateWidget(this.monitorHDDElement);
                    await this.updateServer({
                        switchHDD: value,
                    });
                },
            }
        });
        Object.defineProperty(this, "monitorGPUElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                id: 'Crystools.switchGPU',
                name: this.menuPrefix + '[menu] Display GPU monitor',
                type: 'boolean',
                label: 'GPU',
                defaultValue: true,
                htmlMonitorRef: undefined,
                htmlMonitorSliderRef: undefined,
                htmlMonitorLabelRef: undefined,
                cssColor: '#0C86F4',
                onChange: async (value) => {
                    this.updateWidget(this.monitorGPUElement);
                    await this.updateServer({
                        switchGPU: value,
                    });
                },
            }
        });
        Object.defineProperty(this, "monitorVRAMElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                id: 'Crystools.switchVRAM',
                name: this.menuPrefix + '[menu] Display Video RAM monitor',
                type: 'boolean',
                label: 'VRAM',
                defaultValue: true,
                htmlMonitorRef: undefined,
                htmlMonitorSliderRef: undefined,
                htmlMonitorLabelRef: undefined,
                cssColor: '#176EC7',
                onChange: async (value) => {
                    this.updateWidget(this.monitorVRAMElement);
                    await this.updateServer({
                        switchVRAM: value,
                    });
                },
            }
        });
        Object.defineProperty(this, "createSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                app.ui.settings.addSetting(this.monitorCPUElement);
                app.ui.settings.addSetting(this.monitorRAMElement);
                app.ui.settings.addSetting(this.monitorGPUElement);
                app.ui.settings.addSetting(this.monitorVRAMElement);
                app.ui.settings.addSetting(this.monitorHDDElement);
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
                    onChange: async (value) => {
                        let valueNumber;
                        try {
                            valueNumber = parseFloat(value);
                            if (isNaN(valueNumber)) {
                                throw new Error('invalid value');
                            }
                        }
                        catch (error) {
                            console.error(error);
                            return;
                        }
                        try {
                            await this.updateServer({
                                rate: valueNumber,
                            });
                        }
                        catch (error) {
                            console.error(error);
                            return;
                        }
                        if (valueNumber === 0) {
                            this.updateAllMonitors({
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
                        this.updateAllAnimationDuration(valueNumber);
                    },
                });
                void this.getHDDsFromServer().then((data) => {
                    const which = app.ui.settings.getSettingValue(this.idWhichHDD, this.defaultWhichHDD);
                    app.ui.settings.addSetting({
                        id: this.idWhichHDD,
                        name: this.menuPrefix + 'Partition to show (HDD)',
                        type: 'combo',
                        defaultValue: this.defaultWhichHDD,
                        options: (value) => data.map((m) => ({
                            value: m,
                            text: m,
                            selected: !value ? m === which : m === value,
                        })),
                        onChange: async (value) => {
                            await this.updateServer({
                                whichHDD: value,
                            });
                        },
                    });
                });
            }
        });
        Object.defineProperty(this, "updateServer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async (data) => {
                const resp = await api.fetchApi('/crystools/monitor', {
                    method: 'PATCH',
                    body: JSON.stringify(data),
                    cache: 'no-store',
                });
                if (resp.status === 200) {
                    return await resp.text();
                }
                throw new Error(resp.statusText);
            }
        });
        Object.defineProperty(this, "getHDDsFromServer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => {
                return this.getDataFromServer('HDD');
            }
        });
        Object.defineProperty(this, "getDataFromServer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async (what) => {
                const resp = await api.fetchApi(`/crystools/monitor/${what}`, {
                    method: 'GET',
                    cache: 'no-store',
                });
                if (resp.status === 200) {
                    return await resp.json();
                }
                throw new Error(resp.statusText);
            }
        });
        Object.defineProperty(this, "updateAllWidget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.updateWidget(this.monitorCPUElement);
                this.updateWidget(this.monitorRAMElement);
                this.updateWidget(this.monitorGPUElement);
                this.updateWidget(this.monitorVRAMElement);
                this.updateWidget(this.monitorHDDElement);
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
                const gpu = data.gpus[0] ? data.gpus[0] : {
                    gpu_utilization: 0, vram_used_percent: 0,
                };
                const gpu_utilization = gpu.gpu_utilization;
                const vram_used_percent = gpu.vram_used_percent;
                this.updateMonitor(this.monitorGPUElement, gpu_utilization);
                this.updateMonitor(this.monitorVRAMElement, vram_used_percent);
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
                monitorSettings.htmlMonitorLabelRef.innerHTML = `${Math.floor(percent)}%`;
                monitorSettings.htmlMonitorSliderRef.style.width = monitorSettings.htmlMonitorLabelRef.innerHTML;
                if (monitorSettings.tooltip) {
                    monitorSettings.htmlMonitorLabelRef.title = monitorSettings.tooltip;
                }
            }
        });
        Object.defineProperty(this, "updateAllAnimationDuration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (value) => {
                this.updatedAnimationDuration(this.monitorCPUElement, value);
                this.updatedAnimationDuration(this.monitorRAMElement, value);
                this.updatedAnimationDuration(this.monitorGPUElement, value);
                this.updatedAnimationDuration(this.monitorVRAMElement, value);
                this.updatedAnimationDuration(this.monitorHDDElement, value);
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
                const htmlMain = document.createElement('div');
                htmlMain.setAttribute('id', monitorSettings.id);
                htmlMain.style.margin = '2px 10px';
                htmlMain.style.height = '12px';
                htmlMain.style.position = 'relative';
                htmlMain.style.display = 'flex';
                htmlMain.style.alignItems = 'center';
                htmlMain.style.flexDirection = 'row';
                monitorSettings.htmlMonitorRef = htmlMain;
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
                htmlMonitorSlider.style.backgroundColor = monitorSettings.cssColor;
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
            }
        });
        Object.defineProperty(this, "registerListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                api.addEventListener('crystools.monitor', (event) => {
                    if (event?.detail === undefined) {
                        return;
                    }
                    this.updateAllMonitors(event.detail);
                }, false);
            }
        });
        this.createSettings();
    }
    setup() {
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
        htmlContainer.append(this.createMonitor(this.monitorGPUElement));
        htmlContainer.append(this.createMonitor(this.monitorVRAMElement));
        htmlContainer.append(this.createMonitor(this.monitorHDDElement));
        const currentRate = parseFloat(app.ui.settings.getSettingValue(this.idInputRate, this.defaultRate));
        this.updateAllAnimationDuration(currentRate);
        this.updateAllWidget();
        this.registerListeners();
    }
}
const crystoolsMonitor = new CrystoolsMonitor();
app.registerExtension({
    name: crystoolsMonitor.idExtensionName,
    setup: crystoolsMonitor.setup.bind(crystoolsMonitor),
});
