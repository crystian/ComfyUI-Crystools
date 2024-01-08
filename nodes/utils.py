from ..core import CATEGORY, JSON_WIDGET, findJsonStrDiff, get_system_stats, logger


class CUtilsCompareJsons:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "json_old": JSON_WIDGET,
                "json_new": JSON_WIDGET,
            },
            "optional": {

            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.UTILS.value
    RETURN_TYPES = ("JSON",)
    RETURN_NAMES = ("json_compared",)
    OUTPUT_NODE = True

    FUNCTION = "execute"

    def execute(self, json_old, json_new):
        json = findJsonStrDiff(json_old, json_new)
        return (str(json),)


# Credits to: https://github.com/WASasquatch/was-node-suite-comfyui for the following node!
class CUtilsStatSystem:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "latent": ("LATENT",),
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.UTILS.value
    RETURN_TYPES = ("LATENT",)
    RETURN_NAMES = ("latent",)

    FUNCTION = "execute"

    def execute(self, latent):
        log = "Samples Passthrough:\n"
        for stat in get_system_stats():
            log += stat + "\n"

        logger.debug(log)

        return {"ui": {"text": [log]}, "result": (latent,)}
