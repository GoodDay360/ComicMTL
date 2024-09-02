
import json, environ, requests

from django.core.files.uploadedfile import TemporaryUploadedFile
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django_ratelimit.decorators import ratelimit
from asgiref.sync import async_to_sync

from backend.module import web_scrap

env = environ.Env()

__is_get_list = False
@ratelimit(key='ip', rate='60/m')
def get_list(request):
    # if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    global __is_get_list
    while __is_get_list: pass
    try:
        __is_get_list = True
        DATA = web_scrap.source_control["colamanga"].get_list.scrap()
        __is_get_list = False
        return JsonResponse({"data":DATA}) 
    except Exception as e:
        __is_get_list = False
        return HttpResponseBadRequest(str(e), status=500)

__is_search = False
@ratelimit(key='ip', rate='60/m')
def search(request):
    # if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    global __is_search
    while __is_search: pass
    try:
        __is_search = True
        DATA = web_scrap.source_control["colamanga"].search.scrap(search="妖")
        __is_search = False
        return JsonResponse({"data":DATA}) 
    except Exception as e:
        __is_search = False
        return HttpResponseBadRequest(str(e), status=500)
    

__is_get = False
@ratelimit(key='ip', rate='60/m')
def get(request):
    # if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    global __is_get
    while __is_get: pass
    try:
        __is_get = True
        DATA = web_scrap.source_control["colamanga"].get.scrap(id="manga-gu881388")
        __is_get = False
        return JsonResponse({"data":DATA}) 
    except Exception as e:
        __is_get = False
        return HttpResponseBadRequest(str(e), status=500)

__is_get_cover = False
@ratelimit(key='ip', rate='60/m')
def get_cover(request,id,cover_id):
    global __is_get_cover
    while __is_get_cover: pass
    try:
        __is_get_cover = True
        DATA = web_scrap.source_control["colamanga"].get_cover.scrap(id=id,cover_id=cover_id)
        __is_get_cover = False
        response = HttpResponse(DATA, content_type="image/png")
        response['Content-Disposition'] = 'inline; filename="cover.png"'
        return response
    except Exception as e:
        __is_get_cover = False
        return HttpResponseBadRequest(str(e), status=500)
    
