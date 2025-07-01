from ..core import BOOLEAN, STRING, CATEGORY, any, logger


class CSwitchFromAny:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "any": (any, ),
                "boolean": BOOLEAN,
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.SWITCH.value
    RETURN_TYPES = (any, any,)
    RETURN_NAMES = ("on_true", "on_false",)

    FUNCTION = "execute"

    def execute(self, any,boolean=True):
        logger.debug("Any switch: " + str(boolean))

        if boolean:
            return any, None
        else:
            return None, any

class CSwitchBooleanAny:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "on_true": (any, {"lazy": True}),
                "on_false": (any, {"lazy": True}),
                "boolean": BOOLEAN,
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.SWITCH.value
    RETURN_TYPES = (any,)

    FUNCTION = "execute"

    def check_lazy_status(self, on_true=None, on_false=None, boolean=True):
        needed = "on_true" if boolean else "on_false"
        return [needed]

    def execute(self, on_true, on_false, boolean=True):
        logger.debug("Any switch: " + str(boolean))

        if boolean:
            return (on_true,)
        else:
            return (on_false,)


class CSwitchBooleanString:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "on_true": ("STRING", {"default": "", "lazy": True}),
                "on_false": ("STRING", {"default": "", "lazy": True}),
                "boolean": BOOLEAN,
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.SWITCH.value
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("string",)

    FUNCTION = "execute"

    def check_lazy_status(self, on_true=None, on_false=None, boolean=True):
        needed = "on_true" if boolean else "on_false"
        return [needed]

    def execute(self, on_true, on_false, boolean=True):
        logger.debug("String switch: " + str(boolean))

        if boolean:
            return (on_true,)
        else:
            return (on_false,)


class CSwitchBooleanConditioning:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "on_true": ("CONDITIONING", {"lazy": True}),
                "on_false": ("CONDITIONING", {"lazy": True}),
                "boolean": BOOLEAN,
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.SWITCH.value
    RETURN_TYPES = ("CONDITIONING",)
    RETURN_NAMES = ("conditioning",)

    FUNCTION = "execute"

    def check_lazy_status(self, on_true=None, on_false=None, boolean=True):
        needed = "on_true" if boolean else "on_false"
        return [needed]

    def execute(self, on_true, on_false, boolean=True):
        logger.debug("Conditioning switch: " + str(boolean))

        if boolean:
            return (on_true,)
        else:
            return (on_false,)


class CSwitchBooleanImage:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "on_true": ("IMAGE", {"lazy": True}),
                "on_false": ("IMAGE", {"lazy": True}),
                "boolean": BOOLEAN,
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.SWITCH.value
    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image",)

    FUNCTION = "execute"

    def check_lazy_status(self, on_true=None, on_false=None, boolean=True):
        needed = "on_true" if boolean else "on_false"
        return [needed]

    def execute(self, on_true, on_false, boolean=True):
        logger.debug("Image switch: " + str(boolean))

        if boolean:
            return (on_true,)
        else:
            return (on_false,)


class CSwitchBooleanLatent:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "on_true": ("LATENT", {"lazy": True}),
                "on_false": ("LATENT", {"lazy": True}),
                "boolean": BOOLEAN,
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.SWITCH.value
    RETURN_TYPES = ("LATENT",)
    RETURN_NAMES = ("latent",)

    FUNCTION = "execute"

    def check_lazy_status(self, on_true=None, on_false=None, boolean=True):
        needed = "on_true" if boolean else "on_false"
        return [needed]

    def execute(self, on_true, on_false, boolean=True):
        logger.debug("Latent switch: " + str(boolean))

        if boolean:
            return (on_true,)
        else:
            return (on_false,)


class CSwitchBooleanMask:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "on_true": ("MASK", {"lazy": True}),
                "on_false": ("MASK", {"lazy": True}),
                "boolean": BOOLEAN,
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.SWITCH.value
    RETURN_TYPES = ("MASK",)
    RETURN_NAMES = ("mask",)

    FUNCTION = "execute"

    def check_lazy_status(self, on_true=None, on_false=None, boolean=True):
        needed = "on_true" if boolean else "on_false"
        return [needed]

    def execute(self, on_true, on_false, boolean=True):
        logger.debug("Mask switch: " + str(boolean))

        if boolean:
            return (on_true,)
        else:
            return (on_false,)
