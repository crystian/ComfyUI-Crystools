import { app } from './comfy/scripts.js';

export enum EStatus {
  executing = 'Executing',
  executed = 'Executed',
  execution_error = 'Execution error',
}

export class ProgressBarUI {
  htmlProgressSliderRef: HTMLDivElement;
  htmlProgressLabelRef: HTMLDivElement;
  queueButtonElement: HTMLElement | null;
  currentStatus: EStatus;
  timeStart: number;
  currentProgress: number;

  constructor(
    public htmlIdCrystoolsRoot: string,
    public htmlIdCrystoolsProgressBarContainer: string,
    private centerNode: () => void
  ) {
    this.htmlIdCrystoolsRoot = htmlIdCrystoolsRoot;
    this.htmlIdCrystoolsProgressBarContainer = htmlIdCrystoolsProgressBarContainer;
    this.queueButtonElement = document.getElementById('queue-button');
    if (!this.queueButtonElement) {
      throw new Error('queue-button not found');
    }

    this.createVertical();

    window.addEventListener('resize', this.refreshDisplay);
  }

  createVertical = (): void => {
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
  };

  refreshDisplay = (): void => {
    this.updateDisplay(this.currentStatus, this.timeStart, this.currentProgress);
  };

  updateDisplay = (currentStatus: EStatus, timeStart: number, currentProgress: number): void => {
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

}
