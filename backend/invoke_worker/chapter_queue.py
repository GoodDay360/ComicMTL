from django_thread import Thread
from time import sleep
from backend.module.utils import date_utils
from django.db import connections
from backend.models.model_cache import SocketRequestChapterQueueCache
from backend.models.model_1 import ComicStorageCache
from core.settings import BASE_DIR
from backend.module import web_scrap
from backend.module.utils import manage_image
from backend.module.utils.directory_info import GetDirectorySize

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from django.db.models import Count


import requests, environ, os, subprocess, shutil, zipfile, uuid, sys

env = environ.Env()

# os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

STORAGE_DIR = os.path.join(BASE_DIR,"storage")
if not os.path.exists(STORAGE_DIR): os.makedirs(STORAGE_DIR)
COMIC_STORAGE_DIR = os.path.join(STORAGE_DIR,"comics")
if not os.path.exists(COMIC_STORAGE_DIR): os.makedirs(COMIC_STORAGE_DIR)

LOG_DIR = os.path.join(BASE_DIR, "log")
if not os.path.exists(LOG_DIR): os.makedirs(LOG_DIR)

MAX_STORAGE_SIZE = 20 * 1024**3

class Job(Thread):
    def run(self):
        while True: 
            input_dir = ""
            managed_output_dir = ""
            try:
                
                query_result = SocketRequestChapterQueueCache.objects.order_by("datetime").first()
                while True:
                    if (GetDirectorySize(COMIC_STORAGE_DIR) >= MAX_STORAGE_SIZE):
                        query_result_2 = ComicStorageCache.objects.order_by("datetime").first()
                        if (query_result_2):
                            file_path = query_result_2.file_path
                            if os.path.exists(file_path): os.remove(file_path)
                        ComicStorageCache.objects.filter(id=query_result_2.id).delete()
                    else: break
                
                if (query_result):
                    
                    socket_id = query_result.socket_id
                    channel_name = query_result.channel_name
                    source = query_result.source
                    comic_id = query_result.comic_id
                    chapter_id = query_result.chapter_id   
                    chapter_idx = query_result.chapter_idx
                    options = query_result.options
                    if (options.get("translate").get("state")): 
                        target_lang = options.get("translate").get("target")
                    else: target_lang = ""
                    
                    stored = ComicStorageCache.objects.filter(
                        source=source,
                        comic_id=comic_id,
                        chapter_id=chapter_id,
                        chapter_idx=chapter_idx,
                        colorize= options.get("colorize"),
                        translate= options.get("translate").get("state"),
                        target_lang= target_lang,
                    ).first()
                    if (stored):
                        SocketRequestChapterQueueCache.objects.filter(id=query_result.id).delete()
                        connections['cache'].close()
                        connections['DB1'].close()
                    else:
                        connections['cache'].close()
                        connections['DB1'].close()
                        
                        if (options.get("colorize") or options.get("translate").get("state")):
                            script = []
                            input_dir = os.path.join(COMIC_STORAGE_DIR,source,comic_id,str(chapter_idx),"temp")
                            merge_output_dir = os.path.join(COMIC_STORAGE_DIR,source,comic_id,str(chapter_idx),"merged")
                        
                            if (options.get("translate").get("state") and options.get("colorize")):
                                managed_output_dir = os.path.join(COMIC_STORAGE_DIR,source,comic_id,str(chapter_idx),f"{options.get("translate").get("target")}_translated_colorized")
                                script = [
                                    "python", "-m", "manga_translator", "-v", "--overwrite", "--attempts=3", "--ocr=mocr", "--no-text-lang-skip", "--det-auto-rotate", "--det-gamma-correct", "--colorize=mc2", "--translator=m2m100_big", 
                                    "-l", f"{options.get("translate").get("target")}", "-i", f"{merge_output_dir}", "-o", f"{managed_output_dir}"
                                ]
                            elif (options.get("translate").get("state") and not options.get("colorize")):
                                managed_output_dir = os.path.join(COMIC_STORAGE_DIR,source,comic_id,str(chapter_idx),f"{options.get("translate").get("target")}_translated")
                                script = [
                                    "python", "-m", "manga_translator", "-v", "--overwrite", "--attempts=3", "--ocr=mocr", "--no-text-lang-skip", "--det-auto-rotate", "--det-gamma-correct", "--translator=m2m100_big", 
                                    "-l", f"{options.get("translate").get("target")}", "-i", f"{merge_output_dir}", "-o", f"{managed_output_dir}"
                                ]
                            elif (options.get("colorize") and not options.get("translate").get("state")):
                                
                                managed_output_dir = os.path.join(COMIC_STORAGE_DIR,source,comic_id,str(chapter_idx),"colorized")
                                script = [
                                    "python", "-m", "manga_translator", "-v", "--overwrite", "--attempts=3", "--detector=none", "--translator=original", "--colorize=mc2", "--colorization-size=-1", 
                                    "-i", f"{merge_output_dir}", "-o", f"{managed_output_dir}"
                                ]

                            if target_lang == "ENG": script.append("--manga2eng")
                            
                        
                            if os.path.exists(input_dir): shutil.rmtree(input_dir)
                            if os.path.exists(merge_output_dir): shutil.rmtree(merge_output_dir)
                            if os.path.exists(managed_output_dir): shutil.rmtree(managed_output_dir)
                            
                            job = web_scrap.source_control[source].get_chapter.scrap(comic_id=comic_id,chapter_id=chapter_id,output_dir=input_dir)

                            if job.get("status") == "success":
                                manage_image.merge_images_vertically(input_dir, merge_output_dir, max_height=1800)
                                shutil.rmtree(input_dir)
                                
                                
                                with open(os.path.join(LOG_DIR,"image_translator_output.log"), "w") as file:
                                    result = subprocess.run(
                                        script,
                                        cwd=os.path.join(BASE_DIR, "backend", "module", "utils", "image_translator"),
                                        check=True,
                                        shell=False if sys.platform.startswith('linux') else True,
                                        stdout=file,
                                        stderr=file,
                                        text=True,
                                    )
                                if result.returncode != 0: raise Exception("Image Translator Execution error!")
                                os.makedirs(managed_output_dir,exist_ok=True)
                                shutil.rmtree(merge_output_dir)
                                
                                with zipfile.ZipFile(managed_output_dir + '.zip', 'w') as zipf:
                                    for foldername, subfolders, filenames in os.walk(managed_output_dir):
                                        for filename in filenames:
                                            if filename.endswith(('.png', '.jpg', '.jpeg')):
                                                file_path = os.path.join(foldername, filename)
                                                zipf.write(file_path, os.path.basename(file_path))
                                shutil.rmtree(managed_output_dir)
                                
                                
                                ComicStorageCache(
                                    source = source,
                                    comic_id = comic_id,
                                    chapter_id = chapter_id,
                                    chapter_idx = chapter_idx,
                                    file_path = managed_output_dir + ".zip",
                                    colorize = options.get("colorize"),
                                    translate = options.get("translate").get("state"),
                                    target_lang = target_lang,
                                    
                                ).save()
                                
                                
                                query_result_3 = SocketRequestChapterQueueCache.objects.filter(id=query_result.id).first()
                                channel_name = query_result_3.channel_name if query_result_3 else ""
                                SocketRequestChapterQueueCache.objects.filter(id=query_result.id).delete()
                                if channel_name:
                                    channel_layer = get_channel_layer()
                                    async_to_sync(channel_layer.send)(channel_name, {
                                        'type': 'event_send',
                                        'data': {
                                            "type": "chapter_ready_to_download",
                                            "data": {
                                                "source": source,
                                                "comic_id": comic_id,
                                                "chapter_id": chapter_id,
                                                "chapter_idx": chapter_idx
                                            }
                                        }
                                    })
                                connections['cache'].close()
                                connections['DB1'].close()
                                
                            else: 
                                connections['cache'].close()
                                connections['DB1'].close()
                                raise Exception("#1 Dowload chapter error!")
                        else:
                            input_dir = os.path.join(COMIC_STORAGE_DIR,source,comic_id,str(chapter_idx),"original")
                            merge_output_dir = os.path.join(COMIC_STORAGE_DIR,source,comic_id,str(chapter_idx),"origin-merged")
                            
                            if os.path.exists(input_dir): shutil.rmtree(input_dir)
                            if os.path.exists(merge_output_dir): shutil.rmtree(merge_output_dir)
                            
                            job = web_scrap.source_control["colamanga"].get_chapter.scrap(comic_id=comic_id,chapter_id=chapter_id,output_dir=input_dir)
                            if job.get("status") == "success":
                                manage_image.merge_images_vertically(input_dir, merge_output_dir, max_height=1800)
                                if os.path.exists(input_dir): shutil.rmtree(input_dir)
                                
                                with zipfile.ZipFile(input_dir + '.zip', 'w') as zipf:
                                    for foldername, subfolders, filenames in os.walk(merge_output_dir):
                                        for filename in filenames:
                                            if filename.endswith(('.png', '.jpg', '.jpeg')):
                                                file_path = os.path.join(foldername, filename)
                                                zipf.write(file_path, os.path.basename(file_path))
                                shutil.rmtree(merge_output_dir)
                                
                                ComicStorageCache(
                                        source = source,
                                        comic_id = comic_id,
                                        chapter_id = chapter_id,
                                        chapter_idx = chapter_idx,
                                        file_path = input_dir + '.zip',
                                        colorize = False,
                                        translate = False,
                                        target_lang = "",
                                        
                                ).save()
                                
                                
                                query_result_3 = SocketRequestChapterQueueCache.objects.filter(id=query_result.id).first()
                                channel_name = query_result_3.channel_name if query_result_3 else ""
                                SocketRequestChapterQueueCache.objects.filter(id=query_result.id).delete() 
                                
                                if channel_name:
                                    channel_layer = get_channel_layer()
                                    async_to_sync(channel_layer.send)(channel_name, {
                                        'type': 'event_send',
                                        'data': {
                                            "type": "chapter_ready_to_download",
                                            "data": {
                                                "source": source,
                                                "comic_id": comic_id,
                                                "chapter_id": chapter_id,
                                                "chapter_idx": chapter_idx
                                            }
                                        }
                                    })
                            else: 
                                connections['cache'].close()
                                connections['DB1'].close()
                                raise Exception("#2 Dowload chapter error!")
                        connections['cache'].close()
                        connections['DB1'].close()
                else:
                    connections['cache'].close()
                    connections['DB1'].close()
                    sleep(5)
            except Exception as e: 
                print("[Error] Chapter Queue Socket:", e) 
                if (input_dir): 
                    if os.path.exists(input_dir): shutil.rmtree(input_dir) 
                if (managed_output_dir):
                    if os.path.exists(managed_output_dir): shutil.rmtree(managed_output_dir)
                
                
                query_result_3 = SocketRequestChapterQueueCache.objects.filter(id=query_result.id).first()
                channel_name = query_result_3.channel_name if query_result_3 else ""
                SocketRequestChapterQueueCache.objects.filter(id=query_result.id).delete() 
                
                if (channel_name):
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.send)(channel_name, {
                        'type': 'event_send',
                        'data': {
                            "type": "chapter_ready_to_download",
                            "data": {"state":"error"}
                        }
                    })
                
                
                
                connections['cache'].close()
                connections['DB1'].close()
                sleep(10)

