import { ProgressBarUIBase } from './progressBarUIBase.js';
export declare class MonitorUI extends ProgressBarUIBase {
    rootElement: HTMLElement;
    private monitorCPUElement;
    private monitorRAMElement;
    private monitorHDDElement;
    private monitorGPUSettings;
    private monitorVRAMSettings;
    private monitorTemperatureSettings;
    private currentRate;
    lastMonitor: number;
    styleSheet: HTMLStyleElement;
    maxVRAMUsed: Record<number, number>;
    constructor(rootElement: HTMLElement, monitorCPUElement: TMonitorSettings, monitorRAMElement: TMonitorSettings, monitorHDDElement: TMonitorSettings, monitorGPUSettings: TMonitorSettings[], monitorVRAMSettings: TMonitorSettings[], monitorTemperatureSettings: TMonitorSettings[], currentRate: number);
    createDOM: () => void;
    createDOMGPUMonitor: (monitorSettings?: TMonitorSettings) => void;
    orderMonitors: () => void;
    updateDisplay: (data: TStatsData) => void;
    updateMonitor: (monitorSettings: TMonitorSettings, percent: number, used?: number, total?: number) => void;
    updateAllAnimationDuration: (value: number) => void;
    updatedAnimationDuration: (monitorSettings: TMonitorSettings, value: number) => void;
    createMonitor: (monitorSettings?: TMonitorSettings) => HTMLDivElement;
    updateMonitorSize: (width: number, height: number) => void;
    showMonitor: (monitorSettings: TMonitorSettings, value: boolean) => void;
    resetMaxVRAM: () => void;
}
