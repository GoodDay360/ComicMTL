
import requests, environ, json
from django.http import JsonResponse, HttpResponseBadRequest

from backend.models.model_cache import CloudflareTurnStileCache

from django_ratelimit.decorators import ratelimit
from django.views.decorators.csrf import csrf_exempt
from ipware import get_client_ip

env = environ.Env()

@csrf_exempt
@ratelimit(key='ip', rate='60/m')
def verify(request):
    if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    client_ip, is_routable = get_client_ip(request)
    payload = json.loads(request.body)
    token = payload.get("token")
    form_data = {
        "secret": env("CLOUDFLARE_TURNSTILE_SECRET"),
        "response": token,
        "remoteip": client_ip
    }
    req = requests.post(
        url="https://challenges.cloudflare.com/turnstile/v0/siteverify", 
        data=form_data, 
    )
    result = req.json()
    status = result.get("success")
    if (status): 
       
        queryset = CloudflareTurnStileCache.objects.create(token=token)
        queryset.refresh_from_db()
        return JsonResponse(result)
    else: return HttpResponseBadRequest('Cloudflare turnstile token verificaion failed!', status=511)
