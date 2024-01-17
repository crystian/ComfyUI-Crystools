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
        Object.defineProperty(this, "monitorGPUSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "monitorVRAMSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "monitorCPUElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                id: 'Crystools.switchCPU',
                name: this.menuPrefix + ' [monitor] CPU Usage',
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
                name: this.menuPrefix + ' [monitor] RAM Used',
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
                name: this.menuPrefix + ' [monitor] HDD Used',
                type: 'boolean',
                label: 'HDD',
                tooltip: 'See Partition to show (HDD)',
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
        Object.defineProperty(this, "createSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
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
                        name: this.menuPrefix + '[monitor] Partition to show',
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
                void this.getGPUsFromServer().then((gpus) => {
                    let moreThanOneGPU = false;
                    if (gpus.length > 1) {
                        moreThanOneGPU = true;
                    }
                    gpus?.forEach(({ name, index }) => {
                        if (name === undefined || index === undefined) {
                            console.warn('getGPUsFromServer: name or index undefined', name, index);
                            return;
                        }
                        let label = 'GPU';
                        let labelVRAM = 'VRAM';
                        if (moreThanOneGPU) {
                            label = 'GPU ' + index;
                            labelVRAM = 'VRAM' + index;
                        }
                        const monitorGPUNElement = {
                            id: 'Crystools.switchGPU' + index,
                            name: this.menuPrefix + `[menu] Display GPU monitor\r\n[${index}] ${name}`,
                            type: 'boolean',
                            label,
                            title: `${index}: ${name}`,
                            defaultValue: true,
                            htmlMonitorRef: undefined,
                            htmlMonitorSliderRef: undefined,
                            htmlMonitorLabelRef: undefined,
                            cssColor: '#0C86F4',
                            onChange: async (value) => {
                                this.updateWidget(monitorGPUNElement);
                                void await this.updateServerGPU(index, {
                                    utilization: value
                                });
                            },
                        };
                        const monitorVRAMNElement = {
                            id: 'Crystools.switchVRAM' + index,
                            name: this.menuPrefix + `[menu] Display GPU VRAM monitor\r\n[${index}] ${name}`,
                            type: 'boolean',
                            label: labelVRAM,
                            title: `${index}: ${name}`,
                            defaultValue: true,
                            htmlMonitorRef: undefined,
                            htmlMonitorSliderRef: undefined,
                            htmlMonitorLabelRef: undefined,
                            cssColor: '#176EC7',
                            onChange: async (value) => {
                                this.updateWidget(monitorVRAMNElement);
                                void await this.updateServerGPU(index, {
                                    vram: value
                                });
                            },
                        };
                        this.monitorGPUSettings[index] = monitorGPUNElement;
                        this.monitorVRAMSettings[index] = monitorVRAMNElement;
                        app.ui.settings.addSetting(this.monitorGPUSettings[index]);
                        app.ui.settings.addSetting(this.monitorVRAMSettings[index]);
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
        Object.defineProperty(this, "updateServerGPU", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async (index, data) => {
                const resp = await api.fetchApi(`/crystools/monitor/GPU/${index}`, {
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
        Object.defineProperty(this, "getGPUsFromServer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => {
                return this.getDataFromServer('GPU');
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
                this.updateWidget(this.monitorHDDElement);
                this.monitorGPUSettings.forEach((monitorSettings) => {
                    monitorSettings && this.updateWidget(monitorSettings);
                });
                this.monitorVRAMSettings.forEach((monitorSettings) => {
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
        this.monitorGPUSettings.forEach((monitorSettings) => {
            monitorSettings && htmlContainer.append(this.createMonitor(monitorSettings));
        });
        this.monitorVRAMSettings.forEach((monitorSettings) => {
            monitorSettings && htmlContainer.append(this.createMonitor(monitorSettings));
        });
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
