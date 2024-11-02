import { utils } from './comfy/index.js';

utils.addStylesheet('extensions/ComfyUI-Crystools/monitor.css');

export enum Styles {
  'BARS' = 'BARS'
}

export enum Colors {
  'CPU' = '#0AA015',
  'RAM' = '#07630D',
  'DISK' = '#730F92',
  'GPU' = '#0C86F4',
  'VRAM' = '#176EC7',
  'TEMP_START' = '#00ff00',
  'TEMP_END' = '#ff0000',
}