thread = Job()
thread.daemon = True
thread.start()

class UpdateSocketQueue(Thread):
    def run(self):
        while True:
            try:
                queue = 0
                MAX_QUEUE = SocketRequestChapterQueueCache.objects.count()
                
                if (MAX_QUEUE):
                    query_result = list(set(SocketRequestChapterQueueCache.objects.order_by("datetime").values_list('socket_id', flat=True).distinct()))
                    for socket_id in query_result:
                        object = {}
                        query_result_2 = SocketRequestChapterQueueCache.objects.filter(socket_id=socket_id).order_by("datetime").values("source","comic_id","chapter_idx")
                        
                        for item in query_result_2:
                            source = item.get("source")
                            comic_id = item.get("comic_id")
                            chapter_idx = item.get("chapter_idx")
                            
                            object[f"{source}-{comic_id}-{chapter_idx}"] = queue
                            
                            queue += 1
                        
                        query_result_3 = SocketRequestChapterQueueCache.objects.filter(socket_id=socket_id).first()
                        if (query_result_3):
                            channel_layer = get_channel_layer()
                            async_to_sync(channel_layer.send)(query_result_3.channel_name, {
                                'type': 'event_send',
                                'data': {
                                    "type": "chapter_queue_info",
                                    "chapter_queue": {
                                        "queue": object,
                                        "max_queue": MAX_QUEUE,
                                    }
                                }
                            })
                else:
                    pass
            except Exception as e:
                print(e)
                
            connections['cache'].close()
            connections['DB1'].close()
            sleep(10)
thread = UpdateSocketQueue()
thread.daemon = True
thread.start()