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
    CLIST_STRING_NAME = "List of texts [Crystools]"
    CLIST_STRING_DESC = "List of texts [Crystools]"

    CSWITCH_ANY_NAME = "Switch any boolean [Crystools]"
    CSWITCH_ANY_DESC = "Switch any boolean [Crystools]"
    CSWITCH_STRING_NAME = "Switch string boolean [Crystools]"
    CSWITCH_STRING_DESC = "Switch string boolean [Crystools]"
    CSWITCH_CONDITIONING_NAME = "Switch conditioning boolean [Crystools]"
    CSWITCH_CONDITIONING_DESC = "Switch conditioning boolean [Crystools]"
    CSWITCH_IMAGE_NAME = "Switch image boolean [Crystools]"
    CSWITCH_IMAGE_DESC = "Switch image boolean [Crystools]"
    CSWITCH_LATENT_NAME = "Switch latent boolean [Crystools]"
    CSWITCH_LATENT_DESC = "Switch latent boolean [Crystools]"

    CPIPE_ANY_TYPE = "CPipeAny"
    CPIPE_TO_ANY_NAME = "Pipe to/edit Any [Crystools]"
    CPIPE_TO_ANY_DESC = "Pipe to/edit Any [Crystools]"
    CPIPE_FROM_ANY_NAME = "Pipe from Any [Crystools]"
    CPIPE_FROM_ANY_DESC = "Pipe from Any [Crystools]"

    CIMAGE_LOAD_METADATA_NAME = "Load image with metadata [Crystools]"
    CIMAGE_LOAD_METADATA_DESC = "Load image with metadata [Crystools]"
    CIMAGE_SHOW_RESOLUTION_NAME = "Image show resolution [Crystools]"
    CIMAGE_SHOW_RESOLUTION_DESC = "Image show resolution [Crystools]"
    CIMAGE_PREVIEW_ADVANCE_NAME = "Preview image advance [Crystools]"
    CIMAGE_PREVIEW_ADVANCE_DESC = "Preview image advance (prompt) [Crystools]"

    CUTILS_METADATA_EXTRACTOR_NAME = "Metadata extractor [Crystools]"
    CUTILS_METADATA_EXTRACTOR_DESC = "Metadata extractor [Crystools]"
    CUTILS_METADATA_COMPARE_NAME = "Metadata compare [Crystools]"
    CUTILS_METADATA_COMPARE_DESC = "Metadata compare [Crystools]"
    CUTILS_COMPARE_JSONS_NAME = "Compare 2 JSONs [Crystools]"
    CUTILS_COMPARE_JSONS_DESC = "Compare 2 JSONs [Crystools]"
    CUTILS_STAT_SYSTEM_NAME = "Stats System [Crystools]"
    CUTILS_STAT_SYSTEM_DESC = "Stats System (powered by WAS) [Crystools]"
