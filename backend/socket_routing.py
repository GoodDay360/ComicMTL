from django.urls import re_path, path
from backend.socket import queue

websocket_urlpatterns = [
    path(r'ws/queue/request_chapter/<str:socket_id>', queue.RequestChapter.as_asgi()),
    # re_path(r'ws/monthly-join-library/', statistic.MonthlyJoinLibrarySocket.as_asgi())
]