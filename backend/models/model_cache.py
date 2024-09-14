from django.db import models

# Create your models here.

class RequestCache(models.Model):
    room = models.TextField()
    client = models.UUIDField()
    datetime = models.DateTimeField(auto_now=True)
    def save(self, *args, **kwargs):
        super(RequestCache, self).save(*args, **kwargs)

# class SocketCache(models.Model):
#     room = models.TextField()
#     channel = models.TextField()
    
    
    
    
    