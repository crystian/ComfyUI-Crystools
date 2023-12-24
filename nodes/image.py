import os
import datetime
import random
import sys
import json
import folder_paths
import hashlib
import torch
import numpy as np
from PIL import Image, ImageOps
from PIL.PngImagePlugin import PngImageFile
from nodes import PreviewImage

from ..core import CATEGORY, CONFIG, setWidgetValues, logger, getResolutionByTensor, get_size

sys.path.insert(0, os.path.join(os.path.dirname(os.path.realpath(__file__)), "comfy"))


class CImagePreviewAdvance(PreviewImage):
    def __init__(self):
        self.output_dir = folder_paths.get_temp_directory()
        self.type = "temp"
        self.prefix_append = "_temp_" + ''.join(random.choice("abcdefghijklmnopqrstupvxyz") for x in range(5))
        self.compress_level = 1
        self.old_data = None
        self.old_text = None

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                # if it is required, in next node does not receive any value even the cache!
            },
            "optional": {
                "image": ("IMAGE",),
            },
            "hidden": {
                "prompt": "PROMPT",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.IMAGE.value
    RETURN_TYPES = ("METADATA_RAW",)
    RETURN_NAMES = ("Metadata RAW",)
    OUTPUT_NODE = True

    FUNCTION = "preview"

    def preview(self, image=None, prompt=None, extra_pnginfo=None):
        text = ""
        source = "From image input"

        if image is None and self.old_data is None:
            text = "No image linked"
            return {"ui": {"text": [text]}, "result": [None]}

        if image is None and self.old_data is not None:
            prompt_to_return = self.old_data["prompt"]

            source = f"Source: Cache\n"
            return {"ui": {"text": [source + self.old_text + json.dumps(json.loads(prompt_to_return), indent=CONFIG["indent"])]}, "result": [self.old_data]}

        saved = self.save_images(image, "crystools", prompt, extra_pnginfo)
        filename = saved["ui"]["images"][0]["filename"]
        image_path = os.path.join(self.output_dir, filename)
        img = Image.open(image_path)
        time = os.path.getmtime(image_path)
        time_human = datetime.datetime.fromtimestamp(time)
        text += f"File: {image_path}\n"
        text += f"Resolution: {img.width}x{img.height}\n"
        text += f"Date: {time_human}\n"
        text += f"Size: {get_size(image_path)}\n"
        text += f"Current prompt (NO FROM IMAGE!):\n"

        metadataFromPng = {}

        if isinstance(img, PngImageFile):
            metadataFromPng = img.info

        source = f"Source: {source}\n"
        saved["ui"]["text"] = [source + text + json.dumps(prompt, indent=CONFIG["indent"])]
        saved["result"] = [metadataFromPng]

        self.old_data = metadataFromPng
        self.old_text = text
        return saved


class CImageShowResolution:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image": ("IMAGE",),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.IMAGE.value
    RETURN_TYPES = ()
    OUTPUT_NODE = True

    FUNCTION = "execute"

    def execute(self, image, extra_pnginfo=None, unique_id=None):
        res = getResolutionByTensor(image)
        text = [f"{res['x']}x{res['y']}"]
        setWidgetValues(text, unique_id, extra_pnginfo)
        logger.info(f"Resolution: {text}")
        return {"ui": {"text": text}}


# subfolders based on: https://github.com/catscandrive/comfyui-imagesubfolders
class CImageLoadWithMetadata:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        input_dir = folder_paths.get_input_directory()
        exclude_folders = ["clipspace"]
        file_list = []

        for root, dirs, files in os.walk(input_dir):
            # Exclude specific folders
            dirs[:] = [d for d in dirs if d not in exclude_folders]

            for file in files:
                relpath = os.path.relpath(os.path.join(root, file), start=input_dir)
                # fix for windows
                relpath = relpath.replace("\\", "/")
                file_list.append(relpath)

        return {
            "required": {
                "image": (sorted(file_list), {"image_upload": True})
            },
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.IMAGE.value
    RETURN_TYPES = ("IMAGE", "MASK", "JSON", "METADATA_RAW")
    RETURN_NAMES = ("image", "mask", "prompt", "Metadata RAW")
    OUTPUT_NODE = True

    FUNCTION = "execute"

    def execute(self, image):
        image_path = folder_paths.get_annotated_filepath(image)
        img = Image.open(image_path)

        metadataFromPng = {}
        prompt = ""

        if isinstance(img, PngImageFile):
            metadataFromPng = img.info

        img = ImageOps.exif_transpose(img)
        image = img.convert("RGB")
        image = np.array(image).astype(np.float32) / 255.0
        image = torch.from_numpy(image)[None,]
        if 'A' in img.getbands():
            mask = np.array(img.getchannel('A')).astype(np.float32) / 255.0
            mask = 1. - torch.from_numpy(mask)
        else:
            mask = torch.zeros((64, 64), dtype=torch.float32, device="cpu")

        if metadataFromPng is not None:
            if "prompt" in metadataFromPng:
                prompt = metadataFromPng["prompt"]
                prompt = json.dumps(json.loads(prompt), indent=CONFIG["indent"])

        return (image, mask.unsqueeze(0), prompt, metadataFromPng)

    @classmethod
    def IS_CHANGED(s, image):
        image_path = folder_paths.get_annotated_filepath(image)
        m = hashlib.sha256()
        with open(image_path, 'rb') as f:
            m.update(f.read())
        return m.digest().hex()

    @classmethod
    def VALIDATE_INPUTS(s, image):
        if not folder_paths.exists_annotated_filepath(image):
            return "Invalid image file: {}".format(image)

        return True
