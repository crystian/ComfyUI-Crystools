import json
import re
from ..core import CATEGORY, CONFIG, METADATA_RAW, TEXTS, findJsonsDiff, logger


class CMetadataExtractor:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "metadata_raw": METADATA_RAW,
            },
            "optional": {
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.METADATA.value
    RETURN_TYPES = ("JSON", "JSON", "JSON", "JSON", "STRING", "STRING")
    RETURN_NAMES = ("prompt", "workflow", "file info", "raw to JSON", "raw to property", "raw to csv")
    # OUTPUT_NODE = True

    FUNCTION = "execute"

    def execute(self, metadata_raw=None):
        prompt = {}
        workflow = {}
        fileinfo = {}
        text = ""
        csv = ""

        if metadata_raw is not None and isinstance(metadata_raw, dict):
            try:
                for key, value in metadata_raw.items():

                    if isinstance(value, dict):
                        # yes, double json.dumps is needed for jsons
                        value = json.dumps(json.dumps(value))
                    else:
                        value = json.dumps(value)

                    text += f"\"{key}\"={value}\n"
                    # remove spaces
                    # value = re.sub(' +', ' ', value)
                    value = re.sub('\n', ' ', value)
                    csv += f'"{key}"\t{value}\n'

                if csv != "":
                    csv = '"key"\t"value"\n' + csv

            except Exception as e:
                logger.warn(e)

            try:
                if "prompt" in metadata_raw:
                    prompt = metadata_raw["prompt"]
                else:
                    raise Exception("Prompt not found in metadata_raw")
            except Exception as e:
                logger.warn(e)

            try:
                if "workflow" in metadata_raw:
                    workflow = metadata_raw["workflow"]
                else:
                    raise Exception("Workflow not found in metadata_raw")
            except Exception as e:
                logger.warn(e)

            try:
                if "fileinfo" in metadata_raw:
                    fileinfo = metadata_raw["fileinfo"]
                else:
                    raise Exception("Fileinfo not found in metadata_raw")
            except Exception as e:
                logger.warn(e)

        elif metadata_raw is None:
            logger.debug("metadata_raw is None")
        else:
            logger.warn(TEXTS.INVALID_METADATA_MSG.value)

        return (json.dumps(prompt, indent=CONFIG["indent"]),
                json.dumps(workflow, indent=CONFIG["indent"]),
                json.dumps(fileinfo, indent=CONFIG["indent"]),
                json.dumps(metadata_raw, indent=CONFIG["indent"]),
                text, csv)


class CMetadataCompare:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "metadata_raw_old": METADATA_RAW,
                "metadata_raw_new": METADATA_RAW,
                "what": (["Prompt", "Workflow", "Fileinfo"],),
            },
            "optional": {
            }
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.METADATA.value
    RETURN_TYPES = ("JSON",)
    RETURN_NAMES = ("diff",)
    OUTPUT_NODE = True

    FUNCTION = "execute"

    def execute(self, what, metadata_raw_old=None, metadata_raw_new=None):
        prompt_old = {}
        workflow_old = {}
        fileinfo_old = {}
        prompt_new = {}
        workflow_new = {}
        fileinfo_new = {}
        diff = ""

        if type(metadata_raw_old) == dict and type(metadata_raw_new) == dict:

            if "prompt" in metadata_raw_old:
                prompt_old = metadata_raw_old["prompt"]
            else:
                logger.warn("Prompt not found in metadata_raw_old")

            if "workflow" in metadata_raw_old:
                workflow_old = metadata_raw_old["workflow"]
            else:
                logger.warn("Workflow not found in metadata_raw_old")

            if "fileinfo" in metadata_raw_old:
                fileinfo_old = metadata_raw_old["fileinfo"]
            else:
                logger.warn("Fileinfo not found in metadata_raw_old")

            if "prompt" in metadata_raw_new:
                prompt_new = metadata_raw_new["prompt"]
            else:
                logger.warn("Prompt not found in metadata_raw_new")

            if "workflow" in metadata_raw_new:
                workflow_new = metadata_raw_new["workflow"]
            else:
                logger.warn("Workflow not found in metadata_raw_new")

            if "fileinfo" in metadata_raw_new:
                fileinfo_new = metadata_raw_new["fileinfo"]
            else:
                logger.warn("Fileinfo not found in metadata_raw_new")

            if what == "Prompt":
                diff = findJsonsDiff(prompt_old, prompt_new)
            elif what == "Workflow":
                diff = findJsonsDiff(workflow_old, workflow_new)
            else:
                diff = findJsonsDiff(fileinfo_old, fileinfo_new)

            diff = json.dumps(diff, indent=CONFIG["indent"])

        else:
            invalid_msg = TEXTS.INVALID_METADATA_MSG.value
            logger.warn(invalid_msg)
            diff = invalid_msg

        return {"ui": {"text": [diff]}, "result": (diff,)}
