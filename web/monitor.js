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
        Object.defineProperty(this, "idSwitchCPU", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Crystools.switchCPU'
        });
        Object.defineProperty(this, "defaultSwitchCPU", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "htmlMonitorCPURef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "htmlMonitorCPUSliderRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "htmlMonitorCPULabelRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "cssColorCPU", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: '#0AA015'
        });
        Object.defineProperty(this, "idSwitchRAM", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Crystools.switchRAM'
        });
        Object.defineProperty(this, "defaultSwitchRAM", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "htmlMonitorRAMRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "htmlMonitorRAMSliderRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "htmlMonitorRAMLabelRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "cssColorRAM", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: '#07630D'
        });
        Object.defineProperty(this, "idSwitchGPU", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Crystools.switchGPU'
        });
        Object.defineProperty(this, "defaultSwitchGPU", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "htmlMonitorGPURef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "htmlMonitorGPUSliderRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "htmlMonitorGPULabelRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "cssColorGPU", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: '#0C86F4'
        });
        Object.defineProperty(this, "idSwitchVRAM", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Crystools.switchVRAM'
        });
        Object.defineProperty(this, "defaultSwitchVRAM", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "htmlMonitorVRAMRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "htmlMonitorVRAMSliderRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "htmlMonitorVRAMLabelRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "cssColorVRAM", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: '#176EC7'
        });
        Object.defineProperty(this, "idSwitchHDD", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Crystools.switchHDD'
        });
        Object.defineProperty(this, "defaultSwitchHDD", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "htmlMonitorHDDRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "htmlMonitorHDDSliderRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "htmlMonitorHDDLabelRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "cssColorHDD", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: '#730F92'
        });
        Object.defineProperty(this, "createSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                app.ui.settings.addSetting({
                    id: this.idSwitchCPU,
                    name: this.menuPrefix + 'Display CPU monitor [menu]',
                    type: 'boolean',
                    defaultValue: this.defaultSwitchCPU,
                    onChange: async (value) => {
                        this.updateWidget(this.htmlMonitorCPURef, value);
                        await this.updateServer({
                            switchCPU: value,
                        });
                    },
                });
                app.ui.settings.addSetting({
                    id: this.idSwitchRAM,
                    name: this.menuPrefix + 'Display RAM monitor [menu]',
                    type: 'boolean',
                    defaultValue: this.defaultSwitchRAM,
                    onChange: async (value) => {
                        this.updateWidget(this.htmlMonitorRAMRef, value);
                        await this.updateServer({
                            switchRAM: value,
                        });
                    },
                });
                app.ui.settings.addSetting({
                    id: this.idSwitchGPU,
                    name: this.menuPrefix + 'Display GPU monitor [menu]',
                    type: 'boolean',
                    defaultValue: this.defaultSwitchGPU,
                    onChange: async (value) => {
                        this.updateWidget(this.htmlMonitorGPURef, value);
                        await this.updateServer({
                            switchGPU: value,
                        });
                    },
                });
                app.ui.settings.addSetting({
                    id: this.idSwitchVRAM,
                    name: this.menuPrefix + 'Display Video RAM monitor [menu]',
                    type: 'boolean',
                    defaultValue: this.defaultSwitchVRAM,
                    onChange: async (value) => {
                        this.updateWidget(this.htmlMonitorVRAMRef, value);
                        await this.updateServer({
                            switchVRAM: value,
                        });
                    },
                });
                app.ui.settings.addSetting({
                    id: this.idSwitchHDD,
                    name: this.menuPrefix + 'Display Hard disk monitor [menu]',
                    tooltip: 'Only the drive where the comfyUI is installed',
                    type: 'boolean',
                    defaultValue: this.defaultSwitchHDD,
                    onChange: async (value) => {
                        this.updateWidget(this.htmlMonitorHDDRef, value);
                        await this.updateServer({
                            switchHDD: value,
                        });
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
                        if (this.htmlMonitorCPUSliderRef) {
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
        Object.defineProperty(this, "updateAllWidget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.updateWidget(this.htmlMonitorCPURef, app.ui.settings.getSettingValue(this.idSwitchCPU, this.defaultSwitchCPU));
                this.updateWidget(this.htmlMonitorGPURef, app.ui.settings.getSettingValue(this.idSwitchGPU, this.defaultSwitchGPU));
                this.updateWidget(this.htmlMonitorHDDRef, app.ui.settings.getSettingValue(this.idSwitchHDD, this.defaultSwitchHDD));
                this.updateWidget(this.htmlMonitorRAMRef, app.ui.settings.getSettingValue(this.idSwitchRAM, this.defaultSwitchRAM));
                this.updateWidget(this.htmlMonitorVRAMRef, app.ui.settings.getSettingValue(this.idSwitchVRAM, this.defaultSwitchVRAM));
            }
        });
        Object.defineProperty(this, "updateWidget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (container, value) => {
                if (container) {
                    container.style.display = value ? 'flex' : 'none';
                }
            }
        });
        Object.defineProperty(this, "updateDisplay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (data) => {
                if (!this.htmlMonitorCPULabelRef) {
                    return;
                }
                this.htmlMonitorCPULabelRef.innerHTML = `${Math.floor(data.cpu_utilization)}%`;
                this.htmlMonitorCPUSliderRef.style.width = this.htmlMonitorCPULabelRef.innerHTML;
                const gpu = data.gpus[0];
                if (gpu) {
                    this.htmlMonitorGPULabelRef.innerHTML = `${Math.floor(gpu.gpu_utilization)}%`;
                    this.htmlMonitorGPUSliderRef.style.width = this.htmlMonitorGPULabelRef.innerHTML;
                    this.htmlMonitorVRAMLabelRef.innerHTML = `${Math.floor(gpu.vram_used_percent)}%`;
                    this.htmlMonitorVRAMSliderRef.style.width = this.htmlMonitorVRAMLabelRef.innerHTML;
                }
                else {
                    console.error('no gpu found');
                }
                this.htmlMonitorHDDLabelRef.innerHTML = `${Math.floor(data.hdd_used_percent)}%`;
                this.htmlMonitorHDDSliderRef.style.width = this.htmlMonitorHDDLabelRef.innerHTML;
                this.htmlMonitorRAMLabelRef.innerHTML = `${Math.floor(data.ram_used_percent)}%`;
                this.htmlMonitorRAMSliderRef.style.width = this.htmlMonitorRAMLabelRef.innerHTML;
            }
        });
        Object.defineProperty(this, "createMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (id, label, color) => {
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
            }
        });
        Object.defineProperty(this, "createMonitorCPU", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const options = this.createMonitor('crystools-monitor-cpu', 'CPU', this.cssColorCPU);
                this.htmlMonitorCPURef = options.rootRef;
                this.htmlMonitorCPUSliderRef = options.sliderRef;
                this.htmlMonitorCPULabelRef = options.labelRef;
                return this.htmlMonitorCPURef;
            }
        });
        Object.defineProperty(this, "createMonitorRAM", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const options = this.createMonitor('crystools-monitor-ram', 'RAM', this.cssColorRAM);
                this.htmlMonitorRAMRef = options.rootRef;
                this.htmlMonitorRAMSliderRef = options.sliderRef;
                this.htmlMonitorRAMLabelRef = options.labelRef;
                return this.htmlMonitorRAMRef;
            }
        });
        Object.defineProperty(this, "createMonitorGPU", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const options = this.createMonitor('crystools-monitor-gpu', 'GPU', this.cssColorGPU);
                this.htmlMonitorGPURef = options.rootRef;
                this.htmlMonitorGPUSliderRef = options.sliderRef;
                this.htmlMonitorGPULabelRef = options.labelRef;
                return this.htmlMonitorGPURef;
            }
        });
        Object.defineProperty(this, "createMonitorVRAM", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const options = this.createMonitor('crystools-monitor-vram', 'VRAM', this.cssColorVRAM);
                this.htmlMonitorVRAMRef = options.rootRef;
                this.htmlMonitorVRAMSliderRef = options.sliderRef;
                this.htmlMonitorVRAMLabelRef = options.labelRef;
                return this.htmlMonitorVRAMRef;
            }
        });
        Object.defineProperty(this, "createMonitorHDD", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const options = this.createMonitor('crystools-monitor-hdd', 'HDD', this.cssColorHDD);
                this.htmlMonitorHDDRef = options.rootRef;
                this.htmlMonitorHDDSliderRef = options.sliderRef;
                this.htmlMonitorHDDLabelRef = options.labelRef;
                return this.htmlMonitorHDDRef;
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
                    this.updateDisplay(event.detail);
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
            parentElement.insertAdjacentElement('afterend', ctoolsRoot);
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
}
const crystoolsMonitor = new CrystoolsMonitor();
app.registerExtension({
    name: crystoolsMonitor.idExtensionName,
    setup: crystoolsMonitor.setup.bind(crystoolsMonitor),
});
