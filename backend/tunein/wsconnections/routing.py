from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'^ws/room/(?P<room_id>\w+)/(?P<username>\w+)/(?P<userID>\w+)/$', consumers.RoomConsumer.as_asgi())
]