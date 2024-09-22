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
    public showSection: boolean,
  ) {
    this.createRoot();
    this.showFullSection(this.showSection);
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

  public showFullSection(value: boolean): void {
    this.showSection = value;
    this.htmlContainer.style.display = value ? 'flex' : 'none';
  }

  abstract createDOM(): void;

  // abstract updateDisplay(currentStatus: EStatus, timeStart: number, currentProgress: number): void;
}
