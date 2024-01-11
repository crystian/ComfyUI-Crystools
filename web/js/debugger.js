import { app } from '../../../scripts/app.js';
import { api } from '../../../scripts/api.js';
import { ComfyWidgets } from '../../../scripts/widgets.js';
import { commonPrefix, displayContext } from './common.js';

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

app.registerExtension({
  name: 'Crystools.Debugger.Metadata',

  registerCustomNodes() {
    class MetadataNode {
      constructor() {
        this.serialize_widgets = false;
        this.isVirtualNode = true;

        const w = ComfyWidgets.STRING(this, '', ['', {default: '', multiline: true}], app).widget;
        w.inputEl.readOnly = true;
        ComfyWidgets.BOOLEAN(this, 'Active', ['', {default: true}], app);
        ComfyWidgets.BOOLEAN(this, 'Parsed', ['', {default: true}], app);
        ComfyWidgets.COMBO(this, 'What', [['Prompt', 'Workflow'], {default: 'Prompt'}]);

        // It runs at finish on each prompt queue
        api.addEventListener('executed', this.fillMetadataWidget);
      }

      fillMetadataWidget = () => {
        app.graphToPrompt()
        .then(workflow => {
          let result = 'inactive';
          // debugger
          const output = this.widgets[0];
          const active = this.widgets[1].value;
          const parsed = this.widgets[2].value;
          let what = this.widgets[3].value.toLowerCase();

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
      }
    }

    // I'm not sure for what they're using prototype and lots of black magic, don't change the order!
    LiteGraph.registerNodeType('Show Metadata [Crystools]', MetadataNode);
    MetadataNode.category = `crystools ${commonPrefix}/Debugger`;
    MetadataNode.shape = LiteGraph.BOX_SHAPE;
    MetadataNode.title = `Show Metadata ${commonPrefix}`;
    // MetadataNode.collapsable = false;
    // MetadataNode.color = "#FF2222";
    // MetadataNode.bgcolor = "#000000";
  },
});
