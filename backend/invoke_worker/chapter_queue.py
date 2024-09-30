from django_thread import Thread
from time import sleep
from backend.module.utils import date_utils
from django.db import connections
from backend.models.model_cache import RequestCache
from core.settings import BASE_DIR

import requests, environ, os

env = environ.Env()

STORAGE_DIR = os.path.join(BASE_DIR,"storage")

class Job(Thread):
    def run(self):
        while True: 
            try:
                query_result = RequestCache.objects.order_by("datetime").first()
                
                
                
                
                connections['cache'].close()
                sleep(3)
            except Exception as e: 
                print(e) 
                connections['cache'].close()
                sleep(10)

thread = Job()
thread.daemon = True
thread.start()


