import { ProgressBarUIBase } from './progressBarUI.js';
export declare class MonitorUI extends ProgressBarUIBase {
    private monitorCPUElement;
    private monitorRAMElement;
    private monitorHDDElement;
    private monitorGPUSettings;
    private monitorVRAMSettings;
    private monitorTemperatureSettings;
    private currentRate;
    constructor(monitorCPUElement: TMonitorSettings, monitorRAMElement: TMonitorSettings, monitorHDDElement: TMonitorSettings, monitorGPUSettings: TMonitorSettings[], monitorVRAMSettings: TMonitorSettings[], monitorTemperatureSettings: TMonitorSettings[], currentRate: number);
    refreshDisplay: () => void;
    createDOM: () => void;
    updateAllWidget: () => void;
    updateWidget: (monitorSettings: TMonitorSettings) => void;
    updateAllMonitors: (data: TStatsData) => void;
    updateMonitor: (monitorSettings: TMonitorSettings, percent: number) => void;
    updateAllAnimationDuration: (value: number) => void;
    updatedAnimationDuration: (monitorSettings: TMonitorSettings, value: number) => void;
    createMonitor: (monitorSettings?: TMonitorSettings) => HTMLDivElement;
}
