import { EStatus, ProgressBarUIBase } from './progressBarUIBase.js';

export class ProgressBarUI extends ProgressBarUIBase{
  htmlProgressSliderRef: HTMLDivElement;
  htmlProgressLabelRef: HTMLDivElement;
  currentStatus: EStatus;
  timeStart: number;
  currentProgress: number;

  constructor (
    private centerNode: () => void,
    show: boolean,
  ) {
    super('queue-button', 'crystools-root-old', show);
    window.addEventListener('resize', this.refreshDisplay);
    this.createDOM();
  }

  createDOM = (): void => {
    const htmlContainer = document.createElement('div');
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
  };

  // eslint-disable-next-line complexity
  updateDisplay = (currentStatus: EStatus, timeStart: number, currentProgress: number): void => {
    if (!this.show) {
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

  // not data only display
  private refreshDisplay = (): void => {
    if (this.show) {
      this.updateDisplay(this.currentStatus, this.timeStart, this.currentProgress);
    }
  };
}
