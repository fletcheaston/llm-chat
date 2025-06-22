from ninja import Router

from backend import schemas
from backend.models import Message
from backend.requests import AuthenticatedHttpRequest

router = Router()


@router.get(
    "",
    response={200: list[schemas.MessageSchema]},
    by_alias=True,
)
def list_my_messages(request: AuthenticatedHttpRequest) -> list[Message]:
    return Message.objects.filter(conversation__owner=request.user)
