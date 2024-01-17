import { api } from '/scripts/api.js';
import { app } from '/scripts/app.js';
import { commonPrefix } from './common.js';
var EStatus;
(function (EStatus) {
    EStatus["executing"] = "Executing";
    EStatus["executed"] = "Executed";
    EStatus["execution_error"] = "Execution error";
})(EStatus || (EStatus = {}));
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
                if (!(this.htmlProgressLabelRef && this.htmlProgressSliderRef)) {
                    console.error('htmlProgressLabelRef or htmlProgressSliderRef is undefined');
                    return;
                }
                if (this.currentStatus === EStatus.executed) {
                    this.htmlProgressLabelRef.innerHTML = 'cached';
                    const timeElapsed = Date.now() - this.timeStart;
                    if (this.timeStart > 0 && timeElapsed > 0) {
                        this.htmlProgressLabelRef.innerHTML = new Date(timeElapsed).toISOString().substr(11, 8);
                    }
                    this.htmlProgressSliderRef.style.width = '0';
                }
                else if (this.currentStatus === EStatus.execution_error) {
                    this.htmlProgressLabelRef.innerHTML = 'ERROR';
                    this.htmlProgressSliderRef.style.backgroundColor = 'var(--error-text)';
                }
                else if (this.currentStatus === EStatus.executing) {
                    this.htmlProgressLabelRef.innerHTML = `${this.currentProgress}%`;
                    this.htmlProgressSliderRef.style.width = this.htmlProgressLabelRef.innerHTML;
                    this.htmlProgressSliderRef.style.backgroundColor = 'green';
                }
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
        const parentElement = document.getElementById('queue-button');
        if (!parentElement) {
            console.error('queue-button not found');
            return;
        }
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
        htmlContainer.setAttribute('id', this.htmlIdCrystoolsProgressBarContainer);
        htmlContainer.setAttribute('title', 'click to see the current working node');
        htmlContainer.style.margin = '4px 0';
        htmlContainer.style.width = '100%';
        htmlContainer.style.cursor = 'pointer';
        htmlContainer.style.order = '1';
        htmlContainer.addEventListener('click', this.centerNode);
        ctoolsRoot.append(htmlContainer);
        const progressBar = document.createElement('div');
        progressBar.style.margin = '0 10px';
        progressBar.style.height = '18px';
        progressBar.style.position = 'relative';
        progressBar.style.backgroundColor = 'var(--bg-color)';
        htmlContainer.append(progressBar);
        const progressSlider = document.createElement('div');
        progressSlider.style.position = 'absolute';
        progressSlider.style.height = '100%';
        progressSlider.style.width = '0';
        progressSlider.style.transition = 'width 0.2s';
        progressSlider.style.backgroundColor = 'green';
        this.htmlProgressSliderRef = progressSlider;
        progressBar.append(this.htmlProgressSliderRef);
        const progressLabel = document.createElement('div');
        progressLabel.style.position = 'absolute';
        progressLabel.style.margin = 'auto 0';
        progressLabel.style.width = '100%';
        progressLabel.style.color = 'var(--drag-text)';
        progressLabel.style.fontSize = '14px';
        progressLabel.innerHTML = '0%';
        this.htmlProgressLabelRef = progressLabel;
        progressBar.append(this.htmlProgressLabelRef);
        this.showProgressBar(app.ui.settings.getSettingValue(this.idShowProgressBar, this.defaultShowStatus));
        this.registerListeners();
    }
}
const crystoolsProgressBar = new CrystoolsProgressBar();
app.registerExtension({
    name: crystoolsProgressBar.idExtensionName,
    setup: crystoolsProgressBar.setup.bind(crystoolsProgressBar),
});
