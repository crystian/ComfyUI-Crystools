import type { TLGraphNode } from './comfy/index.js';
import { ComfyWidgets, ComfyApp } from './comfy/index.js';

export const commonPrefix = '🪛';

export function displayContext(
  nodeType: TLGraphNode,
  appFromArg: ComfyApp,
  index = 0, serialize_widgets = false, isVirtualNode = false,
): void {
  function populate(this: TLGraphNode, text: string | string[]): void {
    if (this.widgets) {
      const pos = this.widgets.findIndex((w) => w.name === 'text');
      if (pos !== -1) {
        for (let i = pos; i < this.widgets.length; i++) {

          this.widgets[i]?.onRemove?.();
        }
        this.widgets.length = pos;
      }
    }
    // If you want to do not save properties in the node (be careful with F5)
    // BUG on isVirtualNode, with "true", it ignores OUTPUT_NODE on py file!
    this.serialize_widgets = serialize_widgets;
    this.isVirtualNode = isVirtualNode;

    const widget = ComfyWidgets.STRING(this, 'text', [
      'STRING', { multiline: true },
    ], appFromArg).widget;
    widget.inputEl.readOnly = true;
    widget.inputEl.style.opacity = 0.6;
    if (Array.isArray(text) && index !== undefined && text[index] !== undefined) {
      // @ts-ignore
      text = text[index];
    }
    widget.value = text || '';
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    widget.serializeValue = async(): Promise<void> => {}; // just for no serialized to itself!

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

  // When the node is executed we will be sent the input text, display this in the widget

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const onExecutedOriginal = nodeType.prototype.onExecuted;
  nodeType.prototype.onExecuted = function(message: { text: string }): void {
    // @ts-ignore
    onExecutedOriginal?.apply(this, arguments);
    populate.call(this, message.text);
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const onConfigureOriginal = nodeType.prototype.onConfigure;
  nodeType.prototype.onConfigure = function(): void {
    // @ts-ignore
    onConfigureOriginal?.apply(this, arguments);
    if (this.widgets_values?.length) {
      populate.call(this, this.widgets_values);
    }
  };
}


// propagate the output value to the dependents nodes, it does not work with some nodes ¯\_(ツ)_/¯
// const propagateOutputToDependentsNodes = function(output: serializedLGraph, value: string) {
//   if (output.links?.length) {
//     for (const l of output.links) {
//       const link_info = app.graph.links[l];
//       const outNode = app.graph.getNodeById(link_info.target_id);
//       const outIn = outNode?.inputs?.[link_info.target_slot];
//       if (outIn.widget) {
//         const widget = outNode.widgets.find((w: IWidget) => w.name === outIn.widget.name);
//         if (!widget) {
//           continue;
//         }
//         widget.value = value;
//       }
//     }
//   }
// };
