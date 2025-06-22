from ninja import Router

from backend import schemas
from backend.models import Conversation
from backend.requests import AuthenticatedHttpRequest

router = Router()


@router.get(
    "",
    response={200: list[schemas.ConversationSchema]},
    by_alias=True,
)
def list_my_conversations(request: AuthenticatedHttpRequest) -> list[Conversation]:
    return Conversation.objects.filter(owner=request.user)
