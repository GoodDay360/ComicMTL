import threading
from concurrent.futures import ThreadPoolExecutor, TimeoutError
import threading
from django.http import  HttpResponseBadRequest


class TimeoutContext:
    def __init__(self, timeout):
        self.timeout = timeout
        self.executor = ThreadPoolExecutor(max_workers=1)
        self.future = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.executor.shutdown(wait=True)
        if exc_type is TimeoutError:
            return True  # Suppress the TimeoutError

    def run(self, func, *args, **kwargs):
        self.future = self.executor.submit(func, *args, **kwargs)
        try:
            return self.future.result(timeout=self.timeout)
        except TimeoutError:
            raise TimeoutError("Function call timed out")
# Temporary Solved using hecky method       
class SequentialRequestMiddleware:
    
    __Lock = threading.Lock()
    def __init__(self, get_response):
        
        self.get_response = get_response

    def __call__(self, request):
        request_type = request.scope.get("type")
        request_path = request.path
        print(request_path)
        if (
            request_type == "http"
            and request_path in ["/api/web_scrap/get_list/"]
        ):
            print("IT THREAD")
            with TimeoutContext(30) as executor:
                self.__Lock.acquire()
                try:
                    resposne =  executor.run(self.get_response,request)
                    self.__Lock.release()
                    return resposne

                except: 
                    self.__Lock.release()
                    return HttpResponseBadRequest("Timeout", status=403)
            
        else: return self.get_response(request)