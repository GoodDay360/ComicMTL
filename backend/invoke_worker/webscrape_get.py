
import json, environ, requests, os, subprocess
import asyncio, uuid, shutil, sys

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, StreamingHttpResponse
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async
from django.db import connections

from backend.module import web_scrap
from backend.module.utils import manage_image
from backend.models.model_cache import RequestWebScrapeGetCache
from core.settings import BASE_DIR
from backend.module.utils import cloudflare_turnstile
from backend.models.model_1 import WebScrapeGetCache

from backend.module.utils import directory_info, date_utils

from django_thread import Thread
from time import sleep

MAX_GET_STORAGE_SIZE  = 10 * 1024 * 1024 * 1024 # GB

STORAGE_DIR = os.path.join(BASE_DIR,"storage")
if not os.path.exists(STORAGE_DIR): os.makedirs(STORAGE_DIR)

class Get(Thread):
    def run(self):
        while True: 
            connections['cache'].close()
            connections['DB1'].close()
            is_request = False
            
            request_query = RequestWebScrapeGetCache.objects.order_by("datetime").first()
            try:
                if request_query:
                    query_result = WebScrapeGetCache.objects.filter(source=request_query.source,comic_id=request_query.comic_id).first()
                    if (
                        query_result
                        and os.path.exists(query_result.file_path)
                        and query_result.datetime >= date_utils.utc_time().add(-5,'hour').get()
                        
                    ): 
                        RequestWebScrapeGetCache.objects.filter(
                            source=request_query.source,
                            comic_id=request_query.comic_id,
                        ).delete()
                        is_request = False
                    elif query_result: 
                        WebScrapeGetCache.objects.filter(
                            file_path=query_result.file_path
                        ).delete()
                        is_request = True
                    else: is_request = True
                else: is_request = False
                
                if is_request:
                    if not os.path.exists(os.path.join(STORAGE_DIR,"get",request_query.source)): os.makedirs(os.path.join(STORAGE_DIR,"get",request_query.source))
                    
                    connections['cache'].close()
                    connections['DB1'].close()
                    
                    while True:
                        storage_size = directory_info.GetDirectorySize(directory=os.path.join(STORAGE_DIR,"get"),max_threads=5)
                        if (storage_size >= MAX_GET_STORAGE_SIZE ):
                            request_query = WebScrapeGetCache.objects.order_by("datetime").first()
                            if (request_query):
                                file_path = request_query.file_path
                                if os.path.exists(file_path): os.remove(file_path)
                                WebScrapeGetCache.objects.filter(file_path=request_query.file_path).delete()
                            else: 
                                shutil.rmtree(os.path.join(STORAGE_DIR,"get"))
                                break
                        else: break
                    
                    

                    DATA = web_scrap.source_control[request_query.source].get.scrap(id=request_query.comic_id)
                    if not DATA: raise Exception('Image Not found!')
                    
                    file_path = os.path.join(STORAGE_DIR,"get",request_query.source,f'{request_query.comic_id}.json')
                    
                    with open(file_path, "w") as f: json.dump(DATA, f, indent=None, separators=(',', ':'))
                    
                    connections['cache'].close()
                    connections['DB1'].close()
                    WebScrapeGetCache(
                        file_path=file_path,
                        source=request_query.source,
                        comic_id=request_query.comic_id,
                    ).save()
                    RequestWebScrapeGetCache.objects.filter(
                        source=request_query.source,
                        comic_id=request_query.comic_id,
                    ).delete()
                else:
                    sleep(5)
            except Exception as e:
                connections['cache'].close()
                connections['DB1'].close()
                RequestWebScrapeGetCache.objects.filter(
                    source=request_query.source,
                    comic_id=request_query.comic_id,
                ).delete()
                print("[Error 'Webscrape-Get' Worker]: ") 
                exc_type, exc_obj, exc_tb = sys.exc_info()
                line_number = exc_tb.tb_lineno
                print(f"Error on line {line_number}: {e}")
                sleep(5)

thread = Get()
thread.daemon = True
thread.start()


