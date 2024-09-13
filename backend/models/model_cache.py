from django.db import models

# Create your models here.

class RequestCache(models.Model):
    room = models.TextField()
    client = models.UUIDField(primary_key=True)
    datetime = models.DateTimeField(auto_now=True)

# class SocketCache(models.Model):
#     room = models.TextField()
#     channel = models.TextField()
    
    
    
    
    