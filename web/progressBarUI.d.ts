import { EStatus } from './types.js';
export declare class ProgressBarUI {
    htmlIdCrystoolsRoot: string;
    htmlIdCrystoolsProgressBarContainer: string;
    private centerNode;
    htmlProgressSliderRef: HTMLDivElement;
    htmlProgressLabelRef: HTMLDivElement;
    queueButtonElement: HTMLElement | null;
    currentStatus: EStatus;
    timeStart: number;
    currentProgress: number;
    constructor(htmlIdCrystoolsRoot: string, htmlIdCrystoolsProgressBarContainer: string, centerNode: () => void);
    createVertical: () => void;
    refreshDisplay: () => void;
    updateDisplay: (currentStatus: EStatus, timeStart: number, currentProgress: number) => void;
}
