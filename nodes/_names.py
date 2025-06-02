from enum import Enum

prefix = '🪛 '

# IMPORTANT DON'T CHANGE THE 'NAME' AND 'TYPE' OF THE ENUMS, IT WILL BREAK THE COMPATIBILITY!
# remember: NAME is for search, DESC is for contextual
class CLASSES(Enum):
    CBOOLEAN_NAME = 'Primitive boolean [Crystools]'
    CBOOLEAN_DESC = prefix + 'Primitive boolean'
    CTEXT_NAME = 'Primitive string [Crystools]'
    CTEXT_DESC = prefix + 'Primitive string'
    CTEXTML_NAME = 'Primitive string multiline [Crystools]'
    CTEXTML_DESC = prefix + 'Primitive string multiline'
    CINTEGER_NAME = 'Primitive integer [Crystools]'
    CINTEGER_DESC = prefix + 'Primitive integer'
    CFLOAT_NAME = 'Primitive float [Crystools]'
    CFLOAT_DESC = prefix + 'Primitive float'

    CDEBUGGER_CONSOLE_ANY_NAME = 'Show any [Crystools]'
    CDEBUGGER_ANY_DESC = prefix + 'Show any value to console/display'
    CDEBUGGER_CONSOLE_ANY_TO_JSON_NAME = 'Show any to JSON [Crystools]'
    CDEBUGGER_CONSOLE_ANY_TO_JSON_DESC = prefix + 'Show any to JSON'

    CLIST_ANY_TYPE = 'ListAny'
    CLIST_ANY_NAME = 'List of any [Crystools]'
    CLIST_ANY_DESC = prefix + 'List of any'
    CLIST_STRING_TYPE = 'ListString'
    CLIST_STRING_NAME = 'List of strings [Crystools]'
    CLIST_STRING_DESC = prefix + 'List of strings'

    CSWITCH_FROM_ANY_NAME = 'Switch from any [Crystools]'
    CSWITCH_FROM_ANY_DESC = prefix + 'Switch from any'
    CSWITCH_ANY_NAME = 'Switch any [Crystools]'
    CSWITCH_ANY_DESC = prefix + 'Switch any'
    CSWITCH_STRING_NAME = 'Switch string [Crystools]'
    CSWITCH_STRING_DESC = prefix + 'Switch string'
    CSWITCH_CONDITIONING_NAME = 'Switch conditioning [Crystools]'
    CSWITCH_CONDITIONING_DESC = prefix + 'Switch conditioning'
    CSWITCH_IMAGE_NAME = 'Switch image [Crystools]'
    CSWITCH_IMAGE_DESC = prefix + 'Switch image'
    CSWITCH_MASK_NAME = 'Switch mask [Crystools]'
    CSWITCH_MASK_DESC = prefix + 'Switch mask'
    CSWITCH_LATENT_NAME = 'Switch latent [Crystools]'
    CSWITCH_LATENT_DESC = prefix + 'Switch latent'

    CPIPE_ANY_TYPE = 'CPipeAny'
    CPIPE_TO_ANY_NAME = 'Pipe to/edit any [Crystools]'
    CPIPE_TO_ANY_DESC = prefix + 'Pipe to/edit any'
    CPIPE_FROM_ANY_NAME = 'Pipe from any [Crystools]'
    CPIPE_FROM_ANY_DESC = prefix + 'Pipe from any'

    CIMAGE_LOAD_METADATA_NAME = 'Load image with metadata [Crystools]'
    CIMAGE_LOAD_METADATA_DESC = prefix + 'Load image with metadata'
    CIMAGE_GET_RESOLUTION_NAME = 'Get resolution [Crystools]'
    CIMAGE_GET_RESOLUTION_DESC = prefix + 'Get resolution'
    CIMAGE_PREVIEW_IMAGE_NAME = 'Preview from image [Crystools]'
    CIMAGE_PREVIEW_IMAGE_DESC = prefix + 'Preview from image'
    CIMAGE_PREVIEW_METADATA_NAME = 'Preview from metadata [Crystools]'
    CIMAGE_PREVIEW_METADATA_DESC = prefix + 'Preview from metadata'
    CIMAGE_SAVE_METADATA_NAME = 'Save image with extra metadata [Crystools]'
    CIMAGE_SAVE_METADATA_DESC = prefix + 'Save image with extra metadata'

    CMETADATA_EXTRACTOR_NAME = 'Metadata extractor [Crystools]'
    CMETADATA_EXTRACTOR_DESC =  prefix + 'Metadata extractor'
    CMETADATA_COMPARATOR_NAME = 'Metadata comparator [Crystools]'
    CMETADATA_COMPARATOR_DESC = prefix + 'Metadata comparator'

    CUTILS_JSON_COMPARATOR_NAME = 'JSON comparator [Crystools]'
    CUTILS_JSON_COMPARATOR_DESC = prefix + 'JSON comparator'
    CUTILS_STAT_SYSTEM_NAME = 'Stats system [Crystools]'
    CUTILS_STAT_SYSTEM_DESC = prefix + 'Stats system (powered by WAS)'

    # CPARAMETERS_NAME = 'External parameter from JSON file [Crystools]'
    # CPARAMETERS_DESC = prefix + 'External parameters from JSON file'

    CJSONFILE_NAME = 'Read JSON file [Crystools]'
    CJSONFILE_DESC = prefix + 'Read JSON file (BETA)'

    CJSONEXTRACTOR_NAME = 'JSON extractor [Crystools]'
    CJSONEXTRACTOR_DESC = prefix + 'JSON extractor (BETA)'
