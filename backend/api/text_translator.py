import json, environ

from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django_ratelimit.decorators import ratelimit


from django.views.decorators.csrf import csrf_exempt
from core.settings import BASE_DIR

from backend.module.utils import text_translator

env = environ.Env()

@csrf_exempt
@ratelimit(key='ip', rate='60/m')
def translate(request):
    if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    
    payload = json.loads(request.body)
    
    text = payload.get("text")
    
    from_code = "zh"
    to_code = "en"

    return HttpResponse(text_translator.translate(text, from_code, to_code), content_type="text/plain")
