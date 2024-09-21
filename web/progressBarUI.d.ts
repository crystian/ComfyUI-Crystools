export declare enum EStatus {
    executing = "Executing",
    executed = "Executed",
    execution_error = "Execution error"
}
export declare abstract class ProgressBarUIBase {
    protected htmlIdCrystoolsRoot: string;
    protected htmlClassCrystoolsMonitorContainer: string;
    protected htmlContainer: HTMLDivElement;
    protected constructor();
    createRoot(): void;
    abstract refreshDisplay(): void;
    abstract createDOM(): void;
}
export declare class ProgressBarUI extends ProgressBarUIBase {
    private htmlIdCrystoolsProgressBarContainer;
    private centerNode;
    htmlProgressSliderRef: HTMLDivElement;
    htmlProgressLabelRef: HTMLDivElement;
    currentStatus: EStatus;
    timeStart: number;
    currentProgress: number;
    constructor(htmlIdCrystoolsProgressBarContainer: string, centerNode: () => void);
    createDOM: () => void;
    refreshDisplay: () => void;
    updateDisplay: (currentStatus: EStatus, timeStart: number, currentProgress: number) => void;
}
