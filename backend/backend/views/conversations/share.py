from typing import Any

import jwt
from ninja import Router

from backend import models, schemas
from backend.requests import AuthenticatedHttpRequest

router = Router()


@router.post(
    "/preview",
    response={200: schemas.PreviewConversationSchema},
    by_alias=True,
)
def preview_conversation(
    request: AuthenticatedHttpRequest,
    data: schemas.SharedConversationSchema,
) -> Any:
    """Get basic conversation details from a shared link token."""
    try:
        conversation = models.Conversation.validate_share_link(data.token)

        return conversation

    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return 400, schemas.ErrorSchema(detail=schemas.ErrorMessage.INVALID_TOKEN)

    except models.Conversation.DoesNotExist:  # ty: ignore[unresolved-attribute]
        return 400, schemas.ErrorSchema(
            detail=schemas.ErrorMessage.RESOURCE_DOES_NOT_EXIST
        )


@router.post(
    "/join",
    response={200: schemas.ConversationSchema, 400: schemas.ErrorSchema},
    by_alias=True,
)
def join_conversation(
    request: AuthenticatedHttpRequest,
    data: schemas.SharedConversationSchema,
) -> Any:
    """Join a conversation using a share link."""
    try:
        conversation = models.Conversation.validate_share_link(data.token)

        # Check if user is already a member
        member = conversation.db_members.filter(  # ty: ignore[unresolved-attribute]
            user=request.user
        ).first()

        if member:
            # If they are a member, just make sure they can see it
            member.hidden = False
            member.save()
        else:
            # Otherwise, create their membership
            models.ConversationMember.objects.create(
                conversation=conversation,
                user=request.user,
                added_by=conversation.owner,
                llms_selected=[],
            )

        return conversation

    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return 400, schemas.ErrorSchema(detail=schemas.ErrorMessage.INVALID_TOKEN)

    except models.Conversation.DoesNotExist:  # ty: ignore[unresolved-attribute]
        return 400, schemas.ErrorSchema(
            detail=schemas.ErrorMessage.RESOURCE_DOES_NOT_EXIST
        )


@router.post(
    "/{conversation_id}",
    response={200: schemas.ShareLinkSchema},
    by_alias=True,
)
def generate_share_link(
    request: AuthenticatedHttpRequest,
    conversation_id: str,
) -> dict:
    """Generate a shareable link for a conversation."""
    conversation = models.Conversation.objects.get(
        id=conversation_id,
        owner=request.user,
    )

    token = conversation.generate_share_link()

    return {"token": token}
