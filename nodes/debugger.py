import json
from ..core import CONFIG, CATEGORY, BOOLEAN, BOOLEAN_FALSE, KEYS, TEXTS, STRING, logger, any

class CConsoleAny:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
            },
            "optional": {
                "any_value": (any,),
                "console": BOOLEAN_FALSE,
                "display": BOOLEAN,
                KEYS.PREFIX.value: STRING,
            },
            "hidden": {
                # "unique_id": "UNIQUE_ID",
                # "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.DEBUGGER.value
    INPUT_IS_LIST = True

    RETURN_TYPES = ()
    OUTPUT_NODE = True

    FUNCTION = "execute"

    def execute(self, any_value=None, console=False, display=True, prefix=None):
        console = console[0]
        display = display[0]
        prefix = prefix[0]
        text = ""
        textToDisplay = TEXTS.INACTIVE_MSG.value

        if any_value is not None:
            try:
                if type(any_value) == list:
                    for item in any_value:
                        try:
                            text += str(item)
                        except Exception as e:
                            text += "source exists, but could not be serialized.\n"
                            logger.warn(e)
                else:
                    logger.warn("any_value is not a list")

            except Exception:
                try:
                    text = json.dumps(any_value)[1:-1]
                except Exception:
                    text = 'source exists, but could not be serialized.'

        logger.debug(f"Show any to console is running...")

        if console:
            if prefix is not None and prefix != "":
                print(f"{prefix}: {text}")
            else:
                print(text)

        if display:
            textToDisplay = text

        value = [console, display, prefix, textToDisplay]
        # setWidgetValues(value, unique_id, extra_pnginfo)

        return {"ui": {"text": value}}


class CConsoleAnyToJson:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
            },
            "optional": {
                "any_value": (any,),
            },
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.DEBUGGER.value
    INPUT_IS_LIST = True

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("string",)
    OUTPUT_NODE = True

    FUNCTION = "execute"

    def execute(self, any_value=None):
        text = TEXTS.INACTIVE_MSG.value

        if any_value is not None and isinstance(any_value, list):
            item = any_value[0]

            if isinstance(item, dict):
                try:
                    text = json.dumps(item, indent=CONFIG["indent"])
                except Exception as e:
                    text = "The input is a dict, but could not be serialized.\n"
                    logger.warn(e)

            elif isinstance(item, list):
                try:
                    text = json.dumps(item, indent=CONFIG["indent"])
                except Exception as e:
                    text = "The input is a list, but could not be serialized.\n"
                    logger.warn(e)

            else:
                text = str(item)

        logger.debug(f"Show any-json to console is running...")

        return {"ui": {"text": [text]}, "result": (text,)}
