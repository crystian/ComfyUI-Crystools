from ..core import STRING, TEXTS, KEYS, CATEGORY, any, logger
from ._names import CLASSES


class CListAny:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
            },
            "optional": {
                "any_1": (any,),
                "any_2": (any,),
                "any_3": (any,),
                "any_4": (any,),
                "any_5": (any,),
                "any_6": (any,),
                "any_7": (any,),
                "any_8": (any,),
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.LIST.value
    RETURN_TYPES = (any,),
    RETURN_NAMES = ("any_list",)
    OUTPUT_IS_LIST = (True,)

    FUNCTION = "execute"

    def execute(self,
                any_1=None,
                any_2=None,
                any_3=None,
                any_4=None,
                any_5=None,
                any_6=None,
                any_7=None,
                any_8=None):

        list = []

        if any_1 is not None:
            try:
                list.append(any_1)
            except Exception as e:
                logger.warn(e)
        if any_2 is not None:
            try:
                list.append(any_2)
            except Exception as e:
                logger.warn(e)
        if any_3 is not None:
            try:
                list.append(any_3)
            except Exception as e:
                logger.warn(e)
        if any_4 is not None:
            try:
                list.append(any_4)
            except Exception as e:
                logger.warn(e)
        if any_5 is not None:
            try:
                list.append(any_5)
            except Exception as e:
                logger.warn(e)
        if any_6 is not None:
            try:
                list.append(any_6)
            except Exception as e:
                logger.warn(e)
        if any_7 is not None:
            try:
                list.append(any_7)
            except Exception as e:
                logger.warn(e)
        if any_8 is not None:
            try:
                list.append(any_8)
            except Exception as e:
                logger.warn(e)

        return [list]


class CListString:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
            },
            "optional": {
                "string_1": STRING,
                "string_2": STRING,
                "string_3": STRING,
                "string_4": STRING,
                "string_5": STRING,
                "string_6": STRING,
                "string_7": STRING,
                "string_8": STRING,
                "delimiter": ("STRING", {"default": " "}),
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.LIST.value
    RETURN_TYPES = ("STRING", CLASSES.CLIST_STRING_TYPE.value,)
    RETURN_NAMES = (TEXTS.CONCAT.value, KEYS.LIST.value)

    FUNCTION = "execute"

    def execute(self,
                string_1=None,
                string_2=None,
                string_3=None,
                string_4=None,
                string_5=None,
                string_6=None,
                string_7=None,
                string_8=None,
                delimiter=""):

        list = []

        if string_1 is not None:
            list.append(string_1)
        if string_2 is not None:
            list.append(string_2)
        if string_3 is not None:
            list.append(string_3)
        if string_4 is not None:
            list.append(string_4)
        if string_5 is not None:
            list.append(string_5)
        if string_6 is not None:
            list.append(string_6)
        if string_7 is not None:
            list.append(string_7)
        if string_8 is not None:
            list.append(string_8)

        return delimiter.join(list), list
