import { app, api } from './comfy/index.js';
import { commonPrefix } from './common.js';
import { EStatus, ProgressBarUI } from './progressBarUI.js';

class CrystoolsProgressBar {
  idExtensionName = 'Crystools.progressBar';
  idShowProgressBar = 'Crystools.ProgressBar';
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

  progressBarVertical: ProgressBarUI;

  constructor() {
    this.createSettings();
  }

  // not on setup because this affect the order on settings, I prefer to options at first
  createSettings = (): void => {
    app.ui.settings.addSetting({
      id: this.idShowProgressBar,
      name: this.menuPrefix + ' Progress bar',
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
    this.progressBarVertical.updateDisplay(this.currentStatus, this.timeStart, this.currentProgress);
  };

  setup(): void {
    this.progressBarVertical = new ProgressBarUI(
      this.htmlIdCrystoolsRoot,
      this.htmlIdCrystoolsProgressBarContainer,
      this.centerNode);

    this.htmlProgressSliderRef = this.progressBarVertical.htmlProgressSliderRef;
    this.htmlProgressLabelRef = this.progressBarVertical.htmlProgressLabelRef;

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
