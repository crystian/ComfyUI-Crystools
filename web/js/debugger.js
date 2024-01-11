import { app } from '/scripts/app.js';
import { api } from '/scripts/api.js';
import { ComfyWidgets } from '/scripts/widgets.js';
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
        class MetadataNode {
            constructor() {
                Object.defineProperty(this, "serialize_widgets", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: void 0
                });
                Object.defineProperty(this, "isVirtualNode", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: void 0
                });
                Object.defineProperty(this, "widgets", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: void 0
                });
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
                const w = ComfyWidgets.STRING(this, '', [
                    '', {
                        default: '', multiline: true,
                    },
                ], app).widget;
                w.inputEl.readOnly = true;
                ComfyWidgets.BOOLEAN(this, 'Active', [
                    '', {
                        default: true,
                    },
                ], app);
                ComfyWidgets.BOOLEAN(this, 'Parsed', [
                    '', {
                        default: true,
                    },
                ], app);
                ComfyWidgets.COMBO(this, 'What', [
                    ['Prompt', 'Workflow'], {
                        default: 'Prompt',
                    },
                ]);
                api.addEventListener('executed', this.fillMetadataWidget);
            }
        }
        LiteGraph.registerNodeType('Show Metadata [Crystools]', MetadataNode);
        MetadataNode.category = `crystools ${commonPrefix}/Debugger`;
        MetadataNode.shape = LiteGraph.BOX_SHAPE;
        MetadataNode.title = `Show Metadata ${commonPrefix}`;
    },
});
