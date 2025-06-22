import os

from django.http import HttpResponse
from ninja import Router

from backend.requests import HttpRequest

router = Router(tags=["static"])


@router.get(
    "",
    auth=None,
    include_in_schema=False,
)
def index(request: HttpRequest) -> HttpResponse:
    current_dir = os.path.dirname(os.path.abspath(__file__))

    with open(os.path.join(current_dir, "index.html")) as f:
        content = f.read()

    return HttpResponse(content, content_type="text/html")


@router.get(
    "{path:path}",
    auth=None,
    include_in_schema=False,
)
def catch_all(request: HttpRequest, path: str) -> HttpResponse:
    current_dir = os.path.dirname(os.path.abspath(__file__))

    with open(os.path.join(current_dir, "index.html")) as f:
        content = f.read()

    return HttpResponse(content, content_type="text/html")
