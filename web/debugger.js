import { app } from '/scripts/app.js';
import { api } from '/scripts/api.js';
import { commonPrefix, displayContext } from './common.js';
import { LiteGraph, TLGraphNode, ComfyWidgets } from './liteGraph.js';
console.log('debugger.ts');
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
                super(`Show Metadata ${commonPrefix}`);
                Object.defineProperty(this, "fillMetadataWidget", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: () => {
                        return app.graphToPrompt()
                            .then(workflow => {
                            let result = 'inactive';
                            const output = this.widgets[0];
                            const active = this.widgets[1].value;
                            const parsed = this.widgets[2].value;
                            let what = this.widgets[3].value.toLowerCase();
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
                            output.value = result;
                        });
                    }
                });
                this.serialize_widgets = false;
                this.isVirtualNode = true;
                const widget = ComfyWidgets.STRING(this, '', [
                    '', {
                        default: '', multiline: true,
                    },
                ], app).widget;
                widget.inputEl.readOnly = true;
                ComfyWidgets.BOOLEAN(this, 'Active', [
                    '', {
                        default: true,
                    },
                ]);
                ComfyWidgets.BOOLEAN(this, 'Parsed', [
                    '', {
                        default: true,
                    },
                ]);
                ComfyWidgets.COMBO(this, 'What', [
                    ['Prompt', 'Workflow'], {
                        default: 'Prompt',
                    },
                ]);
                api.addEventListener('executed', this.fillMetadataWidget, false);
            }
        }
        LiteGraph.registerNodeType('Show Metadata [Crystools]', MetadataNode);
        MetadataNode.category = `crystools ${commonPrefix}/Debugger`;
        MetadataNode.shape = LiteGraph.BOX_SHAPE;
    },
});
