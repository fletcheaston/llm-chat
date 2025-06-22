from typing import Any

from django.contrib.auth import login as django_login
from django.contrib.auth import logout as django_logout
from django.middleware.csrf import get_token
from ninja import Router

from backend import models, schemas
from backend.requests import HttpRequest
from server.env import SETTINGS

router = Router()


@router.get(
    "/whoami",
    response={200: schemas.CsrfAuthUserSchema, 401: schemas.ErrorSchema},
    by_alias=True,
    auth=None,
)
def who_am_i(request: HttpRequest) -> Any:
    if SETTINGS.DEMO:
        # Create demo user if we don't have one already
        demo_user, _ = models.User.objects.get_or_create(
            email="demo@fletcheaston.com",
        )
        demo_user.name = "Demo User"
        demo_user.image_url = "/media/fletcher-easton.png"
        demo_user.save()

        setting, _ = models.Setting.objects.get_or_create(user=demo_user)

        # Log the user out (just in case they have existing cookies)
        django_logout(request)

        # Log the user in
        django_login(request, demo_user)

        return {
            "csrf_token": get_token(request),
            "user": request.user,
            "settings": setting,
        }

    if request.user.is_authenticated:
        setting, _ = models.Setting.objects.get_or_create(user=request.user)

        return {
            "csrf_token": get_token(request),
            "user": request.user,
            "settings": setting,
        }

    return 401, schemas.ErrorSchema(detail=schemas.ErrorMessage.UNAUTHENTICATED_USER)
