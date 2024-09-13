"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import backend.socket_routing

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'https': get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                backend.socket_routing.websocket_urlpatterns
            )
        )
    ),
})
