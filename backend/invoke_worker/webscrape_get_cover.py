
import json, environ, requests, os, subprocess
import asyncio, uuid, shutil, sys

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, StreamingHttpResponse
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async
from django.db import connections

from backend.module import web_scrap
from backend.module.utils import manage_image
from backend.models.model_cache import RequestWebScrapeGetCoverCache
from core.settings import BASE_DIR
from backend.module.utils import cloudflare_turnstile
from backend.models.model_1 import WebScrapeGetCoverCache

from backend.module.utils import directory_info, date_utils

from django_thread import Thread
from time import sleep

MAX_COVER_STORAGE_SIZE = 20 * 1024 * 1024 * 1024 # GB

STORAGE_DIR = os.path.join(BASE_DIR,"storage")
if not os.path.exists(STORAGE_DIR): os.makedirs(STORAGE_DIR)

class GetCover(Thread):
    def run(self):
        while True: 
            connections['cache'].close()
            connections['DB1'].close()
            is_request = False
            
            request_query = RequestWebScrapeGetCoverCache.objects.order_by("datetime").first()
            try:
                
                
                if request_query:
                    query_result = WebScrapeGetCoverCache.objects.filter(source=request_query.source,comic_id=request_query.comic_id,cover_id=request_query.cover_id).first()
                    if (
                        query_result
                        and os.path.exists(query_result.file_path)
                        and query_result.datetime >= date_utils.utc_time().add(-5,'hour').get()
                    ): 
                        RequestWebScrapeGetCoverCache.objects.filter(
                            source=request_query.source,
                            comic_id=request_query.comic_id,
                            cover_id=request_query.cover_id
                        ).delete()
                        is_request = False
                    elif query_result: 
                        WebScrapeGetCoverCache.objects.filter(
                            file_path=query_result.file_path
                        ).delete()
                        is_request = True
                    else: is_request = True
                else: is_request = False
                
                if is_request:
                    if not os.path.exists(os.path.join(STORAGE_DIR,"covers",request_query.source)): os.makedirs(os.path.join(STORAGE_DIR,"covers",request_query.source))
                    
                    connections['cache'].close()
                    connections['DB1'].close()
                    
                    while True:
                        storage_size = directory_info.GetDirectorySize(directory=os.path.join(STORAGE_DIR,"covers"),max_threads=5)
                        if (storage_size >= MAX_COVER_STORAGE_SIZE):
                            request_query = WebScrapeGetCoverCache.objects.order_by("datetime").first()
                            if (request_query):
                                file_path = request_query.file_path
                                if os.path.exists(file_path): os.remove(file_path)
                                WebScrapeGetCoverCache.objects.filter(file_path=request_query.file_path).delete()
                            else: 
                                shutil.rmtree(os.path.join(STORAGE_DIR,"covers"))
                                break
                        else: break
                    
                    

                    DATA = web_scrap.source_control[request_query.source].get_cover.scrap(id=request_query.comic_id,cover_id=request_query.cover_id)
                    if not DATA: raise Exception('Image Not found!')
                    
                    file_path = os.path.join(STORAGE_DIR,"covers",request_query.source,f'{request_query.comic_id}-{request_query.cover_id}.png')
                    
                    with open(file_path, "wb") as f: f.write(DATA)
                    
                    connections['cache'].close()
                    connections['DB1'].close()
                    WebScrapeGetCoverCache(
                        file_path=file_path,
                        source=request_query.source,
                        comic_id=request_query.comic_id,
                        cover_id=request_query.cover_id,
                    ).save()
                    RequestWebScrapeGetCoverCache.objects.filter(
                        source=request_query.source,
                        comic_id=request_query.comic_id,
                        cover_id=request_query.cover_id
                    ).delete()
                else:
                    sleep(5)
            except Exception as e:
                connections['cache'].close()
                connections['DB1'].close()
                RequestWebScrapeGetCoverCache.objects.filter(
                    source=request_query.source,
                    comic_id=request_query.comic_id,
                    cover_id=request_query.cover_id
                ).delete()
                print("[Error 'Webscrape-Get-Cover' Worker]: ") 
                exc_type, exc_obj, exc_tb = sys.exc_info()
                line_number = exc_tb.tb_lineno
                print(f"Error on line {line_number}: {e}")
                sleep(5)

thread = GetCover()
thread.daemon = True
thread.start()


