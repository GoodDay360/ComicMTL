
import json, environ, requests, os, subprocess
import asyncio, uuid

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async

from backend.module import web_scrap
from backend.module.utils import manage_image
from backend.models.model_cache import SocketRequestChapterQueueCache
from backend.models.model_1 import ComicStorageCache
from core.settings import BASE_DIR
from backend.module.utils import cloudflare_turnstile


env = environ.Env()


@csrf_exempt
@ratelimit(key='ip', rate='30/m')
def request_chapter(request):
    try:
        if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
        token = request.META.get('HTTP_X_CLOUDFLARE_TURNSTILE_TOKEN')
        if not cloudflare_turnstile.check(token): return HttpResponseBadRequest('Cloudflare turnstile token not existed or expired!', status=511)
        
        payload = json.loads(request.body)
        source = payload.get("source")
        comic_id = payload.get("comic_id")
        chapter_id = payload.get("chapter_id")
        chapter_idx = payload.get("chapter_idx")
        socket_id = payload.get("socket_id")
        channel_name = payload.get("channel_name")
        options = payload.get("options") or {}
        
        options["translate"]["target"] = options.get("translate").get("target") if options.get("translate").get("state") else ""
        query_count = ComicStorageCache.objects.filter(
            source=source, 
            comic_id=comic_id, 
            chapter_id=chapter_id,
            chapter_idx=chapter_idx,
            colorize=options.get("colorize"),
            translate=options.get("translate").get("state"),
            target_lang = options.get("translate").get("target")
        ).count()
        
        if query_count: return JsonResponse({"status":"ready"})
        else:
            SocketRequestChapterQueueCache(
                socket_id=socket_id, 
                channel_name=channel_name, 
                source=source, 
                comic_id=comic_id,
                chapter_id=chapter_id, 
                chapter_idx=chapter_idx,
                options=options
            ).save()
            return JsonResponse({"status":"queue"})
    except Exception as e: 
        print(e)
        return HttpResponseBadRequest('Internal Error.', status=500)


@csrf_exempt
@ratelimit(key='ip', rate='60/m')
def request_info(request):
    try:
        if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
        token = request.META.get('HTTP_X_CLOUDFLARE_TURNSTILE_TOKEN')
        if not cloudflare_turnstile.check(token): return HttpResponseBadRequest('Cloudflare turnstile token not existed or expired!', status=511)

        payload = json.loads(request.body)
        socket_id = payload.get("socket_id")
        source = payload.get("source")
        comic_id = payload.get("comic_id")
        chapter_requested = payload.get("chapter_requested")
        
        
        result_request = {}
        for chapter in chapter_requested:
            options = chapter.get("options")
            query_count = SocketRequestChapterQueueCache.objects.filter(socket_id=socket_id, source=source, comic_id=comic_id, chapter_id=chapter.get("chapter_id")).count()
            if query_count: result_request[chapter.get("chapter_id")] =  {"state":"queue","chapter_idx":chapter.get("chapter_idx"),"options":options}
            else:
                query_result = ComicStorageCache.objects.filter(
                    source=source, 
                    comic_id=comic_id, 
                    chapter_id=chapter.get("chapter_id"),
                    chapter_idx=chapter.get("chapter_idx"),
                    colorize=options.get("colorize"),
                    translate=options.get("translate").get("state"),
                    target_lang = options.get("translate").get("target") if options.get("translate").get("state") else ""
                ).first()
                
                if query_result:
                    file_path = query_result.file_path
                    if os.path.exists(file_path): 
                        result_request[chapter.get("chapter_id")] = {"state":"ready","chapter_idx":chapter.get("chapter_idx"),"options":options}
                    else:
                        ComicStorageCache.objects.filter(id=query_result.id).delete()
                        result_request[chapter.get("chapter_id")] = {"state":"unkown","chapter_idx":chapter.get("chapter_idx"),"options":options}
                else:
                    result_request[chapter.get("chapter_id")] = {"state":"unkown","chapter_idx":chapter.get("chapter_idx"),"options":options}
        return JsonResponse(result_request)
        
    except Exception as e: 
        print(e)
        return HttpResponseBadRequest('Internal Error.', status=500)