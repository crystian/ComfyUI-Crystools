// import { app } from 'scripts/app';
// import { displayContext } from './common.js';
// import type { ComfyNode } from './liteGraph.types.js';
// import { TLGraphNode } from './liteGraph.js';
// import { ComfyApp } from 'types/comfy.js';
//
// const crystoolsExtensions: Record<string, string> = {
//   'Get resolution [Crystools]': 'Crystools.Image.GetResolution',
//   'Preview from image [Crystools]': 'Crystools.Image.PreviewFromImage',
//   'Preview from metadata [Crystools]': 'Crystools.Image.PreviewFromMetadata',
//   'Metadata comparator [Crystools]': 'Crystools.Metadata.MetadataComparator',
//   'Stats system [Crystools]': 'Crystools.Utils.StatsSystem',
//   'Show any to JSON [Crystools]': 'Crystools.Debugger.ConsoleAnyToJson',
// };
//
// Object.keys(crystoolsExtensions).forEach(key => {
//   app.registerExtension({
//     name: crystoolsExtensions[key],
//     beforeRegisterNodeDef(nodeType: ComfyNode, nodeData: TLGraphNode, appFromArg: ComfyApp) {
//       if (nodeData.name === key) {
//         displayContext(nodeType, appFromArg, 0);
//       }
//     },
//   });
// });
