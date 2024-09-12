import argostranslate.package
import argostranslate.translate

import json, environ, requests, os, subprocess

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django_ratelimit.decorators import ratelimit

from backend.module import web_scrap
from backend.module.utils import manage_image
from django.views.decorators.csrf import csrf_exempt
from core.settings import BASE_DIR

env = environ.Env()

@csrf_exempt
@ratelimit(key='ip', rate='60/m')
def translate(request):
    if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    
    payload = json.loads(request.body)
    
    text = payload.get("text")
    
    from_code = "zh"
    to_code = "en"

    # Download and install Argos Translate package
    argostranslate.package.update_package_index()
    available_packages = argostranslate.package.get_available_packages()
    package_to_install = next(
        filter(
            lambda x: x.from_code == from_code and x.to_code == to_code, available_packages
        )
    )
    argostranslate.package.install_from_path(package_to_install.download())

    # Translate
    translatedText = argostranslate.translate.translate(text, from_code, to_code)
    return HttpResponse(translatedText, content_type="text/plain")
