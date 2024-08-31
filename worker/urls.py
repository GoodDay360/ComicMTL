
from django.contrib import admin
from django.urls import path, include, re_path
from worker.jobs import ( session)



urlpatterns = [
    path('session/delete_outdated/', session.delete_outdated),
]
