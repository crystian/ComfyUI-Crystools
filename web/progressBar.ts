import { app, api } from './comfy/index.js';
import { commonPrefix } from './common.js';
import { ProgressBarUI } from './progressBarUI.js';
import { ComfyKeyMenuDisplayOption, EStatus, MenuDisplayOptions } from './progressBarUIBase.js';

class CrystoolsProgressBar {
  idExtensionName = 'Crystools.progressBar';
  idShowProgressBar = 'Crystools.ProgressBar';
  defaultShowStatus = true;
  menuPrefix = commonPrefix;
  menuDisplayOption: MenuDisplayOptions = MenuDisplayOptions.Disabled;

  currentStatus = EStatus.executed;
  currentProgress = 0;
  currentNode?: number = undefined;
  timeStart = 0;

  progressBarUI: ProgressBarUI;

  // not on setup because this affect the order on settings, I prefer to options at first
  createSettings = (): void => {
    app.ui.settings.addSetting({
      id: this.idShowProgressBar,
      name: 'Show progress bar',
      category: ['Crystools', this.menuPrefix + ' Progress Bar', 'Show'],
      tooltip: 'This apply only on "Disabled" (old) menu',
      type: 'boolean',
      defaultValue: this.defaultShowStatus,
      onChange: this.progressBarUI.showProgressBar,
    });
  };

  updateDisplay = (menuDisplayOption: MenuDisplayOptions): void => {
    if (menuDisplayOption !== this.menuDisplayOption) {
      this.menuDisplayOption = menuDisplayOption;
      this.progressBarUI.showSection(this.menuDisplayOption === MenuDisplayOptions.Disabled);
    }
    if (this.menuDisplayOption === MenuDisplayOptions.Disabled && this.progressBarUI.showProgressBarFlag) {
      this.progressBarUI.updateDisplay(this.currentStatus, this.timeStart, this.currentProgress);
    }
  };

  // automatically called by ComfyUI
  setup = (): void => {
    if (this.progressBarUI) {
      this.progressBarUI
      .showProgressBar(app.extensionManager.setting.get(this.idShowProgressBar));
      return;
    }

    this.menuDisplayOption = app.extensionManager.setting.get(ComfyKeyMenuDisplayOption);
    app.ui.settings.addEventListener(`${ComfyKeyMenuDisplayOption}.change`, (e: any) => {
        this.updateDisplay(e.detail.value);
      },
    );

    const progressBarElement = document.createElement('div');
    progressBarElement.classList.add('crystools-monitors-container');

    this.progressBarUI = new ProgressBarUI(
      progressBarElement,
      (this.menuDisplayOption === MenuDisplayOptions.Disabled),
      this.centerNode,
    );

    const parentElement = document.getElementById('queue-button');
    if (parentElement) {
      parentElement.insertAdjacentElement('afterend', progressBarElement);
    } else {
      console.error('Crystools: parentElement to move monitors not found!', parentElement);
    }

    this.createSettings();
    this.updateDisplay(this.menuDisplayOption);
    this.registerListeners();
  };

  registerListeners = (): void => {
    api.addEventListener('status', ({detail}: any) => {
      this.currentStatus = this.currentStatus === EStatus.execution_error ? EStatus.execution_error : EStatus.executed;
      const queueRemaining = detail?.exec_info.queue_remaining;

      if (queueRemaining) {
        this.currentStatus = EStatus.executing;
      }
      this.updateDisplay(this.menuDisplayOption);
    }, false);

    api.addEventListener('progress', ({detail}: any) => {
      const {value, max, node} = detail;
      const progress = Math.floor((value / max) * 100);

      if (!isNaN(progress) && progress >= 0 && progress <= 100) {
        this.currentProgress = progress;
        this.currentNode = node;
      }

      this.updateDisplay(this.menuDisplayOption);
    }, false);

    api.addEventListener('executed', ({detail}: any) => {
      if (detail?.node) {
        this.currentNode = detail.node;
      }

      this.updateDisplay(this.menuDisplayOption);
    }, false);

    api.addEventListener('execution_start', ({_detail}: any) => {
      this.currentStatus = EStatus.executing;
      this.timeStart = Date.now();

      this.updateDisplay(this.menuDisplayOption);
    }, false);

    api.addEventListener('execution_error', ({_detail}: any) => {
      this.currentStatus = EStatus.execution_error;

      this.updateDisplay(this.menuDisplayOption);
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
