import { app, TLGraphNode, ComfyApp } from './comfy/index.js';
import type { ComfyNode } from './comfy/index.js';
import { displayContext } from './common.js';

const crystoolsExtensions: Record<string, string> = {
  'Get resolution [Crystools]': 'Crystools.Image.GetResolution',
  'Preview from image [Crystools]': 'Crystools.Image.PreviewFromImage',
  'Preview from metadata [Crystools]': 'Crystools.Image.PreviewFromMetadata',
  'Metadata comparator [Crystools]': 'Crystools.Metadata.MetadataComparator',
  'Stats system [Crystools]': 'Crystools.Utils.StatsSystem',
  'Show any to JSON [Crystools]': 'Crystools.Debugger.ConsoleAnyToJson',
};

Object.keys(crystoolsExtensions).forEach(key => {
  app.registerExtension({
    name: crystoolsExtensions[key],
    beforeRegisterNodeDef(nodeType: ComfyNode, nodeData: TLGraphNode, appFromArg: ComfyApp) {
      if (nodeData.name === key) {
        displayContext(nodeType, appFromArg, 0);
      }
    },
  });
});
