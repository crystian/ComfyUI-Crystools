"""
@author: Crystian
@title: Crystools
@nickname: Crystools
@version: 1.16.6
@project: "https://github.com/crystian/ComfyUI-Crystools",
@description: Plugins for multiples uses, mainly for debugging, you need them! IG: https://www.instagram.com/crystian.ia
"""

from .core import version, logger
logger.info(f'Crystools version: {version}')

from .nodes._names import CLASSES
from .nodes.primitive import CBoolean, CText, CTextML, CInteger, CFloat
from .nodes.switch import CSwitchBooleanAny, CSwitchBooleanLatent, CSwitchBooleanConditioning, CSwitchBooleanImage, \
  CSwitchBooleanString, CSwitchBooleanMask
from .nodes.debugger import CConsoleAny, CConsoleAnyToJson
from .nodes.image import CImagePreviewFromImage, CImageLoadWithMetadata, CImageGetResolution, CImagePreviewFromMetadata, \
    CImageSaveWithExtraMetadata
from .nodes.list import CListAny, CListString
from .nodes.pipe import CPipeToAny, CPipeFromAny
from .nodes.utils import CUtilsCompareJsons, CUtilsStatSystem
from .nodes.metadata import CMetadataExtractor, CMetadataCompare
from .server import *
from .general import *

NODE_CLASS_MAPPINGS = {
    CLASSES.CBOOLEAN_NAME.value: CBoolean,
    CLASSES.CTEXT_NAME.value: CText,
    CLASSES.CTEXTML_NAME.value: CTextML,
    CLASSES.CINTEGER_NAME.value: CInteger,
    CLASSES.CFLOAT_NAME.value: CFloat,

    CLASSES.CDEBUGGER_CONSOLE_ANY_NAME.value: CConsoleAny,
    CLASSES.CDEBUGGER_CONSOLE_ANY_TO_JSON_NAME.value: CConsoleAnyToJson,

    CLASSES.CLIST_ANY_NAME.value: CListAny,
    CLASSES.CLIST_STRING_NAME.value: CListString,

    CLASSES.CSWITCH_ANY_NAME.value: CSwitchBooleanAny,
    CLASSES.CSWITCH_LATENT_NAME.value: CSwitchBooleanLatent,
    CLASSES.CSWITCH_CONDITIONING_NAME.value: CSwitchBooleanConditioning,
    CLASSES.CSWITCH_IMAGE_NAME.value: CSwitchBooleanImage,
    CLASSES.CSWITCH_MASK_NAME.value: CSwitchBooleanMask,
    CLASSES.CSWITCH_STRING_NAME.value: CSwitchBooleanString,

    CLASSES.CPIPE_TO_ANY_NAME.value: CPipeToAny,
    CLASSES.CPIPE_FROM_ANY_NAME.value: CPipeFromAny,

    CLASSES.CIMAGE_LOAD_METADATA_NAME.value: CImageLoadWithMetadata,
    CLASSES.CIMAGE_GET_RESOLUTION_NAME.value: CImageGetResolution,
    CLASSES.CIMAGE_PREVIEW_IMAGE_NAME.value: CImagePreviewFromImage,
    CLASSES.CIMAGE_PREVIEW_METADATA_NAME.value: CImagePreviewFromMetadata,
    CLASSES.CIMAGE_SAVE_METADATA_NAME.value: CImageSaveWithExtraMetadata,

    CLASSES.CMETADATA_EXTRACTOR_NAME.value: CMetadataExtractor,
    CLASSES.CMETADATA_COMPARATOR_NAME.value: CMetadataCompare,
    CLASSES.CUTILS_JSON_COMPARATOR_NAME.value: CUtilsCompareJsons,
    CLASSES.CUTILS_STAT_SYSTEM_NAME.value: CUtilsStatSystem
}

NODE_DISPLAY_NAME_MAPPINGS = {
    CLASSES.CBOOLEAN_NAME.value: CLASSES.CBOOLEAN_DESC.value,
    CLASSES.CTEXT_NAME.value: CLASSES.CTEXT_DESC.value,
    CLASSES.CTEXTML_NAME.value: CLASSES.CTEXTML_DESC.value,
    CLASSES.CINTEGER_NAME.value: CLASSES.CINTEGER_DESC.value,
    CLASSES.CFLOAT_NAME.value: CLASSES.CFLOAT_DESC.value,

    CLASSES.CDEBUGGER_CONSOLE_ANY_NAME.value: CLASSES.CDEBUGGER_ANY_DESC.value,
    CLASSES.CDEBUGGER_CONSOLE_ANY_TO_JSON_NAME.value: CLASSES.CDEBUGGER_CONSOLE_ANY_TO_JSON_DESC.value,

    CLASSES.CLIST_ANY_NAME.value: CLASSES.CLIST_ANY_DESC.value,
    CLASSES.CLIST_STRING_NAME.value: CLASSES.CLIST_STRING_DESC.value,

    CLASSES.CSWITCH_ANY_NAME.value: CLASSES.CSWITCH_ANY_DESC.value,
    CLASSES.CSWITCH_LATENT_NAME.value: CLASSES.CSWITCH_LATENT_DESC.value,
    CLASSES.CSWITCH_CONDITIONING_NAME.value: CLASSES.CSWITCH_CONDITIONING_DESC.value,
    CLASSES.CSWITCH_IMAGE_NAME.value: CLASSES.CSWITCH_IMAGE_DESC.value,
    CLASSES.CSWITCH_MASK_NAME.value: CLASSES.CSWITCH_MASK_DESC.value,
    CLASSES.CSWITCH_STRING_NAME.value: CLASSES.CSWITCH_STRING_DESC.value,

    CLASSES.CPIPE_TO_ANY_NAME.value: CLASSES.CPIPE_TO_ANY_DESC.value,
    CLASSES.CPIPE_FROM_ANY_NAME.value: CLASSES.CPIPE_FROM_ANY_DESC.value,

    CLASSES.CIMAGE_LOAD_METADATA_NAME.value: CLASSES.CIMAGE_LOAD_METADATA_DESC.value,
    CLASSES.CIMAGE_GET_RESOLUTION_NAME.value: CLASSES.CIMAGE_GET_RESOLUTION_DESC.value,
    CLASSES.CIMAGE_PREVIEW_IMAGE_NAME.value: CLASSES.CIMAGE_PREVIEW_IMAGE_DESC.value,
    CLASSES.CIMAGE_PREVIEW_METADATA_NAME.value: CLASSES.CIMAGE_PREVIEW_METADATA_DESC.value,
    CLASSES.CIMAGE_SAVE_METADATA_NAME.value: CLASSES.CIMAGE_SAVE_METADATA_DESC.value,

    CLASSES.CMETADATA_EXTRACTOR_NAME.value: CLASSES.CMETADATA_EXTRACTOR_DESC.value,
    CLASSES.CMETADATA_COMPARATOR_NAME.value: CLASSES.CMETADATA_COMPARATOR_DESC.value,

    CLASSES.CUTILS_JSON_COMPARATOR_NAME.value: CLASSES.CUTILS_JSON_COMPARATOR_DESC.value,
    CLASSES.CUTILS_STAT_SYSTEM_NAME.value: CLASSES.CUTILS_STAT_SYSTEM_DESC.value,
}


WEB_DIRECTORY = "./web"
