import { app } from './comfy/index.js';

export enum EStatus {
  executing = 'Executing',
  executed = 'Executed',
  execution_error = 'Execution error',
}

export enum NewMenuOptions {
  'Disabled' = 'Disabled',
  'Top' = 'Top',
  'Bottom' = 'Bottom',
}

export abstract class ProgressBarUIBase {
  protected htmlIdCrystoolsRoot = 'crystools-root';
  protected htmlClassCrystoolsMonitorContainer = 'crystools-monitor-container';
  protected htmlContainer: HTMLDivElement;
  protected newMenu: NewMenuOptions = NewMenuOptions.Disabled;

  protected constructor() {
    this.newMenu = app.ui.settings.getSettingValue('Comfy.UseNewMenu', 'Disabled');
    console.log('menu', this.newMenu);
    if(this.newMenu === NewMenuOptions.Disabled) {
      this.createRoot();
    }
    // window.addEventListener('resize', () => this.refreshDisplay());
  }

  createRoot(): void {
    // IMPORTANT duplicate by progressbar and crystools-save
    let ctoolsRoot = document.getElementById(this.htmlIdCrystoolsRoot);
    if (!ctoolsRoot) {
      ctoolsRoot = document.createElement('div');
      ctoolsRoot.setAttribute('id', this.htmlIdCrystoolsRoot);

      // the best parentElement:
      const parentElement = document.getElementById('queue-button');
      parentElement?.insertAdjacentElement('afterend', ctoolsRoot);
    }

    this.htmlContainer = document.createElement('div');
    this.htmlContainer.classList.add(this.htmlClassCrystoolsMonitorContainer);
    ctoolsRoot.append(this.htmlContainer);
  }

  // abstract refreshDisplay(): void;
  abstract createDOM(): void;
}

export class ProgressBarUI extends ProgressBarUIBase{
  htmlProgressSliderRef: HTMLDivElement;
  htmlProgressLabelRef: HTMLDivElement;
  currentStatus: EStatus;
  timeStart: number;
  currentProgress: number;

  constructor (
    private htmlIdCrystoolsProgressBarContainer: string,
    private centerNode: () => void
  ) {
    super();
    if(this.newMenu === NewMenuOptions.Disabled) {
      this.createDOM();
    }
  }

  createDOM = (): void => {
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
  };

  refreshDisplay = (): void => {
    console.log('dddd', this.newMenu);
    if(this.newMenu === NewMenuOptions.Disabled) {
      this.updateDisplay(this.currentStatus, this.timeStart, this.currentProgress);
    } else {
      console.log('refresh');
    }
  };

  updateDisplay = (currentStatus: EStatus, timeStart: number, currentProgress: number): void => {
    console.log('entra');
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

}
