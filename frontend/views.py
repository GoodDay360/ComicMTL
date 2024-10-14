from django.shortcuts import render, HttpResponse, redirect
from django.http import JsonResponse
from core.settings import BASE_DIR
from pathlib import Path
from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.staticfiles.views import serve
import json

@ratelimit(key='ip', rate='60/m')
def assets_serve(request,file):
    return serve(request, file)

@ratelimit(key='ip', rate='60/m')
def manifest(request):
    with open(Path.joinpath(BASE_DIR, "frontend", "static", "script", "manifest.webmanifest")) as f:
        data = json.loads(f.read())
    return JsonResponse(data)


@ratelimit(key='ip', rate='60/m')
@ensure_csrf_cookie
def App(request):
    return render(request,'index.html')

# def static_serve(request,file):
#     print(str(Path.joinpath(BASE_DIR,'frontend','dist','_expo',file)))
#     return serve(request, str(Path.joinpath(BASE_DIR,'frontend','dist','_expo',file)))
#     return HttpResponse("GAE")
