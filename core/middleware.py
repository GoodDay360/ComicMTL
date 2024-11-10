import threading, uuid, time

from concurrent.futures import ThreadPoolExecutor, TimeoutError
from django.db import connections
from django.http import  HttpResponseBadRequest
from backend.models.model_cache import RequestCache
from backend.module.utils import date_utils



class TimeoutContext:
    def __init__(self, timeout):
        self.timeout = timeout
        self.executor = ThreadPoolExecutor(max_workers=1)
        self.future = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is TimeoutError:
            return True  # Suppress the TimeoutError

    def run(self, func, *args, **kwargs):
        self.future = self.executor.submit(func, *args, **kwargs)
        try: return self.future.result(timeout=self.timeout)
        except TimeoutError: 
            self.executor.shutdown(wait=False)
            self.executor = ThreadPoolExecutor(max_workers=1)
            raise TimeoutError("Function call timed out")
# Temporary Solved using hecky method    

URLS_LOCK_ARRAY = [
    "/api/web_scrap/get_list/","/api/web_scrap/search/","/api/web_scrap/get/",
    "/api/web_scrap/get_cover/","/api/web_scrap/get_chapter/'"
]

REQUEST_MANAGER = {url: {"lock": threading.Lock(), "timeout_context": TimeoutContext(30)} for url in URLS_LOCK_ARRAY}


class SequentialRequestMiddleware:
    def __init__(self, get_response):
        
        self.get_response = get_response

    def __call__(self, request):
        try:
            request_type = request.scope.get("type")
            request_path = request.path
            if request_type in ["http","https"]:
                for url, item in REQUEST_MANAGER.items():
                    if url in request_path:
                        with item["timeout_context"] as executor:
                            item["lock"].acquire()
                            try:
                                resposne = executor.run(self.get_response,request)
                                item["lock"].release()
                                return resposne

                            except Exception as e:
                                print(e) 
                                item["lock"].release()
                                return HttpResponseBadRequest("Excutor Error!", status=403)
                        break
                return self.get_response(request)

            else: return self.get_response(request)
        except Exception as e:
            print(e)
            return HttpResponseBadRequest("Internal Server Error", status=500)