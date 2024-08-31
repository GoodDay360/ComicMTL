
from django.contrib import admin
from django.urls import path, include
from backend.api import web_scrap



urlpatterns = [
    path('web_scrab/get_list/', web_scrap.get_list),
    path('web_scrab/get/', web_scrap.get),
]
