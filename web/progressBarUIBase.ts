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
  public htmlRoot: HTMLElement | null;
  public htmlContainer: HTMLDivElement;
  protected htmlClassMonitor = 'crystools-monitor-container';

  protected constructor(
    public parentId: string,
    public rootId: string,
  ) {
    this.createRoot();
  }

  private createRoot = (): void => {
    // IMPORTANT duplicate on crystools-save
    this.htmlRoot = document.getElementById(this.rootId);
    if (!this.htmlRoot) {
      this.htmlRoot = document.createElement('div');
      this.htmlRoot.setAttribute('id', this.rootId);

      // the best parentElement:
      const parentElement: Element | null | undefined = document.getElementById(this.parentId);
      if (parentElement) {
        parentElement.insertAdjacentElement('afterend', this.htmlRoot);
      } else {
        console.error('Crystools: parentElement not found', this.parentId);
      }
    }

    this.htmlContainer = document.createElement('div');
    this.htmlContainer.classList.add(this.htmlClassMonitor);
    this.htmlContainer.setAttribute('id', this.constructor.name);
    this.htmlRoot.append(this.htmlContainer);
  };

  abstract createDOM(): void;

  // abstract updateDisplay(currentStatus: EStatus, timeStart: number, currentProgress: number): void;
}
