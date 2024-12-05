
import json, environ, requests, os, subprocess
import asyncio, uuid, shutil

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, StreamingHttpResponse
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async

from backend.module import web_scrap
from backend.module.utils import manage_image
from backend.models.model_cache import RequestCache
from core.settings import BASE_DIR
from backend.module.utils import cloudflare_turnstile
from backend.models.model_1 import WebScrapeGetCoverCache

from backend.module.utils import directory_info, date_utils


env = environ.Env()

STORAGE_DIR = os.path.join(BASE_DIR,"storage")
if not os.path.exists(STORAGE_DIR): os.makedirs(STORAGE_DIR)

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
    
    file_path = ""
    file_name = ""
    chunk_size = 8192
    MAX_COVER_STORAGE_SIZE = 10 * 1024 * 1024 * 1024

    try:
        query_result = WebScrapeGetCoverCache.objects.filter(source=source,comic_id=id,cover_id=cover_id).first()
        if (
            query_result 
            and os.path.exists(query_result.file_path)
            and query_result.datetime >= date_utils.utc_time().add(-5,'hour').get()
        ): 
            file_path = query_result.file_path
            file_name = os.path.basename(file_path)

        else:
            if not os.path.exists(os.path.join(STORAGE_DIR,"covers")): os.makedirs(os.path.join(STORAGE_DIR,"covers"))
            
            while True:
                storage_size = directory_info.GetDirectorySize(directory=os.path.join(STORAGE_DIR,"covers"),max_threads=5)
                if (storage_size >= MAX_COVER_STORAGE_SIZE):
                    query_result = WebScrapeGetCoverCache.objects.order_by("datetime").first()
                    if (query_result):
                        file_path = query_result.file_path
                        if os.path.exists(file_path): os.remove(file_path)
                        WebScrapeGetCoverCache.objects.filter(file_path=query_result.file_path).delete()
                    else: 
                        shutil.rmtree(os.path.join(STORAGE_DIR,"covers"))
                        break
                else: break
            
            DATA = web_scrap.source_control[source].get_cover.scrap(id=id,cover_id=cover_id)
            if not DATA: HttpResponseBadRequest('Image Not found!', status=404)
            
            file_path = os.path.join(STORAGE_DIR,"covers",f'{source}-{id}-{cover_id}.png')
            file_name = os.path.basename(file_path)
            
            with open(file_path, "wb") as f: f.write(DATA)
            
            WebScrapeGetCoverCache(
                file_path=file_path,
                source=source,
                comic_id=id,
                cover_id=cover_id,
            ).save()
            
            
        
        def file_iterator():
            with open(file_path, 'rb') as f:
                while chunk := f.read(chunk_size):
                    yield chunk

        response = StreamingHttpResponse(file_iterator())
        response['Content-Type'] = 'application/octet-stream'
        response['Content-Length'] = os.path.getsize(file_path)
        response['Content-Disposition'] = f'attachment; filename="{file_name}"'
        return response
    except Exception as e:
        return HttpResponseBadRequest(str(e), status=500)

    