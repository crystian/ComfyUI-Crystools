import { app } from './comfy/index.js';
export var EStatus;
(function (EStatus) {
    EStatus["executing"] = "Executing";
    EStatus["executed"] = "Executed";
    EStatus["execution_error"] = "Execution error";
})(EStatus || (EStatus = {}));
export var NewMenuOptions;
(function (NewMenuOptions) {
    NewMenuOptions["Disabled"] = "Disabled";
    NewMenuOptions["Top"] = "Top";
    NewMenuOptions["Bottom"] = "Bottom";
})(NewMenuOptions || (NewMenuOptions = {}));
export class ProgressBarUIBase {
    constructor() {
        Object.defineProperty(this, "htmlIdCrystoolsRoot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'crystools-root'
        });
        Object.defineProperty(this, "htmlClassCrystoolsMonitorContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'crystools-monitor-container'
        });
        Object.defineProperty(this, "htmlContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "newMenu", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: NewMenuOptions.Disabled
        });
        this.newMenu = app.ui.settings.getSettingValue('Comfy.UseNewMenu', 'Disabled');
        console.log('menu', this.newMenu);
        if (this.newMenu === NewMenuOptions.Disabled) {
            this.createRoot();
        }
    }
    createRoot() {
        let ctoolsRoot = document.getElementById(this.htmlIdCrystoolsRoot);
        if (!ctoolsRoot) {
            ctoolsRoot = document.createElement('div');
            ctoolsRoot.setAttribute('id', this.htmlIdCrystoolsRoot);
            const parentElement = document.getElementById('queue-button');
            parentElement?.insertAdjacentElement('afterend', ctoolsRoot);
        }
        this.htmlContainer = document.createElement('div');
        this.htmlContainer.classList.add(this.htmlClassCrystoolsMonitorContainer);
        ctoolsRoot.append(this.htmlContainer);
    }
}
export class ProgressBarUI extends ProgressBarUIBase {
    constructor(htmlIdCrystoolsProgressBarContainer, centerNode) {
        super();
        Object.defineProperty(this, "htmlIdCrystoolsProgressBarContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: htmlIdCrystoolsProgressBarContainer
        });
        Object.defineProperty(this, "centerNode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: centerNode
        });
        Object.defineProperty(this, "htmlProgressSliderRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "htmlProgressLabelRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currentStatus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timeStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currentProgress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "createDOM", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                console.log('create');
                const htmlContainer = document.createElement('div');
                htmlContainer.setAttribute('id', this.htmlIdCrystoolsProgressBarContainer);
                htmlContainer.setAttribute('title', 'click to see the current working node');
                htmlContainer.addEventListener('click', this.centerNode);
                this.htmlContainer.append(htmlContainer);
                this.htmlContainer.style.order = '1';
                const progressBar = document.createElement('div');
                progressBar.classList.add('crystools-progress-bar');
                htmlContainer.append(progressBar);
                const progressSlider = document.createElement('div');
                this.htmlProgressSliderRef = progressSlider;
                progressSlider.classList.add('crystools-slider');
                progressBar.append(this.htmlProgressSliderRef);
                const progressLabel = document.createElement('div');
                progressLabel.classList.add('crystools-label');
                progressLabel.innerHTML = '0%';
                this.htmlProgressLabelRef = progressLabel;
                progressBar.append(this.htmlProgressLabelRef);
            }
        });
        Object.defineProperty(this, "refreshDisplay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                console.log('dddd', this.newMenu);
                if (this.newMenu === NewMenuOptions.Disabled) {
                    this.updateDisplay(this.currentStatus, this.timeStart, this.currentProgress);
                }
                else {
                    console.log('refresh');
                }
            }
        });
        Object.defineProperty(this, "updateDisplay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (currentStatus, timeStart, currentProgress) => {
                console.log('entra');
                if (!(this.htmlProgressLabelRef && this.htmlProgressSliderRef)) {
                    console.error('htmlProgressLabelRef or htmlProgressSliderRef is undefined');
                    return;
                }
                this.currentStatus = currentStatus;
                this.timeStart = timeStart;
                this.currentProgress = currentProgress;
                if (currentStatus === EStatus.executed) {
                    this.htmlProgressLabelRef.innerHTML = 'cached';
                    const timeElapsed = Date.now() - timeStart;
                    if (timeStart > 0 && timeElapsed > 0) {
                        this.htmlProgressLabelRef.innerHTML = new Date(timeElapsed).toISOString().substr(11, 8);
                    }
                    this.htmlProgressSliderRef.style.width = '0';
                }
                else if (currentStatus === EStatus.execution_error) {
                    this.htmlProgressLabelRef.innerHTML = 'ERROR';
                    this.htmlProgressSliderRef.style.backgroundColor = 'var(--error-text)';
                }
                else if (currentStatus === EStatus.executing) {
                    this.htmlProgressLabelRef.innerHTML = `${currentProgress}%`;
                    this.htmlProgressSliderRef.style.width = this.htmlProgressLabelRef.innerHTML;
                    this.htmlProgressSliderRef.style.backgroundColor = 'green';
                }
            }
        });
        if (this.newMenu === NewMenuOptions.Disabled) {
            this.createDOM();
        }
    }
}
