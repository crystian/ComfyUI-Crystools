import { app, api } from './comfy/index.js';
import { commonPrefix } from './common.js';
import { ProgressBarUI } from './progressBarUI.js';
import { ComfyKeyMenuDisplayOption, EStatus, MenuDisplayOptions } from './progressBarUIBase.js';
class CrystoolsProgressBar {
    constructor() {
        Object.defineProperty(this, "idExtensionName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Crystools.progressBar'
        });
        Object.defineProperty(this, "idShowProgressBar", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Crystools.ProgressBar'
        });
        Object.defineProperty(this, "defaultShowStatus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "menuPrefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: commonPrefix
        });
        Object.defineProperty(this, "menuDisplayOption", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: MenuDisplayOptions.Disabled
        });
        Object.defineProperty(this, "currentStatus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: EStatus.executed
        });
        Object.defineProperty(this, "currentProgress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "currentNode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        Object.defineProperty(this, "timeStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "progressBarUI", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "createSettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                app.ui.settings.addSetting({
                    id: this.idShowProgressBar,
                    name: 'Show progress bar',
                    category: ['Crystools', this.menuPrefix + ' Progress Bar', 'Show'],
                    tooltip: 'This apply only on "Disabled" (old) menu',
                    type: 'boolean',
                    defaultValue: this.defaultShowStatus,
                    onChange: this.progressBarUI.showProgressBar,
                });
            }
        });
        Object.defineProperty(this, "updateDisplay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (menuDisplayOption) => {
                if (menuDisplayOption !== this.menuDisplayOption) {
                    this.menuDisplayOption = menuDisplayOption;
                    this.progressBarUI.showSection(this.menuDisplayOption === MenuDisplayOptions.Disabled);
                }
                if (this.menuDisplayOption === MenuDisplayOptions.Disabled && this.progressBarUI.showProgressBarFlag) {
                    this.progressBarUI.updateDisplay(this.currentStatus, this.timeStart, this.currentProgress);
                }
            }
        });
        Object.defineProperty(this, "setup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                if (this.progressBarUI) {
                    this.progressBarUI
                        .showProgressBar(app.extensionManager.setting.get(this.idShowProgressBar));
                    return;
                }
                this.menuDisplayOption = app.extensionManager.setting.get(ComfyKeyMenuDisplayOption);
                app.ui.settings.addEventListener(`${ComfyKeyMenuDisplayOption}.change`, (e) => {
                    this.updateDisplay(e.detail.value);
                });
                const progressBarElement = document.createElement('div');
                progressBarElement.classList.add('crystools-monitors-container');
                this.progressBarUI = new ProgressBarUI(progressBarElement, (this.menuDisplayOption === MenuDisplayOptions.Disabled), this.centerNode);
                const parentElement = document.getElementById('queue-button');
                if (parentElement) {
                    parentElement.insertAdjacentElement('afterend', progressBarElement);
                }
                else {
                    console.error('Crystools: parentElement to move monitors not found!', parentElement);
                }
                this.createSettings();
                this.updateDisplay(this.menuDisplayOption);
                this.registerListeners();
            }
        });
        Object.defineProperty(this, "registerListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                api.addEventListener('status', ({ detail }) => {
                    this.currentStatus = this.currentStatus === EStatus.execution_error ? EStatus.execution_error : EStatus.executed;
                    const queueRemaining = detail?.exec_info.queue_remaining;
                    if (queueRemaining) {
                        this.currentStatus = EStatus.executing;
                    }
                    this.updateDisplay(this.menuDisplayOption);
                }, false);
                api.addEventListener('progress', ({ detail }) => {
                    const { value, max, node } = detail;
                    const progress = Math.floor((value / max) * 100);
                    if (!isNaN(progress) && progress >= 0 && progress <= 100) {
                        this.currentProgress = progress;
                        this.currentNode = node;
                    }
                    this.updateDisplay(this.menuDisplayOption);
                }, false);
                api.addEventListener('executed', ({ detail }) => {
                    if (detail?.node) {
                        this.currentNode = detail.node;
                    }
                    this.updateDisplay(this.menuDisplayOption);
                }, false);
                api.addEventListener('execution_start', ({ _detail }) => {
                    this.currentStatus = EStatus.executing;
                    this.timeStart = Date.now();
                    this.updateDisplay(this.menuDisplayOption);
                }, false);
                api.addEventListener('execution_error', ({ _detail }) => {
                    this.currentStatus = EStatus.execution_error;
                    this.updateDisplay(this.menuDisplayOption);
                }, false);
            }
        });
        Object.defineProperty(this, "centerNode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const id = this.currentNode;
                if (!id) {
                    return;
                }
                const node = app.graph.getNodeById(id);
                if (!node) {
                    return;
                }
                app.canvas.centerOnNode(node);
            }
        });
    }
}
const crystoolsProgressBar = new CrystoolsProgressBar();
app.registerExtension({
    name: crystoolsProgressBar.idExtensionName,
    setup: crystoolsProgressBar.setup,
});
