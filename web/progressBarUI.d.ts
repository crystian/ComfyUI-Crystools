import { EStatus, ProgressBarUIBase } from './progressBarUIBase.js';
export declare class ProgressBarUI extends ProgressBarUIBase {
    private centerNode;
    htmlProgressSliderRef: HTMLDivElement;
    htmlProgressLabelRef: HTMLDivElement;
    currentStatus: EStatus;
    timeStart: number;
    currentProgress: number;
    constructor(centerNode: () => void, show: boolean);
    createDOM: () => void;
    updateDisplay: (currentStatus: EStatus, timeStart: number, currentProgress: number) => void;
    private refreshDisplay;
}
