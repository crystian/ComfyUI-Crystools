from enum import Enum


# IMPORTANT DON'T CHANGE THE "NAME" AND "TYPE" OF THE ENUMS, IT WILL BREAK THE COMPATIBILITY!
# remember: NAME is for search, DESC is for contextual
class CLASSES(Enum):
    CBOOLEAN_NAME = "Primitive boolean [Crystools]"
    CBOOLEAN_DESC = "Primitive boolean [Crystools]"
    CTEXT_NAME = "Primitive string [Crystools]"
    CTEXT_DESC = "Primitive string [Crystools]"
    CTEXTML_NAME = "Primitive string multiline [Crystools]"
    CTEXTML_DESC = "Primitive string multiline [Crystools]"
    CINTEGER_NAME = "Primitive integer [Crystools]"
    CINTEGER_DESC = "Primitive integer [Crystools]"
    CFLOAT_NAME = "Primitive float [Crystools]"
    CFLOAT_DESC = "Primitive float [Crystools]"

    CCONSOLE_ANY_NAME = "Show any [Crystools]"
    CCONSOLE_ANY_DESC = "Show any value to console/display [Crystools]"

    CLIST_ANY_TYPE = "ListAny"
    CLIST_ANY_NAME = "List of any [Crystools]"
    CLIST_ANY_DESC = "List of any [Crystools]"
    CLIST_STRING_TYPE = "ListString"
    CLIST_STRING_NAME = "List of strings [Crystools]"
    CLIST_STRING_DESC = "List of strings [Crystools]"

    CSWITCH_ANY_NAME = "Switch any [Crystools]"
    CSWITCH_ANY_DESC = "Switch any [Crystools]"
    CSWITCH_STRING_NAME = "Switch string [Crystools]"
    CSWITCH_STRING_DESC = "Switch string [Crystools]"
    CSWITCH_CONDITIONING_NAME = "Switch conditioning [Crystools]"
    CSWITCH_CONDITIONING_DESC = "Switch conditioning [Crystools]"
    CSWITCH_IMAGE_NAME = "Switch image [Crystools]"
    CSWITCH_IMAGE_DESC = "Switch image [Crystools]"
    CSWITCH_LATENT_NAME = "Switch latent [Crystools]"
    CSWITCH_LATENT_DESC = "Switch latent [Crystools]"

    CPIPE_ANY_TYPE = "CPipeAny"
    CPIPE_TO_ANY_NAME = "Pipe to/edit any [Crystools]"
    CPIPE_TO_ANY_DESC = "Pipe to/edit any [Crystools]"
    CPIPE_FROM_ANY_NAME = "Pipe from any [Crystools]"
    CPIPE_FROM_ANY_DESC = "Pipe from any [Crystools]"

    CIMAGE_LOAD_METADATA_NAME = "Load image with metadata [Crystools]"
    CIMAGE_LOAD_METADATA_DESC = "Load image with metadata [Crystools]"
    CIMAGE_SHOW_RESOLUTION_NAME = "Show resolution [Crystools]"
    CIMAGE_SHOW_RESOLUTION_DESC = "Show resolution [Crystools]"
    CIMAGE_PREVIEW_IMAGE_NAME = "Preview from image [Crystools]"
    CIMAGE_PREVIEW_IMAGE_DESC = "Preview from image (show prompt) [Crystools]"
    CIMAGE_PREVIEW_METADATA_NAME = "Preview from metadata [Crystools]"
    CIMAGE_PREVIEW_METADATA_DESC = "Preview from metadata (show prompt) [Crystools]"

    CUTILS_METADATA_EXTRACTOR_NAME = "Metadata extractor [Crystools]"
    CUTILS_METADATA_EXTRACTOR_DESC = "Metadata extractor [Crystools]"
    CUTILS_METADATA_COMPARATOR_NAME = "Metadata comparator [Crystools]"
    CUTILS_METADATA_COMPARATOR_DESC = "Metadata comparator [Crystools]"
    CUTILS_JSON_COMPARATOR_NAME = "Json comparator [Crystools]"
    CUTILS_JSON_COMPARATOR_DESC = "Json comparator [Crystools]"
    CUTILS_STAT_SYSTEM_NAME = "Stats system [Crystools]"
    CUTILS_STAT_SYSTEM_DESC = "Stats system (powered by WAS) [Crystools]"
