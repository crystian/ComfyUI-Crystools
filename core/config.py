import os
import logging

CONFIG = {
    "loglevel": int(os.environ.get("CRYSTOOLS_LOGLEVEL", logging.INFO)),
    "indent": int(os.environ.get("CRYSTOOLS_INDENT", 2))
}
