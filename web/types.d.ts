
type TGpuStatData = {
  gpu_utilization: number,
  gpu_temperature: number,
  vram_total: number,
  vram_used: number,
  vram_used_percent: number,
}

type TGpuSettings = {
  utilization?: boolean,
  vram?: boolean,
  temperature?: boolean,
}

type TGpuName = {
  name: string,
  index: number,
}

type TStatsData = {
  cpu_utilization: number,
  device: string,
  gpus: TGpuStatData[],
  hdd_total: number,
  hdd_used: number,
  hdd_used_percent: number,
  ram_total: number,
  ram_used: number,
  ram_used_percent: number,
}

type TStatsSettings = {
  rate?: number,
  switchCPU?: boolean,
  switchGPU?: boolean,
  switchHDD?: boolean,
  switchRAM?: boolean,
  switchVRAM?: boolean,
  whichHDD?: string,
}

type TMonitorSettings = {
  id: string,
  name: string,
  category: string[], // for settings location
  label: string, // on monitor
  symbol: string, // on monitor
  monitorTitle?: string, // on monitor
  title?: string, // on monitor
  tooltip?: string, // on settings
  type: 'boolean' | 'number' | 'string' | 'slider' | 'combo',
  defaultValue: boolean | number | string,
  data?: any,
  onChange: (value: boolean | number | string) => Promise<void>,
  htmlMonitorRef?: HTMLDivElement,
  htmlMonitorSliderRef?: HTMLDivElement,
  htmlMonitorLabelRef?: HTMLDivElement,
  cssColor: string,
  cssColorFinal?: string,
}
