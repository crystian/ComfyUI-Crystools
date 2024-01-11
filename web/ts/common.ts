import { ComfyWidgets } from '../../../scripts/widgets.js';

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
    // if want to not save properties in the node (be careful with F5)
    // BUG on isVirtualNode, with "true", it ignores OUTPUT_NODE on py file!
    this.serialize_widgets = serialize_widgets;
    this.isVirtualNode = isVirtualNode;

    const w = ComfyWidgets['STRING'](this, 'text', ['STRING', {multiline: true}], app).widget;
    w.inputEl.readOnly = true;
    w.inputEl.style.opacity = 0.6;
    if (Array.isArray(text)) {
      text = text[index];
    }
    w.value = text || '';
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
  nodeType.prototype.onExecuted = function(message) {
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
const propagateOutputToDependentsNodes = function(output, value) {
  if (output.links && output.links.length) {
    for (const l of output.links) {
      const link_info = app.graph.links[l];
      const outNode = app.graph.getNodeById(link_info.target_id);
      const outIn = outNode && outNode.inputs && outNode.inputs[link_info.target_slot];
      if (outIn.widget) {
        const w = outNode.widgets.find((w) => w.name === outIn.widget.name);
        if (!w) {
          continue;
        }
        w.value = value;
      }
    }
  }
};
