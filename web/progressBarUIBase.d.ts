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
    showSection: boolean;
    htmlRoot: HTMLElement | null;
    htmlContainer: HTMLDivElement;
    protected htmlClassMonitor: string;
    protected constructor(parentId: string, rootId: string, showSection: boolean);
    private createRoot;
    abstract createDOM(): void;
}
