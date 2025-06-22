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
        200: schemas.ConversationSchema,
        429: schemas.ErrorSchema,
    },
    by_alias=True,
)
def create_conversation(
    request: AuthenticatedHttpRequest,
    data: schemas.NewConversationSchema,
) -> Any:
    conversation = models.Conversation.objects.create(
        id=data.id,
        title=data.title,
        owner=request.user,
    )

    models.ConversationMember.objects.create(
        id=data.member_id,
        conversation=conversation,
        user=request.user,
        added_by=request.user,
        llms_selected=data.llms,
    )

    models.Message.objects.create(
        id=data.message_id,
        title=data.message_title,
        content=data.message_content,
        author=request.user,
        conversation=conversation,
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

    queue_task(data.message_id, data.llms)

    return conversation
