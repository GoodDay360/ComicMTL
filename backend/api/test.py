
import json, environ, requests, os

from django.core.files.uploadedfile import TemporaryUploadedFile
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django_ratelimit.decorators import ratelimit

from core.settings import BASE_DIR

from backend.module import web_scrap

env = environ.Env()


@ratelimit(key='ip', rate='60/m')
def run_1(request):
   pass
