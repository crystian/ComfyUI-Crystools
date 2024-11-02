import { app } from './comfy/index.js';
import { displayContext } from './common.js';
const crystoolsExtensionsSerialized = {
    'Read JSON file [Crystools]': 'Crystools.Utils.ReadJsonFile',
    'JSON extractor [Crystools]': 'Crystools.Utils.JsonExtractor',
};
const crystoolsExtensions = {
    'Get resolution [Crystools]': 'Crystools.Image.GetResolution',
    'Preview from image [Crystools]': 'Crystools.Image.PreviewFromImage',
    'Preview from metadata [Crystools]': 'Crystools.Image.PreviewFromMetadata',
    'Metadata comparator [Crystools]': 'Crystools.Metadata.MetadataComparator',
    'Stats system [Crystools]': 'Crystools.Utils.StatsSystem',
    'Show any to JSON [Crystools]': 'Crystools.Debugger.ConsoleAnyToJson',
};
Object.keys(crystoolsExtensionsSerialized).forEach(prop => {
    crystoolsExtensions[prop] = crystoolsExtensionsSerialized[prop];
});
Object.keys(crystoolsExtensions).forEach(key => {
    app.registerExtension({
        name: crystoolsExtensions[key],
        beforeRegisterNodeDef(nodeType, nodeData, appFromArg) {
            if (nodeData.name === key) {
                if (nodeData.name in crystoolsExtensionsSerialized) {
                    displayContext(nodeType, appFromArg, 0, true);
                }
                else {
                    displayContext(nodeType, appFromArg, 0);
                }
            }
        },
    });
});
