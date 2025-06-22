import uuid

from ninja import Router

from backend import models, schemas
from backend.requests import AuthenticatedHttpRequest

router = Router()


@router.patch(
    "/{conversation_id}",
    response={200: schemas.ConversationSchema},
    by_alias=True,
)
def update_conversation(
    request: AuthenticatedHttpRequest,
    conversation_id: uuid.UUID,
    data: schemas.UpdateConversationSchema,
) -> models.Conversation:
    conversation = models.Conversation.objects.get(
        id=conversation_id,
        owner=request.user,
    )

    if data.title is not None:
        conversation.title = data.title

    conversation.save()

    member = models.ConversationMember.objects.get(
        conversation=conversation,
        user=request.user,
    )

    if data.message_branches is not None:
        member.message_branches = data.message_branches

    if data.llms_selected is not None:
        member.llms_selected = data.llms_selected

    if data.hidden is not None:
        member.hidden = data.hidden

    member.save()

    return conversation
