from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.layers import get_channel_layer

import wsconnections.routing

application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(
        URLRouter(
            wsconnections.routing.websocket_urlpatterns
        )
    ),
})