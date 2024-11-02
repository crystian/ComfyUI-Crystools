import { EStatus, ProgressBarUIBase } from './progressBarUIBase.js';
export class ProgressBarUI extends ProgressBarUIBase {
    constructor(rootElement, showSectionFlag, centerNode) {
        super('crystools-progressBar-root', rootElement);
        Object.defineProperty(this, "rootElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: rootElement
        });
        Object.defineProperty(this, "showSectionFlag", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: showSectionFlag
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
        Object.defineProperty(this, "showProgressBarFlag", {
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
                this.rootElement.setAttribute('title', 'click to see the current working node');
                this.rootElement.addEventListener('click', this.centerNode);
                const progressBar = document.createElement('div');
                progressBar.classList.add('crystools-progress-bar');
                this.rootElement.append(progressBar);
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
        Object.defineProperty(this, "updateDisplay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (currentStatus, timeStart, currentProgress) => {
                if (!(this.showSectionFlag && this.showProgressBarFlag)) {
                    return;
                }
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
        Object.defineProperty(this, "showSection", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (value) => {
                this.showSectionFlag = value;
                this.displaySection();
            }
        });
        Object.defineProperty(this, "showProgressBar", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (value) => {
                this.showProgressBarFlag = value;
                this.displaySection();
            }
        });
        Object.defineProperty(this, "displaySection", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.rootElement.style.display = (this.showSectionFlag && this.showProgressBarFlag) ? 'block' : 'none';
            }
        });
        this.createDOM();
    }
}
