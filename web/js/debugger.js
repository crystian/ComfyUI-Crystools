import { app } from '../../../scripts/app.js';
import { api } from '../../../scripts/api.js';
import { ComfyWidgets } from '../../../scripts/widgets.js';
import { displayContext } from './common.js';

// "Show any" Node
app.registerExtension({
  name: 'Crystools.Debugger.ConsoleAny',
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name === 'Show any [Crystools]') {
      // 3 is the index of the text field in the node
      displayContext(nodeType, app, 3);
    }
  },
});


// "Show metadata" Node
let metadata_node;

app.registerExtension({
  name: 'Crystools.Debugger.Metadata',

  registerCustomNodes() {
    const category = 'crystools/Debugger';
    const friendlyName = 'Show Metadata [Crystools]';

    class MetadataNode {
      // color = "#FF2222";
      // bgcolor = "#000000";
      groupcolor = LGraphCanvas.node_colors.black.groupcolor;

      constructor() {
        metadata_node = this;
        this.serialize_widgets = false;
        this.isVirtualNode = true;

        const w = ComfyWidgets.STRING(this, '', ['', {default: '', multiline: true}], app).widget;
        w.inputEl.readOnly = true;
        ComfyWidgets.BOOLEAN(this, 'Active', ['', {default: true}], app);
        ComfyWidgets.BOOLEAN(this, 'Parsed', ['', {default: true}], app);
        ComfyWidgets.COMBO(this, 'What', [['Prompt', 'Workflow'], {default: 'Prompt'}]);
      }
    }


    LiteGraph.registerNodeType(friendlyName,
      Object.assign(MetadataNode, {
        title: friendlyName,
        title_mode: LiteGraph.NORMAL_TITLE,
        collapsable: true,
      }),
    );

    MetadataNode.category = category;
  },
});

const fillMetadataWidget = function() {
  app.graphToPrompt()
  .then(workflow => {
    if (!metadata_node) {
      return;
    }
    let result = 'inactive';
    const output = metadata_node.widgets[0];
    const active = metadata_node.widgets[1].value;
    const parsed = metadata_node.widgets[2].value;
    let what = metadata_node.widgets[3].value.toLowerCase();

    if (active) {
      what = what === 'prompt' ? 'output' : what; // little fix for better understanding
      result = workflow[what];
      if (parsed) {
        result = JSON.stringify(result, null, 2);
      } else {
        result = JSON.stringify(result);
      }
    }

    output.value = result;
  });
};


// It runs at finish on each prompt queue
api.addEventListener('executed', fillMetadataWidget);
