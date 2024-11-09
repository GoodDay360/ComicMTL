
import json, environ, requests, os, subprocess
import asyncio, uuid

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async

from backend.module import web_scrap
from backend.module.utils import manage_image
from backend.models.model_cache import RequestCache
from core.settings import BASE_DIR
from backend.module.utils import cloudflare_turnstile


env = environ.Env()


@csrf_exempt
@ratelimit(key='ip', rate='20/m')
def get_list(request):
    if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    token = request.META.get('HTTP_X_CLOUDFLARE_TURNSTILE_TOKEN')
    if not cloudflare_turnstile.check(token): return HttpResponseBadRequest('Cloudflare turnstile token not existed or expired!', status=511)
    
    payload = json.loads(request.body)
    search = payload.get("search")
    page = payload.get("page")
    source = payload.get("source")
    
    if search.get("text"): DATA = web_scrap.source_control[source].search.scrap(search=search,page=page)
    else: DATA = web_scrap.source_control["colamanga"].get_list.scrap(page=page)

    return JsonResponse({"data":DATA}) 


@ratelimit(key='ip', rate='20/m')
def search(request):
    # if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    try:
        DATA = web_scrap.source_control["colamanga"].search.scrap(search="妖")
        return JsonResponse({"data":DATA}) 
    except Exception as e:
        return HttpResponseBadRequest(str(e), status=500)
    


@csrf_exempt
@ratelimit(key='ip', rate='20/m')
def get(request):
    if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    token = request.META.get('HTTP_X_CLOUDFLARE_TURNSTILE_TOKEN')
    if not cloudflare_turnstile.check(token): return HttpResponseBadRequest('Cloudflare turnstile token not existed or expired!', status=511)
    
    payload = json.loads(request.body)
    id = payload.get("id")
    source = payload.get("source")
    
    try:
        DATA = web_scrap.source_control[source].get.scrap(id=id)
        return JsonResponse({"data":DATA}) 
    except Exception as e:

        return HttpResponseBadRequest(str(e), status=500)


@ratelimit(key='ip', rate='60/m')
def get_cover(request,source,id,cover_id):
    token = request.META.get('HTTP_X_CLOUDFLARE_TURNSTILE_TOKEN')
    if not cloudflare_turnstile.check(token): return HttpResponseBadRequest('Cloudflare turnstile token not existed or expired!', status=511)
    
    try:
        DATA = web_scrap.source_control[source].get_cover.scrap(id=id,cover_id=cover_id)
        if not DATA: HttpResponseBadRequest('Image Not found!', status=404)
        response = HttpResponse(DATA, content_type="image/png")
        response['Content-Disposition'] = f'inline; filename="{id}-{cover_id}.png"'
        return response
    except Exception as e:
        return HttpResponseBadRequest(str(e), status=500)

    