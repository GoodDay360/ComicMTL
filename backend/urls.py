
from django.contrib import admin
from django.urls import path, include, re_path
from backend.api import web_scrap, test



urlpatterns = [
    path('web_scrap/get_list/', web_scrap.get_list),
    path('web_scrap/search/', web_scrap.search),
    path('web_scrap/get/', web_scrap.get),
    path('web_scrap/get_cover/<str:id>/<str:cover_id>/', web_scrap.get_cover),
    path('test/', test.run_1),
]
