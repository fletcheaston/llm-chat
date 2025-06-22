import uuid

from .base import Schema
from .settings import SettingSchema


class UserSchema(Schema):
    id: uuid.UUID
    name: str
    image_url: str


class CsrfAuthUserSchema(Schema):
    csrf_token: str
    user: UserSchema
    settings: SettingSchema
