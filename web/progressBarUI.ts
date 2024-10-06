import { EStatus, ProgressBarUIBase } from './progressBarUIBase.js';

export class ProgressBarUI extends ProgressBarUIBase {
  htmlProgressSliderRef: HTMLDivElement;
  htmlProgressLabelRef: HTMLDivElement;
  currentStatus: EStatus;
  timeStart: number;
  currentProgress: number;
  showProgressBarFlag: boolean;

  constructor(
    public override rootElement: HTMLElement,
    public showSectionFlag: boolean,
    private centerNode: () => void,
  ) {
    super('crystools-progressBar-root', rootElement);
    this.createDOM();
  }

  createDOM = (): void => {
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
  };

  // eslint-disable-next-line complexity
  updateDisplay = (currentStatus: EStatus, timeStart: number, currentProgress: number): void => {
    if (!(this.showSectionFlag && this.showProgressBarFlag)) {
      return;
    }

    if (!(this.htmlProgressLabelRef && this.htmlProgressSliderRef)) {
      console.error('htmlProgressLabelRef or htmlProgressSliderRef is undefined');
      return;
    }

    // console.log('only if showSection and progressBar', timeStart, currentProgress);

    this.currentStatus = currentStatus;
    this.timeStart = timeStart;
    this.currentProgress = currentProgress;

    if (currentStatus === EStatus.executed) {
      // finished
      this.htmlProgressLabelRef.innerHTML = 'cached';

      const timeElapsed = Date.now() - timeStart;
      if (timeStart > 0 && timeElapsed > 0) {
        this.htmlProgressLabelRef.innerHTML = new Date(timeElapsed).toISOString().substr(11, 8);
      }
      this.htmlProgressSliderRef.style.width = '0';

    } else if (currentStatus === EStatus.execution_error) {
      // an error occurred
      this.htmlProgressLabelRef.innerHTML = 'ERROR';
      this.htmlProgressSliderRef.style.backgroundColor = 'var(--error-text)';

    } else if (currentStatus === EStatus.executing) {
      // on going
      this.htmlProgressLabelRef.innerHTML = `${currentProgress}%`;
      this.htmlProgressSliderRef.style.width = this.htmlProgressLabelRef.innerHTML;
      this.htmlProgressSliderRef.style.backgroundColor = 'green'; // by reset the color
    }

  };

  public showSection = (value: boolean): void => {
    this.showSectionFlag = value;
    this.displaySection();
  };

  // remember it can't have more parameters because it is used on settings automatically
  public showProgressBar = (value: boolean): void => {
    this.showProgressBarFlag = value;
    this.displaySection();
  };

  private displaySection = (): void => {
    this.rootElement.style.display = (this.showSectionFlag && this.showProgressBarFlag) ? 'block' : 'none';
  };
}
