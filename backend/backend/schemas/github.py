from typing import Literal

from .base import Schema


class GitHubCallbackSchema(Schema):
    access_token: str
    token_type: Literal["bearer"]
    scope: Literal["user:email"]


class GitHubUserSchema(Schema):
    login: str
    avatar_url: str
    email: str
    name: str
