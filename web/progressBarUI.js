import { app } from '/scripts/app.js';
export var EStatus;
(function (EStatus) {
    EStatus["executing"] = "Executing";
    EStatus["executed"] = "Executed";
    EStatus["execution_error"] = "Execution error";
})(EStatus || (EStatus = {}));
export class ProgressBarUI {
    constructor(htmlIdCrystoolsRoot, htmlIdCrystoolsProgressBarContainer, centerNode) {
        Object.defineProperty(this, "htmlIdCrystoolsRoot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: htmlIdCrystoolsRoot
        });
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
        Object.defineProperty(this, "queueButtonElement", {
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
        Object.defineProperty(this, "createVertical", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                let ctoolsRoot = document.getElementById(this.htmlIdCrystoolsRoot);
                if (!ctoolsRoot) {
                    ctoolsRoot = document.createElement('div');
                    ctoolsRoot.setAttribute('id', this.htmlIdCrystoolsRoot);
                    ctoolsRoot.style.display = 'flex';
                    ctoolsRoot.style.width = '100%';
                    ctoolsRoot.style.flexDirection = 'column';
                    this.queueButtonElement?.insertAdjacentElement('afterend', ctoolsRoot);
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
            }
        });
        Object.defineProperty(this, "refreshDisplay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.updateDisplay(this.currentStatus, this.timeStart, this.currentProgress);
            }
        });
        Object.defineProperty(this, "updateDisplay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (currentStatus, timeStart, currentProgress) => {
                if (!(this.htmlProgressLabelRef && this.htmlProgressSliderRef)) {
                    console.error('htmlProgressLabelRef or htmlProgressSliderRef is undefined');
                    return;
                }
                this.currentStatus = currentStatus;
                this.timeStart = timeStart;
                this.currentProgress = currentProgress;
                const menu = app.ui.settings.getSettingValue('Comfy.UseNewMenu', 'Disabled');
                console.log('menu', menu);
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
        this.htmlIdCrystoolsRoot = htmlIdCrystoolsRoot;
        this.htmlIdCrystoolsProgressBarContainer = htmlIdCrystoolsProgressBarContainer;
        this.queueButtonElement = document.getElementById('queue-button');
        if (!this.queueButtonElement) {
            throw new Error('queue-button not found');
        }
        this.createVertical();
        window.addEventListener('resize', this.refreshDisplay);
    }
}
