from ..core import CATEGORY, any
from ._names import CLASSES


class CPipeToAny:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
            "optional": {
                CLASSES.CPIPE_ANY_TYPE.value: (CLASSES.CPIPE_ANY_TYPE.value,),
                "any_1": (any,),
                "any_2": (any,),
                "any_3": (any,),
                "any_4": (any,),
                "any_5": (any,),
                "any_6": (any,),
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.PIPE.value
    RETURN_TYPES = (CLASSES.CPIPE_ANY_TYPE.value,)

    FUNCTION = "execute"

    def execute(self, CPipeAny=None, any_1=None, any_2=None, any_3=None, any_4=None, any_5=None, any_6=None):
        any_1_original = None
        any_2_original = None
        any_3_original = None
        any_4_original = None
        any_5_original = None
        any_6_original = None

        if CPipeAny != None:
            any_1_original, any_2_original, any_3_original, any_4_original, any_5_original, any_6_original = CPipeAny

        CAnyPipeMod = []

        CAnyPipeMod.append(any_1 if any_1 is not None else any_1_original)
        CAnyPipeMod.append(any_2 if any_2 is not None else any_2_original)
        CAnyPipeMod.append(any_3 if any_3 is not None else any_3_original)
        CAnyPipeMod.append(any_4 if any_4 is not None else any_4_original)
        CAnyPipeMod.append(any_5 if any_5 is not None else any_5_original)
        CAnyPipeMod.append(any_6 if any_6 is not None else any_6_original)

        return (CAnyPipeMod,)


class CPipeFromAny:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                CLASSES.CPIPE_ANY_TYPE.value: (CLASSES.CPIPE_ANY_TYPE.value,),
            },
            "optional": {
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.PIPE.value
    RETURN_TYPES = (CLASSES.CPIPE_ANY_TYPE.value, any, any, any, any, any, any,)
    RETURN_NAMES = (CLASSES.CPIPE_ANY_TYPE.value, "any_1", "any_2", "any_3", "any_4", "any_5", "any_6",)

    FUNCTION = "execute"

    def execute(self, CPipeAny=None, ):
        any_1, any_2, any_3, any_4, any_5, any_6 = CPipeAny
        return CPipeAny, any_1, any_2, any_3, any_4, any_5, any_6
