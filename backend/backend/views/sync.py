from datetime import datetime
from typing import Any

from channels.generic.websocket import AsyncWebsocketConsumer
from ninja import Router

from backend import models, schemas
from backend.requests import AuthenticatedHttpRequest

router = Router(tags=["sync"])


@router.get(
    "",
    response={200: schemas.GlobalSyncTypes},
    by_alias=True,
)
def global_sync_types() -> None:
    raise NotImplementedError


@router.get(
    "/bootstrap",
    response={200: list[schemas.GlobalSyncTypes]},
    by_alias=True,
)
def global_sync_bootstrap(
    request: AuthenticatedHttpRequest,
    timestamp: datetime | None = None,
) -> Any:
    data: list[schemas.GlobalSyncTypes] = []

    ############################################################################
    # Users
    users = models.User.objects.filter(
        conversations__conversation__db_members__user_id=request.user.id
    )

    if timestamp is not None:
        users = users.filter(conversations__modified__gte=timestamp)

    for value in users:
        data.append(schemas.SyncUser(type="user", data=value))

    ############################################################################
    # Members
    members = models.ConversationMember.objects.filter(
        conversation__db_members__user_id=request.user.id
    )

    if timestamp is not None:
        members = members.filter(modified__gte=timestamp)

    for value in members:
        data.append(schemas.SyncMember(type="member", data=value))

    ############################################################################
    # Conversations
    conversations = models.Conversation.objects.filter(
        db_members__user_id=request.user.id
    )

    if timestamp is not None:
        conversations = conversations.filter(modified__gte=timestamp)

    for value in conversations:
        data.append(schemas.SyncConversation(type="conversation", data=value))

    ############################################################################
    # Messages
    messages = models.Message.objects.filter(conversation__owner=request.user)

    if timestamp is not None:
        messages = messages.filter(modified__gte=timestamp)

    for value in messages:
        data.append(schemas.SyncMessage(type="message", data=value))

    return data


class GlobalSyncConsumer(AsyncWebsocketConsumer):
    user: models.User
    group_name: str

    ####################################################################################
    async def connect(self) -> None:
        # Check user
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        # Start connection
        self.group_name = f"user-{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    ####################################################################################
    async def send_data(self, event: Any) -> None:
        data = schemas.SendDataEvent.model_validate(event)

        for value in data.event:
            await self.send(value.model_dump_json(by_alias=True))
