import { ComfyWidgets } from '/scripts/widgets.js';
import { app as appFromScript } from '/scripts/app.js';
export const commonPrefix = '🪛';
export function displayContext(nodeType, app, index = 0, serialize_widgets = false, isVirtualNode = false) {
    function populate(text) {
        if (this.widgets) {
            const pos = this.widgets.findIndex((w) => w.name === 'text');
            if (pos !== -1) {
                for (let i = pos; i < this.widgets.length; i++) {
                    this.widgets[i].onRemove?.();
                }
                this.widgets.length = pos;
            }
        }
        this.serialize_widgets = serialize_widgets;
        this.isVirtualNode = isVirtualNode;
        const w = ComfyWidgets.STRING(this, 'text', [
            'STRING', {
                multiline: true,
            },
        ], app).widget;
        w.inputEl.readOnly = true;
        w.inputEl.style.opacity = 0.6;
        if (Array.isArray(text)) {
            text = text[index];
        }
        w.value = text || '';
        w.serializeValue = async () => { };
        requestAnimationFrame(() => {
            const sz = this.computeSize();
            if (sz[0] < this.size[0]) {
                sz[0] = this.size[0];
            }
            if (sz[1] < this.size[1]) {
                sz[1] = this.size[1];
            }
            this.onResize?.(sz);
            app.graph.setDirtyCanvas(true, false);
        });
    }
    const onExecuted = nodeType.prototype.onExecuted;
    nodeType.prototype.onExecuted = function (message) {
        onExecuted?.apply(this, arguments);
        populate.call(this, message.text);
    };
    const onConfigure = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function () {
        onConfigure?.apply(this, arguments);
        if (this.widgets_values?.length) {
            populate.call(this, this.widgets_values);
        }
    };
}
const propagateOutputToDependentsNodes = function (output, value) {
    if (output.links?.length) {
        for (const l of output.links) {
            const link_info = appFromScript.graph.links[l];
            const outNode = appFromScript.graph.getNodeById(link_info.target_id);
            const outIn = outNode?.inputs?.[link_info.target_slot];
            if (outIn.widget) {
                const widget = outNode.widgets.find((w) => w.name === outIn.widget.name);
                if (!widget) {
                    continue;
                }
                widget.value = value;
            }
        }
    }
};
