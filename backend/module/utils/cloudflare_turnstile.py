from backend.models.model_cache import CloudflareTurnStileCache
from backend.module.utils import date_utils
from django.db import transaction

def check(token):
    with transaction.atomic():
        CloudflareTurnStileCache.objects.filter(datetime__lte=date_utils.utc_time().add(-30 ,'minute').get()).delete()
        result = CloudflareTurnStileCache.objects.filter(token=token).first()
    if result: return True
    else: return False