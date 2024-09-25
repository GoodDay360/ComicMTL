from django.db import models
from backend.module.utils import date_utils
import uuid

class RequestCache(models.Model):
    room = models.TextField()
    client = models.UUIDField(primary_key=True)
    datetime = models.DateTimeField(default=date_utils.utc_time().get)

class CloudflareTurnStileCache(models.Model):
    token = models.TextField(primary_key=True)
    datetime = models.DateTimeField(default=date_utils.utc_time().get)
    
class SocketDownloadChapterQueueCache(models.Model):
    id = models.UUIDField(primary_key = True, default = uuid.uuid4, editable = False)
    room = models.UUIDField()
    channel = models.TextField()
    source = models.TextField()
    chapter_id = models.TextField()
    datetime = models.DateTimeField(default=date_utils.utc_time().get)

    
    
    
    