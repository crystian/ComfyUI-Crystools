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
  protected htmlContainer: HTMLDivElement;
  protected htmlClassMonitor = 'crystools-monitor-container';

  protected constructor(
    public parentId: string,
    public rootId: string,
    public show: boolean,
  ) {
    this.createRoot();
  }

  private createRoot = (): void => {
    // IMPORTANT duplicate on crystools-save
    let ctoolsRoot = document.getElementById(this.rootId);
    if (!ctoolsRoot) {
      ctoolsRoot = document.createElement('div');
      ctoolsRoot.setAttribute('id', this.rootId);

      // the best parentElement:
      const parentElement = document.getElementById(this.parentId);
      parentElement?.insertAdjacentElement('afterend', ctoolsRoot);
    }

    this.htmlContainer = document.createElement('div');
    this.htmlContainer.classList.add(this.htmlClassMonitor);
    ctoolsRoot.append(this.htmlContainer);
  };

  // remember it can't have more parameters because it is used on settings automatically
  public render = (value: boolean): void => {
    this.show = value;
    this.htmlContainer.style.display = this.show ? 'block' : 'none';
  };

  abstract createDOM(): void;
  abstract updateDisplay(currentStatus: EStatus, timeStart: number, currentProgress: number): void;
}
