from django.db import models
from backend.module.utils import date_utils
from core.settings import BASE_DIR

import uuid, os

def get_current_utc_time(): return date_utils.utc_time().get()



class ComicStorageCache(models.Model):
    id = models.UUIDField(primary_key = True, default = uuid.uuid4, editable = False)
    source = models.TextField()
    comic_id = models.TextField()
    chapter_id = models.TextField()
    chapter_idx = models.IntegerField()
    file_path = models.TextField()
    colorize = models.BooleanField()
    translate = models.BooleanField()
    target_lang = models.TextField()
    datetime = models.DateTimeField(default=get_current_utc_time)
    
class WebscrapeGetCoverCache(models.Model):
    file_path = models.TextField(primary_key=True)
    source = models.TextField()
    comic_id = models.TextField()
    cover_id = models.TextField()
    datetime = models.DateTimeField(default=get_current_utc_time)
