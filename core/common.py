import os
import json
import torch
from deepdiff import DeepDiff
from ..core import CONFIG, logger


# just a helper function to set the widget values (or clear them)
def setWidgetValues(value=None, unique_id=None, extra_pnginfo=None) -> None:
    if unique_id and extra_pnginfo:
        workflow = extra_pnginfo["workflow"]
        node = next((x for x in workflow["nodes"] if str(x["id"]) == unique_id), None)

        if node:
            node["widgets_values"] = value

    return None


# find difference between two jsons
def findJsonStrDiff(json1, json2):
    msgError = "Could not compare jsons"
    returnJson = {"error": msgError}
    try:
        # TODO review this
        # dict1 = json.loads(json1)
        # dict2 = json.loads(json2)

        returnJson = findJsonsDiff(json1, json2)

        returnJson = json.dumps(returnJson, indent=CONFIG["indent"])
    except Exception as e:
        logger.warn(f"{msgError}: {e}")

    return returnJson


def findJsonsDiff(json1, json2):
    msgError = "Could not compare jsons"
    returnJson = {"error": msgError}

    try:
        diff = DeepDiff(json1, json2, ignore_order=True, verbose_level=2)

        returnJson = {k: v for k, v in diff.items() if
                   k in ('dictionary_item_added', 'dictionary_item_removed', 'values_changed')}

        # just for print "values_changed" at first
        returnJson = dict(reversed(returnJson.items()))

    except Exception as e:
        logger.warn(f"{msgError}: {e}")

    return returnJson


# powered by:
# https://github.com/WASasquatch/was-node-suite-comfyui/blob/main/WAS_Node_Suite.py
# class: WAS_Samples_Passthrough_Stat_System
def get_system_stats():
    import psutil

    # RAM
    ram = psutil.virtual_memory()
    ram_used = ram.used / (1024 ** 3)
    ram_total = ram.total / (1024 ** 3)
    ram_stats = f"Used RAM: {ram_used:.2f} GB / Total RAM: {ram_total:.2f} GB"

    # VRAM (with PyTorch)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    vram_used = torch.cuda.memory_allocated(device) / (1024 ** 3)
    vram_total = torch.cuda.get_device_properties(device).total_memory / (1024 ** 3)
    vram_stats = f"Used VRAM: {vram_used:.2f} GB / Total VRAM: {vram_total:.2f} GB"

    # Hard Drive Space
    hard_drive = psutil.disk_usage("/")
    used_space = hard_drive.used / (1024 ** 3)
    total_space = hard_drive.total / (1024 ** 3)
    hard_drive_stats = f"Used Space: {used_space:.2f} GB / Total Space: {total_space:.2f} GB"

    return [ram_stats, vram_stats, hard_drive_stats]


# return x and y resolution of an image (torch tensor)
def getResolutionByTensor(image=None) -> dict:
    res = {"x": 0, "y": 0}

    if image is not None:
        img = image.movedim(-1, 1)

        res["x"] = img.shape[3]
        res["y"] = img.shape[2]

    return res


# by https://stackoverflow.com/questions/6080477/how-to-get-the-size-of-tar-gz-in-mb-file-in-python
def get_size(path):
    size = os.path.getsize(path)
    if size < 1024:
        return f"{size} bytes"
    elif size < pow(1024, 2):
        return f"{round(size / 1024, 2)} KB"
    elif size < pow(1024, 3):
        return f"{round(size / (pow(1024, 2)), 2)} MB"
    elif size < pow(1024, 4):
        return f"{round(size / (pow(1024, 3)), 2)} GB"


def get_nested_value(data, dotted_key, default=None):
  keys = dotted_key.split('.')
  for key in keys:
    if isinstance(data, str):
        data = json.loads(data)
    if isinstance(data, dict) and key in data:
      data = data[key]
    else:
      return default
  return data
