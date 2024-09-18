import threading

class SequentialRequestMiddleware:
    _lock = threading.Lock()

    def __init__(self, get_response):
        
        self.get_response = get_response

    def __call__(self, request):
        with self._lock:
            response = self.get_response(request)
        return response