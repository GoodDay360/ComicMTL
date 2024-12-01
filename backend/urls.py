
from django.contrib import admin
from django.urls import path, include, re_path
from backend.api import test, stream_file, cloudflare_turnstile, queue, web_scrape



urlpatterns = [
    path('test/', test.run_1),
    path('stream_file/download_chapter/', stream_file.download_chapter),
    
    path('queue/request_chapter/', queue.request_chapter),
    path('queue/request_info/', queue.request_info),
    # /api/queue/request_info/
    path("cloudflare_turnstile/verify/", cloudflare_turnstile.verify),
    
    path('web_scrap/get_list/', web_scrape.get_list),
    path('web_scrap/get/', web_scrape.get),
    path('web_scrap/get_cover/<str:source>/<str:id>/<str:cover_id>/', web_scrape.get_cover),
    
    
    
]
