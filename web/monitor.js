import { app, api } from './comfy/index.js';
import { commonPrefix } from './common.js';
import { MonitorUI } from './monitorUI.js';
import { Colors } from './styles.js';
import { convertNumberToPascalCase } from './utils.js';
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
        Object.defineProperty(this, "monitorUI", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
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
        Object.defineProperty(this, "monitorTemperatureSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "settingsRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                id: 'Crystools.RefreshRate',
                name: 'Refresh per second',
                category: ['Crystools', this.menuPrefix + ' Refresh Rate'],
                tooltip: 'This is the time (in seconds) between each update of the monitors, 0 means no refresh',
                type: 'slider',
                attrs: {
                    min: 0,
                    max: 2,
                    step: 0.25,
                },
                defaultValue: .5,
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
                        await this.updateServer({ rate: valueNumber });
                    }
                    catch (error) {
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
            }
        });
        Object.defineProperty(this, "monitorCPUElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                id: 'Crystools.ShowCpu',
                name: 'CPU Usage',
                category: ['Crystools', this.menuPrefix + ' Hardware', 'Cpu'],
                type: 'boolean',
                label: 'CPU',
                symbol: '%',
                defaultValue: true,
                htmlMonitorRef: undefined,
                htmlMonitorSliderRef: undefined,
                htmlMonitorLabelRef: undefined,
                cssColor: Colors.CPU,
                onChange: async (value) => {
                    this.monitorUI?.updateWidget(this.monitorCPUElement);
                    await this.updateServer({ switchCPU: value });
                },
            }
        });
        Object.defineProperty(this, "monitorRAMElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                id: 'Crystools.ShowRam',
                name: 'RAM Used',
                category: ['Crystools', this.menuPrefix + ' Hardware', 'Ram'],
                type: 'boolean',
                label: 'RAM',
                symbol: '%',
                defaultValue: true,
                htmlMonitorRef: undefined,
                htmlMonitorSliderRef: undefined,
                htmlMonitorLabelRef: undefined,
                cssColor: Colors.RAM,
                onChange: async (value) => {
                    this.monitorUI?.updateWidget(this.monitorRAMElement);
                    await this.updateServer({ switchRAM: value });
                },
            }
        });
        Object.defineProperty(this, "monitorHDDElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                id: 'Crystools.ShowHdd',
                name: 'Show HDD Used',
                category: ['Crystools', this.menuPrefix + ' Show Hard Disk', 'Show'],
                type: 'boolean',
                label: 'HDD',
                symbol: '%',
                defaultValue: false,
                htmlMonitorRef: undefined,
                htmlMonitorSliderRef: undefined,
                htmlMonitorLabelRef: undefined,
                cssColor: Colors.DISK,
                onChange: async (value) => {
                    this.monitorUI?.updateWidget(this.monitorHDDElement);
                    await this.updateServer({ switchHDD: value });
                },
            }
        });
        Object.defineProperty(this, "settingsHDD", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                id: 'Crystools.WhichHdd',
                name: 'Partition to show',
                category: ['Crystools', this.menuPrefix + ' Show Hard Disk', 'Which'],
                type: 'combo',
                defaultValue: '/',
                data: [],
                options: (value) => {
                    const which = app.ui.settings.getSettingValue(this.settingsHDD.id, this.settingsHDD.defaultValue);
                    return this.settingsHDD.data.map((m) => ({
                        value: m,
                        text: m,
                        selected: !value ? m === which : m === value,
                    }));
                },
                onChange: async (value) => {
                    await this.updateServer({ whichHDD: value });
                },
            }
        });
        Object.defineProperty(this, "createSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                app.ui.settings.addSetting(this.settingsRate);
                app.ui.settings.addSetting(this.monitorRAMElement);
                app.ui.settings.addSetting(this.monitorCPUElement);
                void this.getHDDsFromServer().then((data) => {
                    this.settingsHDD.data = data;
                    app.ui.settings.addSetting(this.settingsHDD);
                });
                app.ui.settings.addSetting(this.monitorHDDElement);
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
                        let labelTemperature = 'Temp';
                        if (moreThanOneGPU) {
                            label = 'GPU ' + index;
                            labelVRAM = 'VRAM' + index;
                            labelTemperature = 'Temp ' + index;
                        }
                        const monitorGPUNElement = {
                            id: 'Crystools.ShowGpuUsage' + convertNumberToPascalCase(index),
                            name: ' Usage',
                            category: ['Crystools', `${this.menuPrefix} Show GPU [${index}] ${name}`, 'Usage'],
                            type: 'boolean',
                            label,
                            symbol: '%',
                            title: `${index}: ${name}`,
                            defaultValue: true,
                            htmlMonitorRef: undefined,
                            htmlMonitorSliderRef: undefined,
                            htmlMonitorLabelRef: undefined,
                            cssColor: Colors.GPU,
                            onChange: async (value) => {
                                this.monitorUI?.updateWidget(monitorGPUNElement);
                                void await this.updateServerGPU(index, { utilization: value });
                            },
                        };
                        const monitorVRAMNElement = {
                            id: 'Crystools.ShowGpuVram' + convertNumberToPascalCase(index),
                            name: 'VRAM',
                            category: ['Crystools', `${this.menuPrefix} Show GPU [${index}] ${name}`, 'VRAM'],
                            type: 'boolean',
                            label: labelVRAM,
                            symbol: '%',
                            title: `${index}: ${name}`,
                            defaultValue: true,
                            htmlMonitorRef: undefined,
                            htmlMonitorSliderRef: undefined,
                            htmlMonitorLabelRef: undefined,
                            cssColor: Colors.VRAM,
                            onChange: async (value) => {
                                this.monitorUI?.updateWidget(monitorVRAMNElement);
                                void await this.updateServerGPU(index, { vram: value });
                            },
                        };
                        const monitorTemperatureNElement = {
                            id: 'Crystools.ShowGpuTemperature' + convertNumberToPascalCase(index),
                            name: 'Temperature',
                            category: ['Crystools', `${this.menuPrefix} Show GPU [${index}] ${name}`, 'Temperature'],
                            type: 'boolean',
                            label: labelTemperature,
                            symbol: '°',
                            title: `${index}: ${name}`,
                            defaultValue: true,
                            htmlMonitorRef: undefined,
                            htmlMonitorSliderRef: undefined,
                            htmlMonitorLabelRef: undefined,
                            cssColor: Colors.TEMP_START,
                            cssColorFinal: Colors.TEMP_END,
                            onChange: async (value) => {
                                this.monitorUI?.updateWidget(monitorTemperatureNElement);
                                void await this.updateServerGPU(index, { temperature: value });
                            },
                        };
                        this.monitorGPUSettings[index] = monitorGPUNElement;
                        this.monitorVRAMSettings[index] = monitorVRAMNElement;
                        this.monitorTemperatureSettings[index] = monitorTemperatureNElement;
                        app.ui.settings.addSetting(this.monitorTemperatureSettings[index]);
                        app.ui.settings.addSetting(this.monitorVRAMSettings[index]);
                        app.ui.settings.addSetting(this.monitorGPUSettings[index]);
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
        Object.defineProperty(this, "registerListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                api.addEventListener('crystools.monitor', (event) => {
                    if (event?.detail === undefined) {
                        return;
                    }
                    this.monitorUI.updateAllMonitors(event.detail);
                }, false);
            }
        });
        this.createSettings();
    }
    setup() {
        const currentRate = parseFloat(app.ui.settings.getSettingValue(this.settingsRate.id, this.settingsRate.defaultValue));
        this.monitorUI = new MonitorUI(this.monitorCPUElement, this.monitorRAMElement, this.monitorHDDElement, this.monitorGPUSettings, this.monitorVRAMSettings, this.monitorTemperatureSettings, currentRate);
        this.registerListeners();
    }
}
const crystoolsMonitor = new CrystoolsMonitor();
app.registerExtension({
    name: crystoolsMonitor.idExtensionName,
    setup: crystoolsMonitor.setup.bind(crystoolsMonitor),
});
