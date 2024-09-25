import json
from datetime import datetime
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from backend.models.model_cache import SocketDownloadChapterQueueCache
from django.dispatch import receiver


class DownloadChapter(WebsocketConsumer):
    channel_session_user = True
    
    def __init__(self):
        super().__init__()
        
        
    def connect(self):
        room_id = self.scope['url_route']['kwargs']['room_id']
        async_to_sync(self.channel_layer.group_add)(
            room_id,
            self.channel_name,
            
        )
        print("Connected")
        self.accept()
        
        # result = SocketDownloadChapterQueueCache.objects.filter(room=room_id,channel=self.channel_name).count()
        # if not result: SocketDownloadChapterQueueCache(room=room_id,channel=self.channel_name).save()
        
        

    def receive(self, text_data):
        room_id = self.scope['url_route']['kwargs']['room_id']
        
        text_data_json = json.loads(text_data)
        data = text_data_json['data']

        async_to_sync(self.channel_layer.group_send)(
            room_id,
            data,
        )
        
        
    
    def send_status(self, event):
        data = event['data']
        self.send(text_data=json.dumps(data))
        

    def disconnect(self, close_code):
        room_id = self.scope['url_route']['kwargs']['room_id']
        # SocketDownloadChapterQueueCache.objects.filter(room=room_id,channel=self.channel_name).delete()
        print("Disconnected")
        # SocketCache.objects.filter(room=self.room_name,channel=self.channel_name).delete()

