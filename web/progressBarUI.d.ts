import { EStatus, ProgressBarUIBase } from './progressBarUIBase.js';
export declare class ProgressBarUI extends ProgressBarUIBase {
    private centerNode;
    htmlProgressSliderRef: HTMLDivElement;
    htmlProgressLabelRef: HTMLDivElement;
    currentStatus: EStatus;
    timeStart: number;
    currentProgress: number;
    progressBar: boolean;
    constructor(showSection: boolean, centerNode: () => void);
    createDOM: () => void;
    updateDisplay: (currentStatus: EStatus, timeStart: number, currentProgress: number) => void;
    showProgressBar: (value: boolean) => void;
}
