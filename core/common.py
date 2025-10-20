import os
import json
import torch
from ..core import CONFIG, logger

# Try to import DeepDiff, but handle illegal instruction errors
DeepDiff = None
try:
    from deepdiff import DeepDiff
except (ImportError, OSError) as e:
    logger.warning(f'deepdiff could not be loaded: {e}. JSON comparison will use fallback implementation.')
except Exception as e:
    # Catch illegal instruction and other runtime errors
    logger.warning(f'deepdiff failed to load (possibly illegal instruction): {e}. JSON comparison will use fallback implementation.')


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


def _simple_json_diff(obj1, obj2, path="root"):
    """
    Simple fallback JSON diff implementation when DeepDiff is not available.
    Returns a dictionary with added, removed, and changed items.
    """
    result = {
        'dictionary_item_added': [],
        'dictionary_item_removed': [],
        'values_changed': {}
    }
    
    if type(obj1) != type(obj2):
        result['values_changed'][path] = {'new_value': obj2, 'old_value': obj1}
        return result
    
    if isinstance(obj1, dict):
        keys1 = set(obj1.keys())
        keys2 = set(obj2.keys())
        
        # Added keys
        for key in keys2 - keys1:
            result['dictionary_item_added'].append(f"{path}['{key}']")
        
        # Removed keys
        for key in keys1 - keys2:
            result['dictionary_item_removed'].append(f"{path}['{key}']")
        
        # Changed values
        for key in keys1 & keys2:
            new_path = f"{path}['{key}']"
            sub_diff = _simple_json_diff(obj1[key], obj2[key], new_path)
            result['dictionary_item_added'].extend(sub_diff['dictionary_item_added'])
            result['dictionary_item_removed'].extend(sub_diff['dictionary_item_removed'])
            result['values_changed'].update(sub_diff['values_changed'])
    
    elif isinstance(obj1, list):
        if obj1 != obj2:
            result['values_changed'][path] = {'new_value': obj2, 'old_value': obj1}
    
    else:
        if obj1 != obj2:
            result['values_changed'][path] = {'new_value': obj2, 'old_value': obj1}
    
    # Clean up empty entries
    result = {k: v for k, v in result.items() if v}
    return result


def findJsonsDiff(json1, json2):
    msgError = "Could not compare jsons"
    returnJson = {"error": msgError}

    try:
        if DeepDiff is not None:
            # Use DeepDiff if available
            diff = DeepDiff(json1, json2, ignore_order=True, verbose_level=2)
            returnJson = {k: v for k, v in diff.items() if
                       k in ('dictionary_item_added', 'dictionary_item_removed', 'values_changed')}
        else:
            # Use simple fallback implementation
            returnJson = _simple_json_diff(json1, json2)

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
