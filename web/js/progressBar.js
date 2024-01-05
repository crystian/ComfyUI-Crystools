import { api } from '../../../scripts/api.js';
import { app } from '../../../scripts/app.js';

const status = {
  executing: 'Executing',
  executed: 'Executed',
  execution_error: 'Execution error',
};

class CrystoolsProgressBar {
  idExtensionName = 'Crystools.progressBar';
  idShowProgressBar = 'Crystools.showStatus';
  defaultShowStatus = true;
  menuPrefix = '';
  htmlIdCrystoolsRoot = 'crystools-root';
  htmlIdCrystoolsProgressBarContainer = 'crystools-progress-bar-container';

  currentStatus = status.executed;
  currentProgress = 0;
  currentNode = null;
  timeStart = 0;

  htmlProgressSliderRef = null;
  htmlProgressLabelRef = null;

  constructor() {
    this.createSettings();
  }

  // not on setup because this affect the order on settings, I prefer to options at first
  createSettings = () => {
    /** Form on settings: (the order is important) */

    // use new save button
    app.ui.settings.addSetting({
      id: this.idShowProgressBar,
      name: this.menuPrefix + 'Show progress bar in menu',
      type: 'boolean',
      defaultValue: this.defaultShowStatus,
      onChange: this.showProgressBar,
    });
  };

  showProgressBar = (value) => {
    const ctools = document.getElementById(this.htmlIdCrystoolsProgressBarContainer);

    // validation because this run before setup
    if (ctools) {
      ctools.style.display = value ? 'block' : 'none';
    }
  };

  updateDisplay = () => {
    if (this.currentStatus === status.executed) {
      // finished
      this.htmlProgressLabelRef.innerHTML = 'cached';

      const timeElapsed = Date.now() - this.timeStart;
      if (this.timeStart > 0 && timeElapsed > 0) {
        this.htmlProgressLabelRef.innerHTML = new Date(timeElapsed).toISOString().substr(11, 8);
      }
      this.htmlProgressSliderRef.style.backgroundColor = 'var(--bg-color)';

    } else if (this.currentStatus === status.execution_error) {
      // an error occurred
      this.htmlProgressLabelRef.innerHTML = 'ERROR';
      this.htmlProgressSliderRef.style.backgroundColor = 'var(--error-text)';
      console.log('execution_error');

    } else if (this.currentStatus === status.executing) {
      // on going
      this.htmlProgressLabelRef.innerHTML = `${this.currentProgress}%`;
      this.htmlProgressSliderRef.style.width = this.htmlProgressLabelRef.innerHTML;
      this.htmlProgressSliderRef.style.backgroundColor = 'green';
    }
  };

  setup() {
    const parentElement= document.getElementById('queue-button');

    let ctoolsRoot = document.getElementById(this.htmlIdCrystoolsRoot);
    if(!ctoolsRoot){
      ctoolsRoot = document.createElement('div');
      ctoolsRoot.setAttribute('id', this.htmlIdCrystoolsRoot);
      ctoolsRoot.style.display = 'flex';
      ctoolsRoot.style.width = '100%';
      ctoolsRoot.style.flexDirection = 'column';
      parentElement.insertAdjacentElement('afterend', ctoolsRoot);
    }

    const progressBarContainer = document.createElement('div');
    progressBarContainer.setAttribute('id', this.htmlIdCrystoolsProgressBarContainer);
    progressBarContainer.setAttribute('title', 'click to see the current working node');
    progressBarContainer.style.margin = '4px 0';
    progressBarContainer.style.width = '100%';
    progressBarContainer.style.cursor = 'pointer';
    progressBarContainer.style.order = '1';
    progressBarContainer.addEventListener('click', this.centerNode);
    ctoolsRoot.append(progressBarContainer);

    const progressBar = document.createElement('div');
    progressBar.style.margin = '0 10px';
    progressBar.style.height = '18px';
    progressBar.style.position = 'relative';
    progressBar.style.backgroundColor = 'var(--bg-color)';
    progressBarContainer.append(progressBar);

    const progressSlider = document.createElement('div');
    progressSlider.style.position = 'absolute';
    progressSlider.style.height = '100%';
    progressSlider.style.width = '0';
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

  registerListeners = () => {
    api.addEventListener('status', ({detail}) => {
      this.currentStatus = this.currentStatus === status.execution_error ? status.execution_error : status.executed;
      let queueRemaining = detail && detail.exec_info.queue_remaining;

      if (queueRemaining) {
        this.currentStatus = status.executing;
      }
      this.updateDisplay();
    });

    api.addEventListener('progress', ({detail}) => {
      const {value, max, node} = detail;
      const progress = Math.floor((value / max) * 100);

      if (!isNaN(progress) && progress >= 0 && progress <= 100) {
        this.currentProgress = progress;
        this.currentNode = node;
      }

      this.updateDisplay();
    });

    api.addEventListener('executed', ({detail}) => {
      if (detail?.node) {
        this.currentNode = detail.node;
      }

      this.updateDisplay();
    });

    api.addEventListener('execution_start', ({detail}) => {
      this.currentStatus = status.executing;
      this.timeStart = Date.now();

      this.updateDisplay();
    });

    api.addEventListener('execution_error', ({detail}) => {
      this.currentStatus = status.execution_error;

      this.updateDisplay();
    });
  };

  centerNode = () => {
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
})
