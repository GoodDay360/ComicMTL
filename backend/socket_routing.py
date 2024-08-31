from django.urls import re_path
from backend.socket import statistic

websocket_urlpatterns = [
    # re_path(r'ws/top-join-library/', statistic.TopJoinLibrarySocket.as_asgi()),
    # re_path(r'ws/monthly-join-library/', statistic.MonthlyJoinLibrarySocket.as_asgi())
]