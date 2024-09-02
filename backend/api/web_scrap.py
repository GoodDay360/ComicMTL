
import json, environ, requests, os, subprocess

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django_ratelimit.decorators import ratelimit

from backend.module import web_scrap
from backend.module.utils import manage_image

from core.settings import BASE_DIR

env = environ.Env()

__is_get_list = False
@ratelimit(key='ip', rate='60/m')
def get_list(request):
    # if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    global __is_get_list
    while __is_get_list: pass
    try:
        __is_get_list = True
        DATA = web_scrap.source_control["colamanga"].get_list.scrap()
        __is_get_list = False
        return JsonResponse({"data":DATA}) 
    except Exception as e:
        __is_get_list = False
        return HttpResponseBadRequest(str(e), status=500)

__is_search = False
@ratelimit(key='ip', rate='60/m')
def search(request):
    # if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    global __is_search
    while __is_search: pass
    try:
        __is_search = True
        DATA = web_scrap.source_control["colamanga"].search.scrap(search="妖")
        __is_search = False
        return JsonResponse({"data":DATA}) 
    except Exception as e:
        __is_search = False
        return HttpResponseBadRequest(str(e), status=500)
    

__is_get = False
@ratelimit(key='ip', rate='60/m')
def get(request):
    # if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    global __is_get
    while __is_get: pass
    try:
        __is_get = True
        DATA = web_scrap.source_control["colamanga"].get.scrap(id="manga-gu881388")
        __is_get = False
        return JsonResponse({"data":DATA}) 
    except Exception as e:
        __is_get = False
        return HttpResponseBadRequest(str(e), status=500)

__is_get_cover = False
@ratelimit(key='ip', rate='60/m')
def get_cover(request,id,cover_id):
    global __is_get_cover
    while __is_get_cover: pass
    try:
        __is_get_cover = True
        DATA = web_scrap.source_control["colamanga"].get_cover.scrap(id=id,cover_id=cover_id)
        __is_get_cover = False
        response = HttpResponse(DATA, content_type="image/png")
        response['Content-Disposition'] = 'inline; filename="cover.png"'
        return response
    except Exception as e:
        __is_get_cover = False
        return HttpResponseBadRequest(str(e), status=500)
    
def get_chapter(request):
    try:
        id = "manga-lo816008/1/410.html"
        job = web_scrap.source_control["colamanga"].get_chapter.scrap(id=id,output_dir=os.path.join(BASE_DIR,"media"))
        if job.get("status") == "success":
            chapter_id = id.split("/")[-1].split(".")[0]
            input_dir = os.path.join(BASE_DIR,"media",id.split("/")[0],chapter_id,"original")
            merged_output_dir =  os.path.join(BASE_DIR,"media",id.split("/")[0],chapter_id,"merged")
            os.makedirs(merged_output_dir,exist_ok=True)
            
            manage_image.merge_images_vertically(input_dir=input_dir,output_dir=merged_output_dir,max_size=10*1024*1024)

            translated_merged_output_dir = os.path.join(BASE_DIR,"media",id.split("/")[0],chapter_id,"merged_translated")
            os.makedirs(translated_merged_output_dir,exist_ok=True)
        
        
            subprocess.run(
                ["python", "-m", "manga_translator", "-v", "--manga2eng", "--translator=m2m100_big", "-l", "ENG", "-i", f"{merged_output_dir}", "-o", f"{translated_merged_output_dir}"],
                cwd=os.path.join(BASE_DIR,"backend","module","utils","translator"), shell=True, check=True
            )
            
            translated_splited_output_dir = os.path.join(BASE_DIR,"media",id.split("/")[0],chapter_id,"translated")
            
            os.makedirs(translated_splited_output_dir,exist_ok=True)
            manage_image.split_image_vertically(input_dir=translated_merged_output_dir,output_dir=translated_splited_output_dir)
    except Exception as e:
        print(e)
            
    return JsonResponse({})