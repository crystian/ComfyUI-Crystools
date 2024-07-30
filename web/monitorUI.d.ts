export declare class MonitorUI {
    monitorCPUElement: TMonitorSettings;
    monitorRAMElement: TMonitorSettings;
    monitorHDDElement: TMonitorSettings;
    monitorGPUSettings: TMonitorSettings[];
    monitorVRAMSettings: TMonitorSettings[];
    monitorTemperatureSettings: TMonitorSettings[];
    currentRate: number;
    htmlIdCrystoolsRoot: string;
    htmlIdCrystoolsMonitorContainer: string;
    constructor(monitorCPUElement: TMonitorSettings, monitorRAMElement: TMonitorSettings, monitorHDDElement: TMonitorSettings, monitorGPUSettings: TMonitorSettings[], monitorVRAMSettings: TMonitorSettings[], monitorTemperatureSettings: TMonitorSettings[], currentRate: number);
    refreshDisplay: () => void;
    createVertical: () => void;
    updateAllWidget: () => void;
    updateWidget: (monitorSettings: TMonitorSettings) => void;
    updateAllMonitors: (data: TStatsData) => void;
    updateMonitor: (monitorSettings: TMonitorSettings, percent: number) => void;
    updateAllAnimationDuration: (value: number) => void;
    updatedAnimationDuration: (monitorSettings: TMonitorSettings, value: number) => void;
    createMonitor: (monitorSettings?: TMonitorSettings) => HTMLDivElement;
}
