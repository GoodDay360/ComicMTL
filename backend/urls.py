
from django.contrib import admin
from django.urls import path, include, re_path
from backend.api import test, stream_file, web_scrap, cloudflare_turnstile, queue



urlpatterns = [
    path('test/', test.run_1),
    path('stream_file/download_chapter/', stream_file.download_chapter),
    
    path('queue/request_chapter/', queue.request_chapter),
    path('queue/request_info/', queue.request_info),
    # /api/queue/request_info/
    path("cloudflare_turnstile/verify/", cloudflare_turnstile.verify),
    
    path('web_scrap/get_list/', web_scrap.get_list),
    path('web_scrap/search/', web_scrap.search),
    path('web_scrap/get/', web_scrap.get),
    path('web_scrap/get_cover/<str:source>/<str:id>/<str:cover_id>/', web_scrap.get_cover),
    path('web_scrap/get_chapter/', web_scrap.get_chapter),
    
    
    
]
