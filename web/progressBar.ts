import { app, api } from './comfy/index.js';
import { commonPrefix } from './common.js';
import { ProgressBarUI } from './progressBarUI.js';
import { EStatus, NewMenuOptions } from './progressBarUIBase.js';

class CrystoolsProgressBar {
  idExtensionName = 'Crystools.progressBar';
  idShowProgressBar = 'Crystools.ProgressBar';
  defaultShowStatus = true;
  menuPrefix = commonPrefix;
  newMenu: NewMenuOptions = NewMenuOptions.Disabled;

  currentStatus = EStatus.executed;
  currentProgress = 0;
  currentNode?: number = undefined;
  timeStart = 0;

  progressBarUI: ProgressBarUI;

  constructor() {
    window.addEventListener('resize', this.updateDisplay);
  }

  // not on setup because this affect the order on settings, I prefer to options at first
  createSettings = (): void => {
    app.ui.settings.addSetting({
      id: this.idShowProgressBar,
      name: 'Show progress bar',
      category: ['Crystools', this.menuPrefix + ' Progress Bar', 'Show'],
      tooltip: 'This apply only on old menu',
      type: 'boolean',
      defaultValue: this.defaultShowStatus,
      onChange: this.progressBarUI.showProgressBar,
    });
  };

  updateDisplay = (): void => {
    const newMenu = app.ui.settings.getSettingValue('Comfy.UseNewMenu', 'Disabled');

    if (newMenu !== this.newMenu) {
      this.newMenu = newMenu;

      this.progressBarUI.showSection = (this.newMenu === NewMenuOptions.Disabled);
      if (this.progressBarUI.showSection) {
        this.setup();
      }
    }
    // this.progressBarUI.showSection = (this.newMenu !== NewMenuOptions.Disabled);
    // this.progressBarUI.htmlContainer.style.display = 'none';
    this.progressBarUI.updateDisplay(this.currentStatus, this.timeStart, this.currentProgress);
  };

  // automatically called by ComfyUI
  setup = (): void => {
    if (this.progressBarUI) {
      this.progressBarUI
      .showProgressBar(app.ui.settings.getSettingValue(this.idShowProgressBar, this.defaultShowStatus));
      return;
    }

    this.newMenu = app.ui.settings.getSettingValue('Comfy.UseNewMenu', 'Disabled');
    this.progressBarUI = new ProgressBarUI((this.newMenu === NewMenuOptions.Disabled), this.centerNode);

    this.createSettings();
    this.updateDisplay();
    this.registerListeners();
  };

  registerListeners = (): void => {
    api.addEventListener('status', ({detail}: any) => {
      this.currentStatus = this.currentStatus === EStatus.execution_error ? EStatus.execution_error : EStatus.executed;
      const queueRemaining = detail?.exec_info.queue_remaining;

      if (queueRemaining) {
        this.currentStatus = EStatus.executing;
      }
      this.updateDisplay();
    }, false);

    api.addEventListener('progress', ({detail}: any) => {
      const {value, max, node} = detail;
      const progress = Math.floor((value / max) * 100);

      if (!isNaN(progress) && progress >= 0 && progress <= 100) {
        this.currentProgress = progress;
        this.currentNode = node;
      }

      this.updateDisplay();
    }, false);

    api.addEventListener('executed', ({detail}: any) => {
      if (detail?.node) {
        this.currentNode = detail.node;
      }

      this.updateDisplay();
    }, false);

    api.addEventListener('execution_start', ({_detail}: any) => {
      this.currentStatus = EStatus.executing;
      this.timeStart = Date.now();

      this.updateDisplay();
    }, false);

    api.addEventListener('execution_error', ({_detail}: any) => {
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
  setup: crystoolsProgressBar.setup,
});
