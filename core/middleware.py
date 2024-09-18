import threading, uuid
from backend.models.model_cache import RequestCache
from django.db import transaction

class RequestContextManager:
    def __init__(self,request_path):
        self.request_path = request_path
        self.client_id = uuid.uuid4()
        RequestCache(room=self.request_path, client=self.client_id).save()
    def __enter__(self):
        while True:
            first_request = RequestCache.objects.filter(room=self.request_path).order_by('datetime').first()
            
            if first_request.client == self.client_id: break
    def __exit__(self,*exc_info):
        RequestCache.objects.filter(room=self.request_path,client=self.client_id).delete()


class SequentialRequestMiddleware:
    RequestCache.objects.all().delete()
    __Lock = threading.Lock()
    def __init__(self, get_response):
        
        self.get_response = get_response

    def __call__(self, request):
        request_type = request.scope.get("type")
        request_path = request.path
        if request_type == "http":
            # with RequestContextManager(request_path): response = self.get_response(request)
            with self.__Lock: response = self.get_response(request)
        return response