import inspect
from typing import Any

import orjson
from django.http import HttpRequest
from django.urls import path
from ninja import NinjaAPI
from ninja.operation import Operation
from ninja.parser import Parser
from ninja.renderers import BaseRenderer
from ninja.security import django_auth
from pydantic_extra_types.color import Color

from . import auth, conversations, messages, settings, static, sync


class ORJSONParser(Parser):
    def parse_body(self, request: HttpRequest) -> Any:
        return orjson.loads(request.body)


def default(obj: Any) -> Any:
    if inspect.isclass(obj):
        return None

    if isinstance(obj, Color):
        return obj.as_hex()

    return obj


class ORJSONRenderer(BaseRenderer):
    media_type = "application/json"

    def render(self, request: HttpRequest, data: Any, *, response_status: int) -> Any:
        return orjson.dumps(data, default=default)


class API(NinjaAPI):
    def get_openapi_operation_id(self, operation: Operation) -> str:
        return operation.view_func.__name__  # ty: ignore[unresolved-attribute]


api = API(
    title="Fletcher Easton's T3 Chat Clone",
    version="0.0.0",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    auth=django_auth,
    csrf=True,
    parser=ORJSONParser(),
    renderer=ORJSONRenderer(),
)

api.add_router("/api/auth", auth.router)
api.add_router("/api/messages", messages.router)
api.add_router("/api/conversations", conversations.router)
api.add_router("/api/settings", settings.router)
api.add_router("/api/sync", sync.router)
api.add_router("", static.router)


urlpatterns = [path("", api.urls)]

__all__ = [
    "urlpatterns",
]
