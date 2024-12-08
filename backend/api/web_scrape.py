
import json, environ, requests, os, subprocess
import asyncio, uuid, shutil, time

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, StreamingHttpResponse
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async

from backend.module import web_scrap
from backend.module.utils import manage_image
from core.settings import BASE_DIR
from backend.module.utils import cloudflare_turnstile
from backend.models.model_1 import WebScrapeGetCoverCache, WebScrapeGetCache
from backend.models.model_cache import RequestWebScrapeGetCoverCache, RequestWebScrapeGetCache

from backend.module.utils import directory_info, date_utils


env = environ.Env()

STORAGE_DIR = os.path.join(BASE_DIR,"storage")
if not os.path.exists(STORAGE_DIR): os.makedirs(STORAGE_DIR)

@csrf_exempt
@ratelimit(key='ip', rate='30/m')
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
@ratelimit(key='ip', rate='30/m')
def get(request):
    if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    token = request.META.get('HTTP_X_CLOUDFLARE_TURNSTILE_TOKEN')
    if not cloudflare_turnstile.check(token): return HttpResponseBadRequest('Cloudflare turnstile token not existed or expired!', status=511)
    
    payload = json.loads(request.body)
    id = payload.get("id")
    source = payload.get("source")

    file_path = ""
    file_name = ""
    chunk_size = 8192

    try:
        query_result = WebScrapeGetCache.objects.filter(source=source,comic_id=id).first()
        if (
            query_result 
            and query_result.datetime >= date_utils.utc_time().add(-5,'hour').get()
            and os.path.exists(query_result.file_path)
        ): 
            file_path = query_result.file_path
            file_name = os.path.basename(file_path)

        else:
            request_query = RequestWebScrapeGetCache.objects.filter(source=source,comic_id=id).first()
            if not request_query:
                RequestWebScrapeGetCache(
                    source=source,
                    comic_id=id,
                ).save()
            
            timeout = date_utils.utc_time().add(30,'second').get()
            while True:
                if date_utils.utc_time().get() >= timeout: return HttpResponseBadRequest('Request timeout!', status=408)
                count = RequestWebScrapeGetCache.objects.filter(source=source,comic_id=id).count()
                if count: time.sleep(1)
                else: break
            query_result = WebScrapeGetCache.objects.filter(source=source,comic_id=id).first()
            
            if (query_result):
                file_path = query_result.file_path
                if not os.path.exists(file_path): return HttpResponseBadRequest('Worker is done but item not found.!', status=404)
                file_name = os.path.basename(file_path)
            else:
                return HttpResponseBadRequest('Worker is done but item not found.!', status=404)
            
            
        
        def file_iterator():
            with open(file_path, 'r') as f:
                while chunk := f.read(chunk_size):
                    yield chunk

        response = StreamingHttpResponse(file_iterator(), content_type='application/json')
        response['Content-Length'] = os.path.getsize(file_path)
        response['Content-Disposition'] = f'attachment; filename="{file_name}"'
        return response
    except Exception as e:
        print(e)
        return HttpResponseBadRequest(str(e), status=500)


@ratelimit(key='ip', rate='60/m')
def get_cover(request,source,id,cover_id):
    token = request.META.get('HTTP_X_CLOUDFLARE_TURNSTILE_TOKEN')
    if not cloudflare_turnstile.check(token): return HttpResponseBadRequest('Cloudflare turnstile token not existed or expired!', status=511)
    
    file_path = ""
    file_name = ""
    chunk_size = 8192

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
            request_query = RequestWebScrapeGetCoverCache.objects.filter(source=source,comic_id=id,cover_id=cover_id).first()
            if not request_query:
                RequestWebScrapeGetCoverCache(
                    source=source,
                    comic_id=id,
                    cover_id=cover_id
                ).save()
            
            timeout = date_utils.utc_time().add(30,'second').get()
            while True:
                if date_utils.utc_time().get() >= timeout: return HttpResponseBadRequest('Request timeout!', status=408)
                count = RequestWebScrapeGetCoverCache.objects.filter(source=source,comic_id=id,cover_id=cover_id).count()
                if count: time.sleep(1)
                else: break
            query_result = WebScrapeGetCoverCache.objects.filter(source=source,comic_id=id,cover_id=cover_id).first()
            
            if (query_result):
                file_path = query_result.file_path
                if not os.path.exists(file_path): return HttpResponseBadRequest('Worker is done but item not found.!', status=404)
                file_name = os.path.basename(file_path)
            else:
                return HttpResponseBadRequest('Worker is done but item not found.!', status=404)
            
        
        def file_iterator():
            with open(file_path, 'rb') as f:
                while chunk := f.read(chunk_size):
                    yield chunk

        response = StreamingHttpResponse(file_iterator(), content_type='image/png')
        response['Content-Length'] = os.path.getsize(file_path)
        response['Content-Disposition'] = f'attachment; filename="{file_name}"'
        return response
    except Exception as e:
        print(e)
        return HttpResponseBadRequest(str(e), status=500)

    