import uuid
from datetime import datetime

from pydantic_extra_types.color import Color

from .base import Schema


class TagSchema(Schema):
    id: uuid.UUID
    created: datetime
    modified: datetime

    title: str
    color: Color


class NewTagSchema(Schema):
    id: uuid.UUID
    title: str
    color: Color


class UpdateTagSchema(Schema):
    title: str
    color: Color
