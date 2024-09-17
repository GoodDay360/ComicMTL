from django.db import models
from backend.module.utils import date_utils

class RequestCache(models.Model):
    room = models.TextField()
    client = models.UUIDField(primary_key=True)
    datetime = models.DateTimeField(default=date_utils.utc_time().get)

class CloudflareTurnStileCache(models.Model):
    token = models.TextField(primary_key=True)
    datetime = models.DateTimeField(default=date_utils.utc_time().get)

    
    
    
    