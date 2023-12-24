import os
import datetime
import random
import sys
import json
import folder_paths
import hashlib
import torch
import numpy as np
from pathlib import Path
from PIL import Image, ImageOps
from PIL.PngImagePlugin import PngImageFile
from nodes import PreviewImage

from ..core import CATEGORY, CONFIG, METADATA_RAW,TEXTS, setWidgetValues, logger, getResolutionByTensor, get_size

sys.path.insert(0, os.path.join(os.path.dirname(os.path.realpath(__file__)), "comfy"))


class CImagePreviewAdvance(PreviewImage):
    def __init__(self):
        # self.output_dir = folder_paths.get_temp_directory()
        # self.type = "temp"
        # self.prefix_append = "_temp_" + ''.join(random.choice("abcdefghijklmnopqrstupvxyz") for x in range(5))
        # self.compress_level = 1
        self.data_cached = None
        # self.old_data = None
        # self.old_text = None

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                # if it is required, in next node does not receive any value even the cache!
            },
            "optional": {
                "image": ("IMAGE",),
                "metadata_raw": METADATA_RAW,
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

    def preview(self, image=None, metadata_raw=None, prompt=None, extra_pnginfo=None):
        result = []
        text = ""
        images = []
        data = {
            "result": [],
            "ui": {
                "text": [],
                "images": [],
            }
        }
        # TODO Refactor with unit tests
        if metadata_raw is not None:
            text += "Source: Metadata RAW\n"
            text += json.dumps(metadata_raw, indent=CONFIG["indent"])

            images = self.resolveImage(metadata_raw["fileinfo"]["filename"])
            result = metadata_raw

        elif self.data_cached is not None:
            text += "Source: Metadata RAW - CACHED\n"
            text += json.dumps(self.data_cached, indent=CONFIG["indent"])

            images = self.resolveImage(self.data_cached["fileinfo"]["filename"])
            result = self.data_cached
        else:
            text += "Source: Empty"

        data["result"] = [result]
        data["ui"]["text"] = [text]
        data["ui"]["images"] = images

        self.data_cached = metadata_raw

        return data

        # source = ""
        # saved["ui"]["text"] = [source + text + json.dumps(prompt, indent=CONFIG["indent"])]
        # saved["result"] = [metadataFromPng]

        # if image is None and self.old_data is None:
        #     text = "No image linked"
        #     return {"ui": {"text": [text]}, "result": [None]}
        #
        # if image is None and self.old_data is not None:
        #     prompt_to_return = self.old_data["prompt"]
        #
        #     source = f"Source: Cache\n"
        #     return {"ui": {"text": [source + self.old_text + json.dumps(json.loads(prompt_to_return), indent=CONFIG["indent"])]}, "result": [self.old_data]}

        # saved = self.save_images(image, "crystools", prompt, extra_pnginfo)
        # filename = saved["ui"]["images"][0]["filename"]
        # image_path = os.path.join(self.output_dir, filename)
        # img = Image.open(image_path)
        # time = os.path.getmtime(image_path)
        # time_human = datetime.datetime.fromtimestamp(time)
        # text += f"File: {image_path}\n"
        # text += f"Resolution: {img.width}x{img.height}\n"
        # text += f"Date: {time_human}\n"
        # text += f"Size: {get_size(image_path)}\n"
        # text += f"Current prompt (NO FROM IMAGE!):\n"

        # metadataFromPng = {}
        #
        # if isinstance(img, PngImageFile):
        #     metadataFromPng = img.info
        #
        # source = f"Source: {source}\n"
        # saved["ui"]["text"] = [source + text + json.dumps(prompt, indent=CONFIG["indent"])]
        # saved["result"] = [metadataFromPng]
        #
        # self.old_data = metadataFromPng
        # self.old_text = text

    def resolveImage(self, filename=None):
        images = []

        if filename is not None:
            image_input_folder = os.path.normpath(folder_paths.get_input_directory())
            image_input_folder_abs = Path(image_input_folder).resolve()

            image_path = os.path.normpath(filename)
            image_path_abs = Path(image_path).resolve()

            if Path(image_path_abs).is_file() is False:
                raise Exception(TEXTS.FILE_NOT_FOUND.value)

            try:
                # get common path, should be input/output/temp folder
                common = os.path.commonpath([image_input_folder_abs, image_path_abs])

                if common != image_input_folder:
                    raise Exception("Path invalid (input)")

                relative = os.path.normpath(os.path.relpath(image_path_abs, image_input_folder_abs))

                images.append({
                    "filename": Path(relative).name,
                    "subfolder": os.path.dirname(relative),
                    "type": "input"
                })

            except Exception as e:
                logger.warn(e)

        return images


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
    RETURN_NAMES = ("image", "mask", "prompt", "Metadata RAW (optional)")
    OUTPUT_NODE = True

    FUNCTION = "execute"

    def execute(self, image):
        image_path = folder_paths.get_annotated_filepath(image)
        if Path(image_path).is_file() is False:
            raise Exception(TEXTS.FILE_NOT_FOUND.value)

        img = Image.open(image_path)

        metadata = {}
        prompt = {}

        metadata["fileinfo"] = {
            "filename": Path(image_path).as_posix(),
            "resolution": {
                "x": img.width,
                "y": img.height,
            },
            "resolution_text": f"{img.width}x{img.height}",
            "date": str(datetime.datetime.fromtimestamp(os.path.getmtime(image_path))),
            "size": str(get_size(image_path)),
        }

        # only for png files
        if isinstance(img, PngImageFile):
            metadataFromImg = img.info

            # for all metadataFromImg convert to string (but not for workflow and prompt!)
            for k, v in metadataFromImg.items():
                # from ComfyUI
                if k == "workflow":
                    try:
                        metadata["workflow"] = json.loads(metadataFromImg["workflow"])
                    except Exception as e:
                        logger.warn(f"Error parsing metadataFromImg 'workflow': {e}")

                # from ComfyUI
                elif k == "prompt":
                    try:
                        metadata["prompt"] = json.loads(metadataFromImg["prompt"])

                        # extract prompt from metadataFromImg
                        prompt = json.dumps(metadataFromImg["prompt"], indent=CONFIG["indent"])
                    except Exception as e:
                        logger.warn(f"Error parsing metadataFromImg 'prompt': {e}")

                else:
                    metadata[str(k)] = str(v)

        img = ImageOps.exif_transpose(img)
        image = img.convert("RGB")
        image = np.array(image).astype(np.float32) / 255.0
        image = torch.from_numpy(image)[None,]
        if 'A' in img.getbands():
            mask = np.array(img.getchannel('A')).astype(np.float32) / 255.0
            mask = 1. - torch.from_numpy(mask)
        else:
            mask = torch.zeros((64, 64), dtype=torch.float32, device="cpu")

        return image, mask.unsqueeze(0), prompt, metadata

    @classmethod
    def IS_CHANGED(cls, image):
        image_path = folder_paths.get_annotated_filepath(image)
        m = hashlib.sha256()
        with open(image_path, 'rb') as f:
            m.update(f.read())
        return m.digest().hex()

    @classmethod
    def VALIDATE_INPUTS(cls, image):
        if not folder_paths.exists_annotated_filepath(image):
            return "Invalid image file: {}".format(image)

        return True
