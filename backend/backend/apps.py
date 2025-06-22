from django.apps import AppConfig

from . import jobs  # noqa: F401


class AppChatConfig(AppConfig):
    name = "backend"
    verbose_name = "Backend"
