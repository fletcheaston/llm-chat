from typing import Literal

from backend import schemas


class SyncMessage(schemas.Schema):
    type: Literal["message"]
    data: schemas.MessageSchema


class SyncConversation(schemas.Schema):
    type: Literal["conversation"]
    data: schemas.ConversationSchema


class SyncMember(schemas.Schema):
    type: Literal["member"]
    data: schemas.MemberSchema


class SyncUser(schemas.Schema):
    type: Literal["user"]
    data: schemas.UserSchema


GlobalSyncTypes = SyncMessage | SyncConversation | SyncMember | SyncUser


class SendDataEvent(schemas.Schema):
    event: list[GlobalSyncTypes]
