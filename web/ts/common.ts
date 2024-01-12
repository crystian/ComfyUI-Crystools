// / <reference path="./types.ts" />
import { ComfyWidgets } from '/scripts/widgets.js';
import { app as appFromScript } from '/scripts/app.js';
import type { LGraphNode, LiteGraph, serializedLGraph, IWidget } from './types.js';

export const commonPrefix = '🪛';

export function displayContext(
  nodeType: LGraphNode, app: LiteGraph,
  index = 0, serialize_widgets = false, isVirtualNode = false
) {
  function populate(this: LGraphNode, text: string | string[]) {
    if (this.widgets) {
      const pos = this.widgets.findIndex((w) => w.name === 'text');
      if (pos !== -1) {
        for (let i = pos; i < this.widgets.length; i++) {
          this.widgets[i].onRemove?.();
        }
        this.widgets.length = pos;
      }
    }
    // If you want to do not save properties in the node (be careful with F5)
    // BUG on isVirtualNode, with "true", it ignores OUTPUT_NODE on py file!
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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    w.serializeValue = async() => {}; // just for no serialized to itself!

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

  // When the node is executed we will be sent the input text, display this in the widget
  const onExecuted = nodeType.prototype.onExecuted;
  nodeType.prototype.onExecuted = function(message: { text: string }) {
    onExecuted?.apply(this, arguments);
    populate.call(this, message.text);
  };

  const onConfigure = nodeType.prototype.onConfigure;
  nodeType.prototype.onConfigure = function() {
    onConfigure?.apply(this, arguments);
    if (this.widgets_values?.length) {
      populate.call(this, this.widgets_values);
    }
  };
}

// propagate the output value to the dependents nodes, it does not work with some nodes ¯\_(ツ)_/¯
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const propagateOutputToDependentsNodes = function(output: serializedLGraph, value: string) {
  if (output.links?.length) {
    for (const l of output.links) {
      const link_info = appFromScript.graph.links[l];
      const outNode = appFromScript.graph.getNodeById(link_info.target_id);
      const outIn = outNode?.inputs?.[link_info.target_slot];
      if (outIn.widget) {
        const widget = outNode.widgets.find((w: IWidget) => w.name === outIn.widget.name);
        if (!widget) {
          continue;
        }
        widget.value = value;
      }
    }
  }
};
