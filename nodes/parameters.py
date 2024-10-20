import json

from ..core import CONFIG, JSON_WIDGET, CATEGORY, STRING, logger, get_nested_value

class CParameter:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
            },
            "optional": {
              "path_to_json": STRING,
              "key": STRING,
              "default": STRING,
            },
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.UTILS.value
    INPUT_IS_LIST = False

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("value",)

    FUNCTION = "execute"

    def execute(self, path_to_json=None, key=True, default=None):
        text = default
        value = text

        if path_to_json is not None and path_to_json != "":
          logger.debug(f"External parameter from: '{path_to_json}'")
          try:
            with open(path_to_json, 'r') as file:
              data = json.load(file)
              logger.debug(f"File found, data: '{data}'")

              result = get_value(data, key, default)
              text = result["text"]
              value = result["value"]

          except Exception as e:
            logger.error(e)
            text = f"Error reading file: {e}\nReturning default value: '{default}'"
            value = default

        return {"ui": {"text": [text]}, "result": [value]}

class CJsonFile:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
            },
            "optional": {
              "path_to_json": STRING,
            },
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.UTILS.value
    INPUT_IS_LIST = False

    RETURN_TYPES = ("JSON",)
    RETURN_NAMES = ("json",)

    FUNCTION = "execute"

    def IS_CHANGED(cls, path_to_json=None):
        return True

    def execute(self, path_to_json=None):
        text = ""
        data = {}

        if path_to_json is not None and path_to_json != "":
          logger.debug(f"Open json file: '{path_to_json}'")
          try:
            with open(path_to_json, 'r') as file:
              data = json.load(file)
              text = json.dumps(data, indent=CONFIG["indent"])
              logger.debug(f"File found, data: '{str(data)}'")

          except Exception as e:
            logger.error(e)
            text = f"Error reading file: {e}"

        return {"ui": {"text": [text]}, "result": [data]}

class CJsonExtractor:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
              "json": JSON_WIDGET,
            },
            "optional": {
              "key": STRING,
              "default": STRING,
            },
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.UTILS.value
    INPUT_IS_LIST = False

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("value",)

    FUNCTION = "execute"

    def execute(self, json=None, key=True, default=None):
        result = get_value(json, key, default)
        return {"ui": {"text": [result["text"]]}, "result": [result["value"]]}

def get_value(data, key, default=None):
  text = ""
  val = ""

  if key is not None and key != "":
    val = get_nested_value(data, key, default)
    if default != val:
      text = f"Key found, return value: '{val}'"
    else:
      text = f"Key no found, return default value: '{val}'"
  else:
    text = f"Key is empty, return default value: '{val}'"

  return {
    "text": text,
    "value": val
  }
