import json
from datetime import datetime
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from backend.models.model_cache import SocketRequestChapterQueueCache
from django.dispatch import receiver


class RequestChapter(WebsocketConsumer):
    channel_session_user = True
    
    def __init__(self):
        super().__init__()
        self.room_id = self.__class__.__name__
        
    def connect(self):
        user_socket_id = self.scope['url_route']['kwargs']['socket_id']
        
        async_to_sync(self.channel_layer.group_add)(
            self.room_id,
            self.channel_name,
            
        )
        
        SocketRequestChapterQueueCache.objects.filter(socket_id=user_socket_id).update(channel_name = self.channel_name)
        
        print(f"User: ({user_socket_id}) connected to socket room: ({self.room_id})")
        self.accept()
        
        self.send(text_data=json.dumps({
            'type': "socket_info",
            'channel_name': self.channel_name,
        }))

    def event_send(self, event):
        message = event['data']

        self.send(text_data=json.dumps({
            'data': message
        }))
        

    def disconnect(self, close_code):
        user_socket_id = self.scope['url_route']['kwargs']['socket_id']
        
        print(f"User: ({user_socket_id}) disconnected from socket room: ({self.room_id})")
        

