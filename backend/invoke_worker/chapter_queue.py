from django_thread import Thread
from time import sleep
from backend.module.utils import date_utils
from django.db import connections
from backend.models.model_cache import SocketRequestChapterQueueCache
from core.settings import BASE_DIR
from backend.module import web_scrap
from backend.module.utils import manage_image

import requests, environ, os, subprocess, shutil

env = environ.Env()

STORAGE_DIR = os.path.join(BASE_DIR,"storage")

class Job(Thread):
    def run(self):
        while True: 
            try:
                query_result = SocketRequestChapterQueueCache.objects.order_by("datetime").first()
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
                    merged_output_dir =  os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"temp_merged")
                    
                    if (options.get("translate").get("state") and options.get("colorizer")):
                        managed_merged_output_dir = os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"merged_translated_colorized")
                        managed_splited_output_dir = os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"translated_colorized")
                        script = ["python", "-m", "manga_translator", "-v", "--manga2eng", "--colorizer=mc2", "--translator=m2m100_big", "-l", f"{options.get("translate").get("target")}", "-i", f"{merged_output_dir}", "-o", f"{managed_merged_output_dir}"]
                    elif (options.get("translate").get("state") and not options.get("colorizer")):
                        managed_merged_output_dir = os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"merged_translated")
                        managed_splited_output_dir = os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"translated")
                        script = ["python", "-m", "manga_translator", "-v", "--manga2eng", "--translator=m2m100_big", "-l", f"{options.get("translate").get("target")}", "-i", f"{merged_output_dir}", "-o", f"{managed_merged_output_dir}"]
                    elif (options.get("colorizer") and not options.get("translate").get("state")):
                        managed_merged_output_dir = os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"merged_colorized")
                        managed_splited_output_dir = os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"colorized")
                        script = ["python", "-m", "manga_translator", "-v", "--manga2eng", "--colorizer=mc2", "-i", f"{merged_output_dir}", "-o", f"{managed_merged_output_dir}"]
                    
                    if (options.get("colorizer") or options.get("translate").get("state")):
                        job = web_scrap.source_control["colamanga"].get_chapter.scrap(comic_id=comic_id,chapter_id=chapter_id,output_dir=input_dir)
                        if job.get("status") == "success":
                            os.makedirs(merged_output_dir,exist_ok=True)
                            manage_image.merge_images_vertically(input_dir=input_dir,output_dir=merged_output_dir,max_size=10*1024*1024)
                            os.makedirs(managed_merged_output_dir,exist_ok=True)
                            subprocess.run(
                                script,
                                cwd=os.path.join(BASE_DIR,"backend","module","utils","image_translator"), shell=True, check=True
                            )
                            os.makedirs(managed_splited_output_dir,exist_ok=True)
                            manage_image.split_image_vertically(input_dir=managed_merged_output_dir,output_dir=managed_splited_output_dir)

                            shutil.rmtree(input_dir)
                            shutil.rmtree(merged_output_dir)
                            shutil.rmtree(managed_merged_output_dir)
                    else:
                        input_dir = os.path.join(STORAGE_DIR,source,comic_id,chapter_idx,"original")
                        job = web_scrap.source_control["colamanga"].get_chapter.scrap(comic_id=comic_id,chapter_id=chapter_id,output_dir=input_dir)
                    
                     
                    
                              
                connections['cache'].close()
                sleep(3)
            except Exception as e: 
                print(e) 
                connections['cache'].close()
                sleep(10)

thread = Job()
thread.daemon = True
thread.start()


