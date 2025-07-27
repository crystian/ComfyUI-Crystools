import fnmatch
import os
import random
import sys
import json
import piexif
import hashlib
from datetime import datetime
import torch
import numpy as np
from pathlib import Path
from PIL import Image, ImageOps
from PIL.ExifTags import TAGS, GPSTAGS, IFD
from PIL.PngImagePlugin import PngImageFile
from PIL.JpegImagePlugin import JpegImageFile
from nodes import PreviewImage, SaveImage
import folder_paths

from ..core import CATEGORY, CONFIG, BOOLEAN, METADATA_RAW,TEXTS, setWidgetValues, logger, getResolutionByTensor, get_size

sys.path.insert(0, os.path.join(os.path.dirname(os.path.realpath(__file__)), "comfy"))


class CImagePreviewFromImage(PreviewImage):
    def __init__(self):
        self.output_dir = folder_paths.get_temp_directory()
        self.type = "temp"
        self.prefix_append = "_" + ''.join(random.choice("abcdefghijklmnopqrstupvxyz") for x in range(5))
        self.compress_level = 1
        self.data_cached = None
        self.data_cached_text = None

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

    FUNCTION = "execute"

    def execute(self, image=None, prompt=None, extra_pnginfo=None):
        text = ""
        title = ""
        data = {
            "result": [''],
            "ui": {
                "text": [''],
                "images": [],
            }
        }

        if image is not None:
            saved = self.save_images(image, "crystools/i", prompt, extra_pnginfo)
            image = saved["ui"]["images"][0]
            image_path = Path(self.output_dir).joinpath(image["subfolder"], image["filename"])

            img, promptFromImage, metadata = buildMetadata(image_path)

            images = [image]
            result = metadata

            data["result"] = [result]
            data["ui"]["images"] = images

            title = "Source: Image link \n"
            text += buildPreviewText(metadata)
            text += f"Current prompt (NO FROM IMAGE!):\n"
            text += json.dumps(promptFromImage, indent=CONFIG["indent"])

            self.data_cached_text = text
            self.data_cached = data

        elif image is None and self.data_cached is not None:
            title = "Source: Image link - CACHED\n"
            data = self.data_cached
            text = self.data_cached_text

        else:
            logger.debug("Source: Empty on CImagePreviewFromImage")
            text = "Source: Empty"

        data['ui']['text'] = [title + text]
        return data


class CImagePreviewFromMetadata(PreviewImage):
    def __init__(self):
        self.data_cached = None
        self.data_cached_text = None

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                # if it is required, in next node does not receive any value even the cache!
            },
            "optional": {
                "metadata_raw": METADATA_RAW,
            },
        }

    CATEGORY = CATEGORY.MAIN.value + CATEGORY.IMAGE.value
    RETURN_TYPES = ("METADATA_RAW",)
    RETURN_NAMES = ("Metadata RAW",)
    OUTPUT_NODE = True

    FUNCTION = "execute"

    def execute(self, metadata_raw=None):
        text = ""
        title = ""
        data = {
            "result": [''],
            "ui": {
                "text": [''],
                "images": [],
            }
        }

        if metadata_raw is not None and metadata_raw != '':
            promptFromImage = {}
            if "prompt" in metadata_raw:
              promptFromImage = metadata_raw["prompt"]

            title = "Source: Metadata RAW\n"
            text += buildPreviewText(metadata_raw)
            text += f"Prompt from image:\n"
            text += json.dumps(promptFromImage, indent=CONFIG["indent"])

            images = self.resolveImage(metadata_raw["fileinfo"]["filename"])
            result = metadata_raw

            data["result"] = [result]
            data["ui"]["images"] = images

            self.data_cached_text = text
            self.data_cached = data

        elif metadata_raw is None and self.data_cached is not None:
            title = "Source: Metadata RAW - CACHED\n"
            data = self.data_cached
            text = self.data_cached_text

        else:
            logger.debug("Source: Empty on CImagePreviewFromMetadata")
            text = "Source: Empty"

        data["ui"]["text"] = [title + text]
        return data

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
                    raise Exception("Path invalid (should be in the input folder)")

                relative = os.path.normpath(os.path.relpath(image_path_abs, image_input_folder_abs))

                images.append({
                    "filename": Path(relative).name,
                    "subfolder": os.path.dirname(relative),
                    "type": "input"
                })

            except Exception as e:
                logger.warn(e)

        return images


