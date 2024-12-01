from django.http import StreamingHttpResponse, HttpResponseBadRequest
from core.settings import BASE_DIR
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import csrf_exempt
from backend.module.utils import cloudflare_turnstile
from backend.models.model_cache import SocketRequestChapterQueueCache
from backend.models.model_1 import ComicStorageCache

import os, json, sys

@csrf_exempt
@ratelimit(key='ip', rate='30/m')
def download_chapter(request):
    if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    token = request.META.get('HTTP_X_CLOUDFLARE_TURNSTILE_TOKEN')
    if not cloudflare_turnstile.check(token): return HttpResponseBadRequest('Cloudflare turnstile token not existed or expired!', status=511)
    try:
        payload = json.loads(request.body)
        source = payload.get("source")
        comic_id = payload.get("comic_id")
        chapter_id = payload.get("chapter_id")
        chapter_idx = payload.get("chapter_idx")
        options = payload.get("options")
        
        query_result = ComicStorageCache.objects.filter(
            source=source, 
            comic_id=comic_id, 
            chapter_id=chapter_id,
            chapter_idx=chapter_idx,
            colorize=options.get("colorize"),
            translate=options.get("translate").get("state"),
            target_lang = options.get("translate").get("target") if options.get("translate").get("state") else ""
        ).first()
        
        
        file_path = query_result.file_path
        file_name = os.path.basename(file_path)
        chunk_size = 8192

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
        exc_type, exc_obj, exc_tb = sys.exc_info()
        line_number = exc_tb.tb_lineno
        print(f"Error on line {line_number}: {e}")
        return HttpResponseBadRequest('Internal Error.', status=500)