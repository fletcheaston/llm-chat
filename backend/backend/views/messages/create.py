from datetime import timedelta
from typing import Any

from django.utils import timezone
from ninja import Router

from backend import models, schemas
from backend.jobs.queue import queue_task
from backend.requests import AuthenticatedHttpRequest

router = Router()


@router.post(
    "",
    response={
        200: schemas.MessageSchema,
        404: schemas.ErrorSchema,
        429: schemas.ErrorSchema,
    },
    by_alias=True,
)
def create_message(
    request: AuthenticatedHttpRequest,
    data: schemas.NewMessageSchema,
) -> Any:
    conversation = models.Conversation.objects.filter(
        id=data.conversation_id,
        owner_id=request.user.id,
    ).first()

    if conversation is None:
        return 404, schemas.ErrorSchema(
            detail=schemas.ErrorMessage.RESOURCE_DOES_NOT_EXIST
        )

    reply_to: models.Message | None = None

    if data.reply_to_id is not None:
        reply_to = models.Message.objects.filter(
            id=data.reply_to_id,
            conversation=conversation,
        ).first()

        if reply_to is None:
            return 404, schemas.ErrorSchema(
                detail=schemas.ErrorMessage.RESOURCE_DOES_NOT_EXIST
            )

    message = models.Message.objects.create(
        id=data.id,
        title=data.title,
        content=data.content,
        author=request.user,
        conversation=conversation,
        reply_to=reply_to,
    )

    # Check rate limit - count replies to user's messages in last 24 hours
    # Only if they're requesting responses from any LLMs
    if data.llms:
        one_day_ago = timezone.now() - timedelta(days=1)
        reply_count = models.Message.objects.filter(
            reply_to__author=request.user, created__gte=one_day_ago
        ).count()

        if reply_count >= 100:
            return 429, schemas.ErrorSchema(detail=schemas.ErrorMessage.RATE_LIMIT)

    queue_task(message.id, data.llms)

    return message