class CImageGetResolution:
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
    RETURN_TYPES = ("INT", "INT",)
    RETURN_NAMES = ("width", "height",)
    OUTPUT_NODE = True

    FUNCTION = "execute"

    def execute(self, image, extra_pnginfo=None, unique_id=None):
        res = getResolutionByTensor(image)
        text = [f"{res['x']}x{res['y']}"]
        setWidgetValues(text, unique_id, extra_pnginfo)
        logger.debug(f"Resolution: {text}")
        return {"ui": {"text": text}, "result": (res["x"], res["y"])}


# subfolders based on: https://github.com/catscandrive/comfyui-imagesubfolders
class CImageLoadWithMetadata:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        input_dir = folder_paths.get_input_directory()

        exclude_files = {"Thumbs.db", "*.DS_Store", "desktop.ini", "*.lock" }
        exclude_folders = {"clipspace", ".*"}

        file_list = []

        for root, dirs, files in os.walk(input_dir, followlinks=True):
            # Exclude specific folders
            dirs[:] = [d for d in dirs if not any(fnmatch.fnmatch(d, exclude) for exclude in exclude_folders)]
            files = [f for f in files if not any(fnmatch.fnmatch(f, exclude) for exclude in exclude_files)]


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

        imgF = Image.open(image_path)
        img, prompt, metadata = buildMetadata(image_path)
        if imgF.format == 'WEBP':
            # Use piexif to extract EXIF data from WebP image
            try:
              exif_data = piexif.load(image_path)
              prompt, metadata = self.process_exif_data(exif_data)
            except ValueError:
              prompt = {}

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

    def process_exif_data(self, exif_data):
        metadata = {}
        # 检查 '0th' 键下的 271 值，提取 Prompt 信息
        if '0th' in exif_data and 271 in exif_data['0th']:
            prompt_data = exif_data['0th'][271].decode('utf-8')
            # 移除可能的前缀 'Prompt:'
            prompt_data = prompt_data.replace('Prompt:', '', 1)
            # 假设 prompt_data 是一个字符串，尝试将其转换为 JSON 对象
            try:
                metadata['prompt'] = json.loads(prompt_data)
            except json.JSONDecodeError:
                metadata['prompt'] = prompt_data

        # 检查 '0th' 键下的 270 值，提取 Workflow 信息
        if '0th' in exif_data and 270 in exif_data['0th']:
            workflow_data = exif_data['0th'][270].decode('utf-8')
            # 移除可能的前缀 'Workflow:'
            workflow_data = workflow_data.replace('Workflow:', '', 1)
            try:
                # 尝试将字节字符串转换为 JSON 对象
                metadata['workflow'] = json.loads(workflow_data)
            except json.JSONDecodeError:
                # 如果转换失败，则将原始字符串存储在 metadata 中
                metadata['workflow'] = workflow_data

        metadata.update(exif_data)
        return metadata

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


