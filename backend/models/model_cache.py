from django.db import models
from backend.module.utils import date_utils
import uuid

def get_current_utc_time(): return date_utils.utc_time().get()

class RequestWebScrapeGetCoverCache(models.Model):
    id = models.UUIDField(primary_key=True, default = uuid.uuid4)
    source = models.TextField()
    comic_id = models.TextField()
    cover_id = models.TextField()
    datetime = models.DateTimeField(default=get_current_utc_time)
    
class RequestWebScrapeGetCache(models.Model):
    id = models.UUIDField(primary_key=True, default = uuid.uuid4)
    source = models.TextField()
    comic_id = models.TextField()
    datetime = models.DateTimeField(default=get_current_utc_time)

class CloudflareTurnStileCache(models.Model):
    token = models.TextField(primary_key=True)
    datetime = models.DateTimeField(default=get_current_utc_time)
    

class SocketRequestChapterQueueCache(models.Model):
    id = models.UUIDField(primary_key = True, default = uuid.uuid4, editable = False)
    socket_id = models.UUIDField()
    channel_name = models.TextField()
    source = models.TextField()
    comic_id = models.TextField()
    chapter_id = models.TextField()
    chapter_idx = models.IntegerField()
    
    options = models.JSONField()
    datetime = models.DateTimeField(default=get_current_utc_time)

    
    
    
    