import json
from datetime import datetime
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from django.dispatch import receiver


# class TopJoinLibrarySocket(WebsocketConsumer):
#     channel_session_user = True
    
#     def __init__(self):
#         super().__init__()
#         self.room_name = self.__class__.__name__
    
#     def connect(self):
        
#         async_to_sync(self.channel_layer.group_add)(
#             self.room_name,
#             self.channel_name,
            
#         )
#         self.accept()
        
#         result = SocketCache.objects.filter(room=self.room_name,channel=self.channel_name).count()
#         if not result: SocketCache(room=self.room_name,channel=self.channel_name).save()
        
#         result = TopJoinLibraryStatistic.objects.filter(id=1)
#         if len(result): self.send(text_data=json.dumps(result[0].data))
        

#     def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         data = text_data_json['data']

#         async_to_sync(self.channel_layer.group_send)(
#             self.room_name,
#             data,
#         )
        
        
    
#     def chat_message(self, event):
#         data = event['data']
#         self.send(text_data=json.dumps(data))
        
#         result = SocketCache.objects.filter(room=self.room_name,channel=self.channel_name).count()
#         if not result: SocketCache(room=self.room_name,channel=self.channel_name).save()
        
        

#     def disconnect(self, close_code):
#         SocketCache.objects.filter(room=self.room_name,channel=self.channel_name).delete()

