import environ
from backend.module.utils import date_utils
from django.contrib.sessions.models import Session
from django.views.decorators.csrf import csrf_exempt
from django_ratelimit.decorators import ratelimit
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
env = environ.Env()

@ratelimit(key='ip', rate='10/m')
@csrf_exempt
def delete_outdated(request):
    if request.method != "POST": return HttpResponseBadRequest('Allowed POST request only!', status=400)
    if request.headers.get("Worker-Token") != env("WORKER_TOKEN"): return HttpResponseBadRequest('Request Forbidden!', status=403)
    Session.objects.filter(expire_date__lte=date_utils.utc_time().get()).delete()
    return JsonResponse({"status":True})




