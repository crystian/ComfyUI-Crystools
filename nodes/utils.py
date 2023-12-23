import json
import re
from ..core import CATEGORY, CONFIG, JSON_WIDGET, TEXTS, findJsonStrDiff, findJsonsDiff, get_system_stats, logger


class CMetadataExtractor:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "metadata_raw": ("METADATA_RAW", {"forceInput": True}),
            },
            "optional": {
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.UTILS.value
    RETURN_TYPES = ("JSON", "JSON", "STRING", "STRING")
    RETURN_NAMES = ("prompt", "workflow", "raw to string", "raw to csv")
    OUTPUT_NODE = True

    FUNCTION = "execute"

    def execute(self, metadata_raw):
        prompt = {}
        workflow = {}
        csv = '"key"\t"value"\n'
        text = ""

        if type(metadata_raw) == dict:

            try:
                for key, value in metadata_raw.items():
                    value = json.dumps(value)
                    text += f"{key}: {value}\n"
                    # remove spaces
                    # value = re.sub(' +', ' ', value)
                    value = re.sub('\n', ' ', value)
                    csv += f'"{key}"\t{value}\n'

            except Exception as e:
                logger.warn(e)

            try:
                if "prompt" in metadata_raw:
                    prompt = json.loads(metadata_raw["prompt"])
                else:
                    raise Exception("Prompt not found in metadata_raw")
            except Exception as e:
                logger.warn(e)

            try:
                if "workflow" in metadata_raw:
                    workflow = json.loads(metadata_raw["workflow"])
                else:
                    raise Exception("Workflow not found in metadata_raw")
            except Exception as e:
                logger.warn(e)

        else:
            logger.warn("Invalid metadata raw on formatted")

        return json.dumps(prompt, indent=CONFIG["indent"]), json.dumps(workflow, indent=CONFIG["indent"]), text, csv


class CMetadataCompare:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "metadata_raw_old": ("METADATA_RAW", {"forceInput": True}),
                "metadata_raw_new": ("METADATA_RAW", {"forceInput": True}),
                "what": (["Prompt", "Workflow"],),
            },
            "optional": {
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.UTILS.value
    RETURN_TYPES = ("JSON",)
    RETURN_NAMES = ("diff",)
    OUTPUT_NODE = True

    FUNCTION = "execute"

    def execute(self, what, metadata_raw_old=None, metadata_raw_new=None):
        prompt_old = {}
        workflow_old = {}
        prompt_new = {}
        workflow_new = {}
        diff = ""

        if type(metadata_raw_old) == dict and type(metadata_raw_new) == dict:
            try:
                if "prompt" in metadata_raw_old:
                    prompt_old = json.loads(metadata_raw_old["prompt"])
                else:
                    raise Exception("Prompt not found in metadata_raw_old")
            except Exception as e:
                logger.warn(e)

            try:
                if "workflow" in metadata_raw_old:
                    workflow_old = json.loads(metadata_raw_old["workflow"])
                else:
                    raise Exception("Workflow not found in metadata_raw_old")
            except Exception as e:
                logger.warn(e)

            try:
                if "prompt" in metadata_raw_new:
                    prompt_new = json.loads(metadata_raw_new["prompt"])
                else:
                    raise Exception("Prompt not found in metadata_raw_new")
            except Exception as e:
                logger.warn(e)

            try:
                if "workflow" in metadata_raw_new:
                    workflow_new = json.loads(metadata_raw_new["workflow"])
                else:
                    raise Exception("Workflow not found in metadata_raw_new")
            except Exception as e:
                logger.warn(e)

            if what == "Prompt":
                diff = findJsonsDiff(prompt_old, prompt_new)
            else:
                diff = findJsonsDiff(workflow_old, workflow_new)

            diff = json.dumps(diff, indent=CONFIG["indent"])

        else:
            invalid_msg = TEXTS.INVALID_METADATA_MSG.value
            logger.warn(invalid_msg)
            diff = invalid_msg

        return {"ui": {"text": [diff]}, "result": (diff,)}


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

        logger.info(log)

        return {"ui": {"text": [log]}, "result": (latent,)}
