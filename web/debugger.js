import { app, api, ComfyWidgets, LiteGraph, TLGraphNode } from './comfy/index.js';
import { commonPrefix, displayContext } from './common.js';
app.registerExtension({
    name: 'Crystools.Debugger.ConsoleAny',
    beforeRegisterNodeDef(nodeType, nodeData, appFromArg) {
        if (nodeData.name === 'Show any [Crystools]') {
            displayContext(nodeType, appFromArg, 3);
        }
    },
});
app.registerExtension({
    name: 'Crystools.Debugger.Metadata',
    registerCustomNodes() {
        class MetadataNode extends TLGraphNode {
            constructor() {
                super(`${commonPrefix} Show Metadata `);
                Object.defineProperty(this, "fillMetadataWidget", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: () => {
                        return app.graphToPrompt()
                            .then((workflow) => {
                            let result = 'inactive';
                            if (this.widgets?.length !== 4) {
                                console.error('Something is wrong with the widgets, should be 4!');
                                return 'error';
                            }
                            const output = this.widgets[0];
                            const active = this.widgets[1]?.value;
                            const parsed = this.widgets[2]?.value;
                            let what = this.widgets[3]?.value.toLowerCase();
                            if (active) {
                                what = what === 'prompt' ? 'output' : what;
                                result = workflow[what];
                                if (parsed) {
                                    result = JSON.stringify(result, null, 2);
                                }
                                else {
                                    result = JSON.stringify(result);
                                }
                            }
                            if (output) {
                                output.value = result;
                            }
                            else {
                                console.error('Something is wrong with the widgets, output is undefined!');
                                return 'error';
                            }
                            return result;
                        });
                    }
                });
                this.serialize_widgets = false;
                this.isVirtualNode = true;
                const widget = ComfyWidgets.STRING(this, '', [
                    '', { default: '', multiline: true },
                ], app).widget;
                widget.inputEl.readOnly = true;
                ComfyWidgets.BOOLEAN(this, 'Active', [
                    '', { default: true },
                ]);
                ComfyWidgets.BOOLEAN(this, 'Parsed', [
                    '', { default: true },
                ]);
                ComfyWidgets.COMBO(this, 'What', [
                    ['Prompt', 'Workflow'], { default: 'Prompt' },
                ]);
                api.addEventListener('executed', this.fillMetadataWidget, false);
            }
        }
        LiteGraph.registerNodeType('Show Metadata [Crystools]', MetadataNode);
        MetadataNode.category = `crystools ${commonPrefix}/Debugger`;
        MetadataNode.shape = LiteGraph.BOX_SHAPE;
        MetadataNode.title = `${commonPrefix} Show Metadata`;
    },
});
