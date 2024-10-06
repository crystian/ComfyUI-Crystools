import { EStatus, ProgressBarUIBase } from './progressBarUIBase.js';
export declare class ProgressBarUI extends ProgressBarUIBase {
    rootElement: HTMLElement;
    showSectionFlag: boolean;
    private centerNode;
    htmlProgressSliderRef: HTMLDivElement;
    htmlProgressLabelRef: HTMLDivElement;
    currentStatus: EStatus;
    timeStart: number;
    currentProgress: number;
    showProgressBarFlag: boolean;
    constructor(rootElement: HTMLElement, showSectionFlag: boolean, centerNode: () => void);
    createDOM: () => void;
    updateDisplay: (currentStatus: EStatus, timeStart: number, currentProgress: number) => void;
    showSection: (value: boolean) => void;
    showProgressBar: (value: boolean) => void;
    private displaySection;
}
