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
    public showSection: boolean,
  ) {
    this.createRoot();
    // this.showFullSection(this.showSection);
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
    this.showSection = true;
    this.htmlContainer = document.createElement('div');
    this.htmlContainer.classList.add(this.htmlClassMonitor);
    this.htmlRoot.append(this.htmlContainer);
  };

  // public showFullSection(value: boolean): void {
  //   this.showSection = value;
  //   this.htmlContainer.style.display = value ? 'flex' : 'none';
  // }

  abstract createDOM(): void;

  // abstract updateDisplay(currentStatus: EStatus, timeStart: number, currentProgress: number): void;
}
