export declare enum EStatus {
    executing = "Executing",
    executed = "Executed",
    execution_error = "Execution error"
}
export declare enum NewMenuOptions {
    'Disabled' = "Disabled",
    'Top' = "Top",
    'Bottom' = "Bottom"
}
export declare abstract class ProgressBarUIBase {
    parentId: string;
    rootId: string;
    show: boolean;
    protected htmlContainer: HTMLDivElement;
    protected htmlClassMonitor: string;
    protected constructor(parentId: string, rootId: string, show: boolean);
    private createRoot;
    render: (value: boolean) => void;
    abstract createDOM(): void;
    abstract updateDisplay(currentStatus: EStatus, timeStart: number, currentProgress: number): void;
}
