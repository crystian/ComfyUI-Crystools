// import { app } from '/scripts/app.js';
// import { api } from '/scripts/api.js';
// import { ComfyWidgets } from '/scripts/widgets.js';
// import { commonPrefix, displayContext } from './common.js';
// import type { LGraphNode } from './types.js'; // for better intellisense
// import { LiteGraph } from './types.js';
//
// // "Show any" Node
// app.registerExtension({
//   name: 'Crystools.Debugger.ConsoleAny',
//   beforeRegisterNodeDef(nodeType, nodeData, appFromArg) {
//     if (nodeData.name === 'Show any [Crystools]') {
//       // 3 is the index of the text field in the node
//       displayContext(nodeType, appFromArg, 3);
//     }
//   },
// });
//
// app.registerExtension({
//   name: 'Crystools.Debugger.Metadata',
//
//   registerCustomNodes() {
//     class MetadataNode extends LGraphNode {
//       // override serialize_widgets: boolean;
//       isVirtualNode: boolean;
//       widgets: any[];
//       static category: string;
//       static shape: number;
//       // static title: string;
//
//       constructor() {
//         super();
//         this.serialize_widgets = false;
//         this.isVirtualNode = true;
//
//         const widget = ComfyWidgets.STRING(this, '', [
//           '', {
//             default: '', multiline: true,
//           },
//         ], app).widget;
//         widget.inputEl.readOnly = true;
//         ComfyWidgets.BOOLEAN(this, 'Active', [
//           '', {
//             default: true,
//           },
//         ]);
//         ComfyWidgets.BOOLEAN(this, 'Parsed', [
//           '', {
//             default: true,
//           },
//         ]);
//         ComfyWidgets.COMBO(this, 'What', [
//           ['Prompt', 'Workflow'], {
//             default: 'Prompt',
//           },
//         ]);
//
//         // It runs at finish on each prompt queue
//         api.addEventListener('executed', this.fillMetadataWidget, false);
//       }
//
//       fillMetadataWidget = () => {
//         return app.graphToPrompt()
//         .then(workflow => {
//           let result = 'inactive';
//           // debugger
//           const output = this.widgets[0];
//           const active = this.widgets[1].value;
//           const parsed = this.widgets[2].value;
//           let what = this.widgets[3].value.toLowerCase();
//
//           if (active) {
//             what = what === 'prompt' ? 'output' : what; // little fix for better understanding
//             result = workflow[what];
//             if (parsed) {
//               result = JSON.stringify(result, null, 2);
//             } else {
//               result = JSON.stringify(result);
//             }
//           }
//
//           output.value = result;
//         });
//       };
//     }
//
//     // I'm not sure for what they're using prototype and lots of black magic, don't change the order!
//     LiteGraph.registerNodeType('Show Metadata [Crystools]', MetadataNode);
//     MetadataNode.category = `crystools ${commonPrefix}/Debugger`;
//     MetadataNode.shape = LiteGraph.BOX_SHAPE;
//     MetadataNode.title = `Show Metadata ${commonPrefix}`;
//     // MetadataNode.collapsable = false;
//     // MetadataNode.color = "#FF2222";
//     // MetadataNode.bgcolor = "#000000";
//   },
// });