class CImageSaveWithExtraMetadata(SaveImage):
    def __init__(self):
        super().__init__()
        self.data_cached = None
        self.data_cached_text = None

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                # if it is required, in next node does not receive any value even the cache!
                "image": ("IMAGE",),
                "filename_prefix": ("STRING", {"default": "ComfyUI"}),
                "with_workflow": BOOLEAN,
            },
            "optional": {
                "metadata_extra": ("STRING", {"multiline": True, "default": json.dumps({
                  "Title": "Image generated by Crystian",
                  "Description": "More info: https:\/\/www.instagram.com\/crystian.ia",
                  "Author": "crystian.ia",
                  "Software": "ComfyUI",
                  "Category": "StableDiffusion",
                  "Rating": 5,
                  "UserComment": "",
                  "Keywords": [
                    ""
                  ],
                  "Copyrights": "",
                }, indent=CONFIG["indent"]).replace("\\/", "/"),
                }),
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

    FUNCTION = "execute"

    def execute(self, image=None, filename_prefix="ComfyUI", with_workflow=True, metadata_extra=None, prompt=None, extra_pnginfo=None):
        data = {
            "result": [''],
            "ui": {
                "text": [''],
                "images": [],
            }
        }
        if image is not None:
            if with_workflow is True:
                extra_pnginfo_new = extra_pnginfo.copy()
                prompt = prompt.copy()
            else:
                extra_pnginfo_new = None
                prompt = None

            if metadata_extra is not None and metadata_extra != 'undefined':
                try:
                    # metadata_extra = json.loads(f"{{{metadata_extra}}}") // a fix?
                    metadata_extra = json.loads(metadata_extra)
                except Exception as e:
                    logger.error(f"Error parsing metadata_extra (it will send as string), error: {e}")
                    metadata_extra = {"extra": str(metadata_extra)}

                if isinstance(metadata_extra, dict):
                    for k, v in metadata_extra.items():
                        if extra_pnginfo_new is None:
                            extra_pnginfo_new = {}

                        extra_pnginfo_new[k] = v

            saved = super().save_images(image, filename_prefix, prompt, extra_pnginfo_new)

            image = saved["ui"]["images"][0]
            image_path = Path(self.output_dir).joinpath(image["subfolder"], image["filename"])
            img, promptFromImage, metadata = buildMetadata(image_path)

            images = [image]
            result = metadata

            data["result"] = [result]
            data["ui"]["images"] = images

        else:
            logger.debug("Source: Empty on CImageSaveWithExtraMetadata")

        return data



def buildMetadata(image_path):
    if Path(image_path).is_file() is False:
        raise Exception(TEXTS.FILE_NOT_FOUND.value)

    img = Image.open(image_path)

    metadata = {}
    prompt = {}

    metadata["fileinfo"] = {
        "filename": Path(image_path).as_posix(),
        "resolution": f"{img.width}x{img.height}",
        "date": str(datetime.fromtimestamp(os.path.getmtime(image_path))),
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

                    # extract prompt to use on metadataFromImg
                    prompt = metadata["prompt"]
                except Exception as e:
                    logger.warn(f"Error parsing metadataFromImg 'prompt': {e}")

            else:
                try:
                    # for all possible metadataFromImg by user
                    metadata[str(k)] = json.loads(v)
                except Exception as e:
                    logger.debug(f"Error parsing {k} as json, trying as string: {e}")
                    try:
                        metadata[str(k)] = str(v)
                    except Exception as e:
                        logger.debug(f"Error parsing {k} it will be skipped: {e}")

    if isinstance(img, JpegImageFile):
        exif = img.getexif()

        for k, v in exif.items():
            tag = TAGS.get(k, k)
            if v is not None:
                metadata[str(tag)] = str(v)

        for ifd_id in IFD:
            try:
                if ifd_id == IFD.GPSInfo:
                    resolve = GPSTAGS
                else:
                    resolve = TAGS

                ifd = exif.get_ifd(ifd_id)
                ifd_name = str(ifd_id.name)
                metadata[ifd_name] = {}

                for k, v in ifd.items():
                    tag = resolve.get(k, k)
                    metadata[ifd_name][str(tag)] = str(v)

            except KeyError:
                pass


    return img, prompt, metadata


def buildPreviewText(metadata):
    text = f"File: {metadata['fileinfo']['filename']}\n"
    text += f"Resolution: {metadata['fileinfo']['resolution']}\n"
    text += f"Date: {metadata['fileinfo']['date']}\n"
    text += f"Size: {metadata['fileinfo']['size']}\n"
    return text
