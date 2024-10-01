from django_thread import Thread
from time import sleep
from backend.module.utils import date_utils
from django.db import connections
from backend.models.model_cache import SocketRequestChapterQueueCache
from core.settings import BASE_DIR
from backend.module import web_scrap
from backend.module.utils import manage_image
from backend.module.utils.directory_info import GetDirectorySize

import requests, environ, os, subprocess, shutil, zipfile

env = environ.Env()

STORAGE_DIR = os.path.join(BASE_DIR,"storage")

MAX_STORAGE_SIZE = 20 * 1024**3

class Job(Thread):
    def run(self):
        while True: 
            try:
                query_result = SocketRequestChapterQueueCache.objects.order_by("datetime").first()
                connections['cache'].close()
                
                print(MAX_STORAGE_SIZE,GetDirectorySize(STORAGE_DIR))
                sleep(3)
                return
                if (query_result):
                    socket_id = query_result.socket_id
                    channel_name = query_result.channel_name
                    source = query_result.source
                    comic_id = query_result.comic_id
                    chapter_id = query_result.chapter_id   
                    chapter_idx = str(query_result.chapter_idx)
                    options = query_result.options
                    
                    print(socket_id, channel_name, source, comic_id , chapter_id, options)
                    
                    input_dir = os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"temp")
                    
                    if (options.get("translate").get("state") and options.get("colorizer")):
                        
                        managed_output_dir = os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"translated_colorized")
                        script = ["python", "-m", "manga_translator", "-v", "--overwrite", "--attempts=3", "--no-text-lang-skip", "--use-mocr-merge", "--det-auto-rotate", "--det-gamma-correct", "--manga2eng", "--colorizer=mc2", "--translator=m2m100_big", "-l", f"{options.get("translate").get("target")}", "-i", f"{input_dir}", "-o", f"{managed_output_dir}"]
                    elif (options.get("translate").get("state") and not options.get("colorizer")):
                        
                        managed_output_dir = os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"translated")
                        script = ["python", "-m", "manga_translator", "-v", "--overwrite", "--attempts=3", "--no-text-lang-skip", "--use-mocr-merge", "--det-auto-rotate", "--det-gamma-correct", "--manga2eng", "--translator=m2m100_big", "-l", f"{options.get("translate").get("target")}", "-i", f"{input_dir}", "-o", f"{managed_output_dir}"]
                    elif (options.get("colorizer") and not options.get("translate").get("state")):
                        
                        managed_output_dir = os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"colorized")
                        script = ["python", "-m", "manga_translator", "-v", "--overwrite", "--attempts=3", "--no-text-lang-skip", "--use-mocr-merge", "--det-auto-rotate", "--det-gamma-correct", "--manga2eng", "--colorizer=mc2", "-i", f"{input_dir}", "-o", f"{managed_output_dir}"]
                    
                    if (options.get("colorizer") or options.get("translate").get("state")):
                        # job = web_scrap.source_control["colamanga"].get_chapter.scrap(comic_id=comic_id,chapter_id=chapter_id,output_dir=input_dir)
                        # if job.get("status") == "success":
                        if (True):
                            subprocess.run(
                                script,
                                cwd=os.path.join(BASE_DIR,"backend","module","utils","image_translator"), shell=True, check=True
                            )
                            os.makedirs(managed_output_dir,exist_ok=True)
                            shutil.rmtree(input_dir)
                            
                            with zipfile.ZipFile(managed_output_dir + '.zip', 'w') as zipf:
                                for foldername, subfolders, filenames in os.walk(managed_output_dir):
                                    for filename in filenames:
                                        if filename.endswith(('.png', '.jpg', '.jpeg')):
                                            file_path = os.path.join(foldername, filename)
                                            zipf.write(file_path, os.path.basename(file_path))
                            shutil.rmtree(managed_output_dir)
                            
                    else:
                        input_dir = os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"original")
                        job = web_scrap.source_control["colamanga"].get_chapter.scrap(comic_id=comic_id,chapter_id=chapter_id,output_dir=input_dir)
                    
                        with zipfile.ZipFile(input_dir + '.zip', 'w') as zipf:
                            for foldername, subfolders, filenames in os.walk(input_dir):
                                for filename in filenames:
                                    if filename.endswith(('.png', '.jpg', '.jpeg')):
                                        file_path = os.path.join(foldername, filename)
                                        zipf.write(file_path, os.path.basename(file_path))
                        shutil.rmtree(input_dir)
                     
                    
                              
                connections['cache'].close()
                sleep(180)
            except Exception as e: 
                print(e) 
                connections['cache'].close()
                sleep(10)

thread = Job()
thread.daemon = True
thread.start()


