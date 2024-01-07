from enum import Enum


class TEXTS(Enum):
    CUSTOM_NODE_NAME = "Crystools"
    LOGGER_PREFIX = "Crystools"
    CONCAT = "concatenated"
    INACTIVE_MSG = "inactive"
    INVALID_METADATA_MSG = "Invalid metadata raw"
    FILE_NOT_FOUND = "File not found!"


class CATEGORY(Enum):
    TESTING = "_for_testing"
    MAIN = "crystools 🪛"
    PRIMITIVE = "/Primitive"
    DEBUGGER = "/Debugger"
    LIST = "/List"
    SWITCH = "/Switch"
    PIPE = "/Pipe"
    IMAGE = "/Image"
    UTILS = "/Utils"
    METADATA = "/Metadata"


# remember, all keys should be in lowercase!
class KEYS(Enum):
    LIST = "list_string"
    PREFIX = "prefix"
