from typing import Any

import httpx
from django.contrib.auth import login as django_login
from django.contrib.auth import logout as django_logout
from django.shortcuts import redirect as django_redirect
from ninja import Router
from pydantic import ValidationError

from backend import schemas
from backend.models import User
from backend.requests import HttpRequest
from server.env import SETTINGS

router = Router()


@router.get(
    "/github-callback",
    response={200: None, 400: schemas.ErrorSchema},
    by_alias=True,
    auth=None,
)
def github_callback(
    request: HttpRequest, code: str, redirect: str | None = None
) -> Any:
    # If the user is already authenticated, just redirect
    if request.user.is_authenticated:
        return django_redirect("/")

    # Authenticate with GitHub
    gh_callback_response = httpx.post(
        "https://github.com/login/oauth/access_token",
        headers={
            "Accept": "application/vnd.github+json",
        },
        json={
            "client_id": SETTINGS.GITHUB_OAUTH_CLIENT_ID,
            "client_secret": SETTINGS.GITHUB_OAUTH_CLIENT_SECRET,
            "code": code,
        },
    )

    try:
        gh_callback = schemas.GitHubCallbackSchema.model_validate(
            gh_callback_response.json()
        )
    except ValidationError:
        return 400, schemas.ErrorSchema(detail=schemas.ErrorMessage.INVALID_TOKEN)

    gh_user_response = httpx.get(
        "https://api.github.com/user",
        headers={
            "Authorization": f"Bearer {gh_callback.access_token}",
            "Accept": "application/vnd.github+json",
        },
    )

    try:
        gh_user = schemas.GitHubUserSchema.model_validate(gh_user_response.json())
    except ValidationError:
        return 400, schemas.ErrorSchema(detail=schemas.ErrorMessage.INVALID_TOKEN)

    # Create the user in our database if they don't exist yet
    user, _ = User.objects.get_or_create(
        email=gh_user.email,
        username=gh_user.login,
    )

    if not user.name:
        user.name = gh_user.name

    if not user.image_url:
        user.image_url = gh_user.avatar_url

    user.save()

    # Log the user out (just in case they have existing cookies)
    django_logout(request)

    # Log the user in
    django_login(request, user)

    # Redirect them back to the app
    if redirect and redirect.startswith("/"):
        return django_redirect(redirect)

    return django_redirect("/chat")
