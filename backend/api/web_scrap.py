
import json, environ, requests

from django.core.files.uploadedfile import TemporaryUploadedFile
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django_ratelimit.decorators import ratelimit

from backend.module import web_scrap

env = environ.Env()

@ratelimit(key='ip', rate='60/m')
def get_list(request):
    # if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    DATA = web_scrap.source_control["colamanga"].get_list.scrap()
    return JsonResponse({"data":DATA})  

@ratelimit(key='ip', rate='60/m')
def get(request):
    # if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    DATA = web_scrap.source_control["colamanga"].get.scrap(id="manga-gu881388")
    return JsonResponse({"data":DATA}) 
    
