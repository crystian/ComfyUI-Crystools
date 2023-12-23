import { app } from '../../../scripts/app.js';
import { displayContext } from './common.js';

app.registerExtension({
  name: 'Crystools.Utils.SamplesPassthrough',
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name === 'Stats System [Crystools]') {
      displayContext(nodeType, app, 0);
    }
  },
});

app.registerExtension({
  name: 'Crystools.Utils.MetadataCompare',
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name === 'Metadata compare [Crystools]') {
      displayContext(nodeType, app, 0);
    }
  },
});

