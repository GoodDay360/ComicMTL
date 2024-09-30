
import json, environ, requests, os, subprocess
import asyncio, uuid

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async

from backend.module import web_scrap
from backend.module.utils import manage_image
from backend.models.model_cache import SocketRequestChapterQueueCache
from core.settings import BASE_DIR
from backend.module.utils import cloudflare_turnstile


env = environ.Env()


@csrf_exempt
@ratelimit(key='ip', rate='60/m')
def request_chapter(request):
    try:
        if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
        token = request.META.get('HTTP_X_CLOUDFLARE_TURNSTILE_TOKEN')
        if not cloudflare_turnstile.check(token): return HttpResponseBadRequest('Cloudflare turnstile token not existed or expired!', status=511)
        
        payload = json.loads(request.body)
        print(payload)
        chapter_id = payload.get("chapter_id")
        source = payload.get("source")
        socket_id = payload.get("socket_id")
        channel_name = payload.get("channel_name")
        options = payload.get("options") or {}
        
        SocketRequestChapterQueueCache(
            socket_id=socket_id, 
            channel_name=channel_name, 
            source=source, 
            chapter_id=chapter_id, 
            options=options
        ).save()

        return JsonResponse({"status":"success"}) 
    except Exception as e: 
        print(e)
        return HttpResponseBadRequest('Internal Error.', status=500)

