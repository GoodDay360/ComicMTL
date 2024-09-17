
import json, environ, requests, os, subprocess
import asyncio, uuid

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async

from backend.module import web_scrap
from backend.module.utils import manage_image
from backend.models.model_cache import RequestCache
from core.settings import BASE_DIR
from backend.module.utils import cloudflare_turnstile


env = environ.Env()


@csrf_exempt
@ratelimit(key='ip', rate='60/m')
def get_list(request):
    if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    token = request.META.get('HTTP_X_CLOUDFLARE_TURNSTILE_TOKEN')
    if not cloudflare_turnstile.check(token): return HttpResponseBadRequest('Cloudflare turnstile token not existed or expired!', status=511)
    
    DATA = web_scrap.source_control["colamanga"].get_list.scrap()

    return JsonResponse({"data":DATA}) 


@ratelimit(key='ip', rate='60/m')
def search(request):
    # if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    try:
        DATA = web_scrap.source_control["colamanga"].search.scrap(search="妖")
        return JsonResponse({"data":DATA}) 
    except Exception as e:
        return HttpResponseBadRequest(str(e), status=500)
    

@ratelimit(key='ip', rate='60/m')
def get(request):
    # if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    try:
        DATA = web_scrap.source_control["colamanga"].get.scrap(id="manga-gu881388")
        return JsonResponse({"data":DATA}) 
    except Exception as e:

        return HttpResponseBadRequest(str(e), status=500)


@ratelimit(key='ip', rate='60/m')
def get_cover(request,source,id,cover_id):
    token = request.META.get('HTTP_X_CLOUDFLARE_TURNSTILE_TOKEN')
    if not cloudflare_turnstile.check(token): return HttpResponseBadRequest('Cloudflare turnstile token not existed or expired!', status=511)
    
    try:
        DATA = web_scrap.source_control[source].get_cover.scrap(id=id,cover_id=cover_id)
        response = HttpResponse(DATA, content_type="image/png")
        response['Content-Disposition'] = f'inline; filename="{id}.png"'
        return response
    except Exception as e:
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
                cwd=os.path.join(BASE_DIR,"backend","module","utils","image_translator"), shell=True, check=True
            )
            
            translated_splited_output_dir = os.path.join(BASE_DIR,"media",id.split("/")[0],chapter_id,"translated")
            
            os.makedirs(translated_splited_output_dir,exist_ok=True)
            manage_image.split_image_vertically(input_dir=translated_merged_output_dir,output_dir=translated_splited_output_dir)
    except Exception as e:
        print(e)
            
    return JsonResponse({})