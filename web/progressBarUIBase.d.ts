export declare enum EStatus {
    executing = "Executing",
    executed = "Executed",
    execution_error = "Execution error"
}
export declare const ComfyKeyMenuDisplayOption = "Comfy.UseNewMenu";
export declare enum MenuDisplayOptions {
    'Disabled' = "Disabled",
    'Top' = "Top",
    'Bottom' = "Bottom"
}
export declare abstract class ProgressBarUIBase {
    rootId: string;
    rootElement: HTMLElement | null | undefined;
    protected htmlClassMonitor: string;
    protected constructor(rootId: string, rootElement: HTMLElement | null | undefined);
    abstract createDOM(): void;
}
