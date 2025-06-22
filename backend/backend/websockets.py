from django.urls import re_path

from .views import sync

urlpatterns = [
    re_path("ws/sync", sync.GlobalSyncConsumer.as_asgi()),
]

__all__ = [
    "urlpatterns",
]
