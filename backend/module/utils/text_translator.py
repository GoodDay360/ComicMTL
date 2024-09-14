


import environ, os
from core.settings import BASE_DIR

env = environ.Env()

os.environ['HF_HOME'] = os.path.join(BASE_DIR, '.cache')

import dl_translate as dlt

def translate(from_code="zh", to_code="en", text=""):
    mt = dlt.TranslationModel()
    return mt.translate(text, source=from_code, target=to_code)
