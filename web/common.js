import { ComfyWidgets } from './comfy/index.js';
export const commonPrefix = '🪛';
export function displayContext(nodeType, appFromArg, index = 0, serialize_widgets = false, isVirtualNode = false) {
    function populate(text) {
        if (this.widgets) {
            const pos = this.widgets.findIndex((w) => w.name === 'text');
            if (pos !== -1) {
                for (let i = pos; i < this.widgets.length; i++) {
                    this.widgets[i]?.onRemove?.();
                }
                this.widgets.length = pos;
            }
        }
        this.serialize_widgets = serialize_widgets;
        this.isVirtualNode = isVirtualNode;
        const widget = ComfyWidgets.STRING(this, 'text', [
            'STRING', { multiline: true },
        ], appFromArg).widget;
        widget.inputEl.readOnly = true;
        widget.inputEl.style.opacity = 0.6;
        if (Array.isArray(text) && index !== undefined && text[index] !== undefined) {
            text = text[index];
        }
        widget.value = text || '';
        widget.serializeValue = async () => { };
        requestAnimationFrame(() => {
            const sz = this.computeSize();
            if (sz[0] < this.size[0]) {
                sz[0] = this.size[0];
            }
            if (sz[1] < this.size[1]) {
                sz[1] = this.size[1];
            }
            this.onResize?.(sz);
            appFromArg.graph.setDirtyCanvas(true, false);
        });
    }
    const onExecutedOriginal = nodeType.prototype.onExecuted;
    nodeType.prototype.onExecuted = function (message) {
        onExecutedOriginal?.apply(this, arguments);
        populate.call(this, message.text);
    };
    const onConfigureOriginal = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function () {
        onConfigureOriginal?.apply(this, arguments);
        if (this.widgets_values?.length) {
            populate.call(this, this.widgets_values);
        }
    };
}
