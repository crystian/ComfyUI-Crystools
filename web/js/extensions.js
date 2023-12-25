import { app } from '../../../scripts/app.js';
import { displayContext } from './common.js';

let crystoolsExtensions = {
  'Get resolution [Crystools]': 'Crystools.Image.GetResolution',
  'Preview from image [Crystools]': 'Crystools.Image.PreviewFromImage',
  'Preview from metadata [Crystools]': 'Crystools.Image.PreviewFromMetadata',
  'Metadata comparator [Crystools]': 'Crystools.Metadata.MetadataComparator',
  'Stats system [Crystools]': 'Crystools.Utils.StatsSystem',
  'Show any to JSON [Crystools]': 'Crystools.Debugger.ConsoleAnyToJson',
};

Object.keys(crystoolsExtensions).forEach(key => {
  app.registerExtension({
    name: crystoolsExtensions[key],
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
      if (nodeData.name === key) {
        displayContext(nodeType, app, 0);
      }
    },
  });
});
