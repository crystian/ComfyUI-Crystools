type TGpuStatData = {
  gpu_utilization: number,
  vram_total: number,
  vram_used: number,
  vram_used_percent: number,
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

type TMonitorRefs = {
  rootRef?: HTMLDivElement,
  sliderRef?: HTMLDivElement,
  labelRef?: HTMLDivElement,
}
