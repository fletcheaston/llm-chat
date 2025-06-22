from django.contrib.auth.models import AnonymousUser
from django.http import HttpRequest as DjangoHttpRequest

from backend.models import User


class HttpRequest(DjangoHttpRequest):
    user: User | AnonymousUser


class AuthenticatedHttpRequest(HttpRequest):
    user: User
