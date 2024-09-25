from django.urls import re_path, path
from backend.socket import queue

websocket_urlpatterns = [
    path(r'ws/queue/download_chapter/<str:room_id>', queue.DownloadChapter.as_asgi()),
    # re_path(r'ws/monthly-join-library/', statistic.MonthlyJoinLibrarySocket.as_asgi())
]