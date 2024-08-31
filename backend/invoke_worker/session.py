from django_thread import Thread
from time import sleep
from backend.module.utils import date_utils
import requests, environ
from core import settings

env = environ.Env()

class Delete(Thread):
    def run(self):
        while True: 
            try:
                requests.post(f'{settings.WORKER_SERVED_SCOPE}/worker/session/delete_outdated/', headers={"Worker-Token": env("WORKER_TOKEN")})
                print('[Worker] All expired sessions have been cleared successfully.')
                sleep(1.5 * 60 * 60)
            except Exception as e: 
                print(e) 
                sleep(10)

thread = Delete()
thread.daemon = True
thread.start()


