import threading, os, django
import asyncio

from queue import Queue

class SequentialRequestMiddleware:
    
    __Lock = threading.RLock()
    def __init__(self, get_response):
        
        self.get_response = get_response

    def __call__(self, request):
        request_type = request.scope.get("type")
        request_path = request.path
        if request_type == "http":
            with self.__Lock: 
                return self.get_response(request)
        else: return self.get_response(request)