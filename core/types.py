import sys

FLOAT = ("FLOAT", {"default": 1,
                   "min": -sys.float_info.max,
                   "max": sys.float_info.max,
                   "step": 0.01})

BOOLEAN = ("BOOLEAN", {"default": True})
BOOLEAN_FALSE = ("BOOLEAN", {"default": False})

INT = ("INT", {"default": 1,
               "min": -sys.maxsize,
               "max": sys.maxsize,
               "step": 1})

STRING = ("STRING", {"default": ""})

STRING_ML = ("STRING", {"multiline": True, "default": ""})

STRING_WIDGET = ("STRING", {"forceInput": True})

JSON_WIDGET = ("JSON", {"forceInput": True})

METADATA_RAW = ("METADATA_RAW", {"forceInput": True})

class AnyType(str):
    """A special class that is always equal in not equal comparisons. Credit to pythongosssss"""

    def __eq__(self, _) -> bool:
        return True

    def __ne__(self, __value: object) -> bool:
        return False


any = AnyType("*")
