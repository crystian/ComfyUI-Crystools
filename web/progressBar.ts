import { api } from '/scripts/api.js';
import { app } from '/scripts/app.js';
import { commonPrefix } from './common.js';

enum EStatus {
  executing = 'Executing',
  executed = 'Executed',
  execution_error = 'Execution error',
}

class CrystoolsProgressBar {
  idExtensionName = 'Crystools.progressBar';
  idShowProgressBar = 'Crystools.showStatus';
  defaultShowStatus = true;
  menuPrefix = commonPrefix;
  htmlIdCrystoolsRoot = 'crystools-root';
  htmlIdCrystoolsProgressBarContainer = 'crystools-progress-bar-container';

  currentStatus = EStatus.executed;
  currentProgress = 0;
  currentNode?: number = undefined;
  timeStart = 0;

  htmlProgressSliderRef?: HTMLDivElement = undefined;
  htmlProgressLabelRef?: HTMLDivElement = undefined;

  constructor() {
    this.createSettings();
  }

  // not on setup because this affect the order on settings, I prefer to options at first
  createSettings = (): void => {
    app.ui.settings.addSetting({
      id: this.idShowProgressBar,
      name: this.menuPrefix + '[monitor] Show progress bar',
      type: 'boolean',
      defaultValue: this.defaultShowStatus,
      onChange: this.showProgressBar,
    });
  };

  showProgressBar = (value: boolean): void => {
    const container = document.getElementById(this.htmlIdCrystoolsProgressBarContainer);

    // validation because this run before setup
    if (container) {
      container.style.display = value ? 'block' : 'none';
    }
  };

  updateDisplay = (): void => {
    if (!(this.htmlProgressLabelRef && this.htmlProgressSliderRef)) {
      console.error('htmlProgressLabelRef or htmlProgressSliderRef is undefined');
      return;
    }

    if (this.currentStatus === EStatus.executed) {
      // finished
      this.htmlProgressLabelRef.innerHTML = 'cached';

      const timeElapsed = Date.now() - this.timeStart;
      if (this.timeStart > 0 && timeElapsed > 0) {
        this.htmlProgressLabelRef.innerHTML = new Date(timeElapsed).toISOString().substr(11, 8);
      }
      this.htmlProgressSliderRef.style.width = '0';

    } else if (this.currentStatus === EStatus.execution_error) {
      // an error occurred
      this.htmlProgressLabelRef.innerHTML = 'ERROR';
      this.htmlProgressSliderRef.style.backgroundColor = 'var(--error-text)';

    } else if (this.currentStatus === EStatus.executing) {
      // on going
      this.htmlProgressLabelRef.innerHTML = `${this.currentProgress}%`;
      this.htmlProgressSliderRef.style.width = this.htmlProgressLabelRef.innerHTML;
      this.htmlProgressSliderRef.style.backgroundColor = 'green'; // by reset the color
    }
  };

  setup(): void {
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

  registerListeners = (): void => {
    api.addEventListener('status', ({
      detail,
    }: any) => {
      this.currentStatus = this.currentStatus === EStatus.execution_error ? EStatus.execution_error : EStatus.executed;
      const queueRemaining = detail?.exec_info.queue_remaining;

      if (queueRemaining) {
        this.currentStatus = EStatus.executing;
      }
      this.updateDisplay();
    }, false);

    api.addEventListener('progress', ({
      detail,
    }: any) => {
      const {
        value, max, node,
      } = detail;
      const progress = Math.floor((value / max) * 100);

      if (!isNaN(progress) && progress >= 0 && progress <= 100) {
        this.currentProgress = progress;
        this.currentNode = node;
      }

      this.updateDisplay();
    }, false);

    api.addEventListener('executed', ({
      detail,
    }: any) => {
      if (detail?.node) {
        this.currentNode = detail.node;
      }

      this.updateDisplay();
    }, false);

    api.addEventListener('execution_start', ({
      _detail,
    }: any) => {
      this.currentStatus = EStatus.executing;
      this.timeStart = Date.now();

      this.updateDisplay();
    }, false);

    api.addEventListener('execution_error', ({
      _detail,
    }: any) => {
      this.currentStatus = EStatus.execution_error;

      this.updateDisplay();
    }, false);
  };

  centerNode = (): void => {
    const id = this.currentNode;
    if (!id) {
      return;
    }
    const node = app.graph.getNodeById(id);
    if (!node) {
      return;
    }
    app.canvas.centerOnNode(node);
  };
}

const crystoolsProgressBar = new CrystoolsProgressBar();
app.registerExtension({
  name: crystoolsProgressBar.idExtensionName,
  setup: crystoolsProgressBar.setup.bind(crystoolsProgressBar),
});
