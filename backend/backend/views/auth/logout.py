from typing import Any

from django.contrib.auth import logout as django_logout
from django.views.decorators.csrf import csrf_exempt
from ninja import Router

from backend.requests import HttpRequest

router = Router()


@router.post(
    "/logout",
    response={200: None},
    by_alias=True,
    auth=None,
)
@csrf_exempt
def logout(request: HttpRequest) -> Any:
    django_logout(request)
