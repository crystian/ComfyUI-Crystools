from enum import Enum

postfix = ' 🪛'

# IMPORTANT DON'T CHANGE THE 'NAME' AND 'TYPE' OF THE ENUMS, IT WILL BREAK THE COMPATIBILITY!
# remember: NAME is for search, DESC is for contextual
class CLASSES(Enum):
    CBOOLEAN_NAME = 'Primitive boolean [Crystools]'
    CBOOLEAN_DESC = 'Primitive boolean' + postfix
    CTEXT_NAME = 'Primitive string [Crystools]'
    CTEXT_DESC = 'Primitive string' + postfix
    CTEXTML_NAME = 'Primitive string multiline [Crystools]'
    CTEXTML_DESC = 'Primitive string multiline' + postfix
    CINTEGER_NAME = 'Primitive integer [Crystools]'
    CINTEGER_DESC = 'Primitive integer' + postfix
    CFLOAT_NAME = 'Primitive float [Crystools]'
    CFLOAT_DESC = 'Primitive float' + postfix

    CDEBUGGER_CONSOLE_ANY_NAME = 'Show any [Crystools]'
    CDEBUGGER_ANY_DESC = 'Show any value to console/display' + postfix
    CDEBUGGER_CONSOLE_ANY_TO_JSON_NAME = 'Show any to JSON [Crystools]'
    CDEBUGGER_CONSOLE_ANY_TO_JSON_DESC = 'Show any to JSON' + postfix

    CLIST_ANY_TYPE = 'ListAny'
    CLIST_ANY_NAME = 'List of any [Crystools]'
    CLIST_ANY_DESC = 'List of any' + postfix
    CLIST_STRING_TYPE = 'ListString'
    CLIST_STRING_NAME = 'List of strings [Crystools]'
    CLIST_STRING_DESC = 'List of strings' + postfix

    CSWITCH_ANY_NAME = 'Switch any [Crystools]'
    CSWITCH_ANY_DESC = 'Switch any' + postfix
    CSWITCH_STRING_NAME = 'Switch string [Crystools]'
    CSWITCH_STRING_DESC = 'Switch string' + postfix
    CSWITCH_CONDITIONING_NAME = 'Switch conditioning [Crystools]'
    CSWITCH_CONDITIONING_DESC = 'Switch conditioning' + postfix
    CSWITCH_IMAGE_NAME = 'Switch image [Crystools]'
    CSWITCH_IMAGE_DESC = 'Switch image' + postfix
    CSWITCH_LATENT_NAME = 'Switch latent [Crystools]'
    CSWITCH_LATENT_DESC = 'Switch latent' + postfix

    CPIPE_ANY_TYPE = 'CPipeAny'
    CPIPE_TO_ANY_NAME = 'Pipe to/edit any [Crystools]'
    CPIPE_TO_ANY_DESC = 'Pipe to/edit any' + postfix
    CPIPE_FROM_ANY_NAME = 'Pipe from any [Crystools]'
    CPIPE_FROM_ANY_DESC = 'Pipe from any' + postfix

    CIMAGE_LOAD_METADATA_NAME = 'Load image with metadata [Crystools]'
    CIMAGE_LOAD_METADATA_DESC = 'Load image with metadata' + postfix
    CIMAGE_GET_RESOLUTION_NAME = 'Get resolution [Crystools]'
    CIMAGE_GET_RESOLUTION_DESC = 'Get resolution' + postfix
    CIMAGE_PREVIEW_IMAGE_NAME = 'Preview from image [Crystools]'
    CIMAGE_PREVIEW_IMAGE_DESC = 'Preview from image' + postfix
    CIMAGE_PREVIEW_METADATA_NAME = 'Preview from metadata [Crystools]'
    CIMAGE_PREVIEW_METADATA_DESC = 'Preview from metadata' + postfix
    CIMAGE_SAVE_METADATA_NAME = 'Save image with extra metadata [Crystools]'
    CIMAGE_SAVE_METADATA_DESC = 'Save image with extra metadata' + postfix

    CMETADATA_EXTRACTOR_NAME = 'Metadata extractor [Crystools]'
    CMETADATA_EXTRACTOR_DESC = 'Metadata extractor' + postfix
    CMETADATA_COMPARATOR_NAME = 'Metadata comparator [Crystools]'
    CMETADATA_COMPARATOR_DESC = 'Metadata comparator' + postfix

    CUTILS_JSON_COMPARATOR_NAME = 'Json comparator [Crystools]'
    CUTILS_JSON_COMPARATOR_DESC = 'Json comparator' + postfix
    CUTILS_STAT_SYSTEM_NAME = 'Stats system [Crystools]'
    CUTILS_STAT_SYSTEM_DESC = 'Stats system (powered by WAS)' + postfix
