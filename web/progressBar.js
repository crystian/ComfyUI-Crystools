import { app, api } from './comfy/scripts.js';
import { commonPrefix } from './common.js';
import { EStatus, ProgressBarUI } from './progressBarUI.js';
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
            value: 'Crystools.showStatus'
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
        Object.defineProperty(this, "htmlIdCrystoolsRoot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'crystools-root'
        });
        Object.defineProperty(this, "htmlIdCrystoolsProgressBarContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'crystools-progress-bar-container'
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
        Object.defineProperty(this, "htmlProgressSliderRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        Object.defineProperty(this, "htmlProgressLabelRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        Object.defineProperty(this, "progressBarVertical", {
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
                    name: this.menuPrefix + '[monitor] Show progress bar',
                    type: 'boolean',
                    defaultValue: this.defaultShowStatus,
                    onChange: this.showProgressBar,
                });
            }
        });
        Object.defineProperty(this, "showProgressBar", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (value) => {
                const container = document.getElementById(this.htmlIdCrystoolsProgressBarContainer);
                if (container) {
                    container.style.display = value ? 'block' : 'none';
                }
            }
        });
        Object.defineProperty(this, "updateDisplay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.progressBarVertical.updateDisplay(this.currentStatus, this.timeStart, this.currentProgress);
            }
        });
        Object.defineProperty(this, "registerListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                api.addEventListener('status', ({ detail, }) => {
                    this.currentStatus = this.currentStatus === EStatus.execution_error ? EStatus.execution_error : EStatus.executed;
                    const queueRemaining = detail?.exec_info.queue_remaining;
                    if (queueRemaining) {
                        this.currentStatus = EStatus.executing;
                    }
                    this.updateDisplay();
                }, false);
                api.addEventListener('progress', ({ detail, }) => {
                    const { value, max, node, } = detail;
                    const progress = Math.floor((value / max) * 100);
                    if (!isNaN(progress) && progress >= 0 && progress <= 100) {
                        this.currentProgress = progress;
                        this.currentNode = node;
                    }
                    this.updateDisplay();
                }, false);
                api.addEventListener('executed', ({ detail, }) => {
                    if (detail?.node) {
                        this.currentNode = detail.node;
                    }
                    this.updateDisplay();
                }, false);
                api.addEventListener('execution_start', ({ _detail, }) => {
                    this.currentStatus = EStatus.executing;
                    this.timeStart = Date.now();
                    this.updateDisplay();
                }, false);
                api.addEventListener('execution_error', ({ _detail, }) => {
                    this.currentStatus = EStatus.execution_error;
                    this.updateDisplay();
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
        this.createSettings();
    }
    setup() {
        this.progressBarVertical = new ProgressBarUI(this.htmlIdCrystoolsRoot, this.htmlIdCrystoolsProgressBarContainer, this.centerNode);
        this.htmlProgressSliderRef = this.progressBarVertical.htmlProgressSliderRef;
        this.htmlProgressLabelRef = this.progressBarVertical.htmlProgressLabelRef;
        this.showProgressBar(app.ui.settings.getSettingValue(this.idShowProgressBar, this.defaultShowStatus));
        this.registerListeners();
    }
}
const crystoolsProgressBar = new CrystoolsProgressBar();
app.registerExtension({
    name: crystoolsProgressBar.idExtensionName,
    setup: crystoolsProgressBar.setup.bind(crystoolsProgressBar),
});
