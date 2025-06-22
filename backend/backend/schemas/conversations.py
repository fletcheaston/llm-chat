import uuid
from datetime import datetime

from .auth import UserSchema
from .base import Schema
from .models import LargeLanguageModel


class ConversationSchema(Schema):
    id: uuid.UUID
    created: datetime
    modified: datetime

    title: str

    owner_id: uuid.UUID


class NewConversationSchema(Schema):
    id: uuid.UUID
    title: str

    member_id: uuid.UUID

    message_id: uuid.UUID
    message_title: str
    message_content: str
    llms: list[LargeLanguageModel]


class UpdateConversationSchema(Schema):
    title: str | None = None

    message_branches: dict[str, bool] | None = None

    llms_selected: list[LargeLanguageModel] | None = None

    hidden: bool | None = None


class ShareLinkSchema(Schema):
    token: str


class SharedConversationSchema(Schema):
    token: str


class PreviewConversationSchema(Schema):
    id: uuid.UUID
    created: datetime
    modified: datetime

    title: str

    owner: UserSchema
