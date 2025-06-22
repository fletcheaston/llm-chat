from datetime import timedelta

import jwt
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.db import models
from django.utils import timezone
from simple_history.models import HistoricalRecords

from backend import schemas

from .models import DjangoModel
from .users import User


class ConversationQuerySet(models.QuerySet["Conversation"]):
    pass


class Conversation(DjangoModel):
    ############################################################################
    # Normal fields
    title = models.TextField()

    owner = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
    )

    ############################################################################
    # Queryset managers
    objects = ConversationQuerySet.as_manager()

    history = HistoricalRecords(table_name="conversation_history")

    ############################################################################
    # Meta
    class Meta:
        db_table = "conversation"

    ############################################################################
    # Properties

    ############################################################################
    # Methods
    def __str__(self) -> str:
        return f"{self.title}"

    def generate_share_link(self, expires_in_days: int = 7) -> str:
        """Generate a shareable link for this conversation.

        Args:
            expires_in_days: Number of days until the link expires

        Returns:
            A URL-safe JWT token that can be used to join the conversation
        """
        payload = {
            "conversation_id": f"{self.id}",
            "exp": timezone.now() + timedelta(days=expires_in_days),
        }

        # Use base64url encoding for URL safety
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        if isinstance(token, bytes):
            token = token.decode("utf-8")

        return token

    @classmethod
    def validate_share_link(cls, token: str) -> "Conversation":
        """Validate a share link token and return the associated conversation.

        Args:
            token: The JWT token from the share link

        Returns:
            The Conversation instance

        Raises:
            jwt.ExpiredSignatureError: If the token has expired
            jwt.InvalidTokenError: If the token is invalid
            Conversation.DoesNotExist: If the conversation doesn't exist
        """
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return cls.objects.get(id=payload.get("conversation_id"))

    def save(self, *args, **kwargs) -> None:
        super().save(*args, **kwargs)

        # Broadcast via channels
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"user-{self.owner_id}",
            {
                "type": "send_data",
                "event": [
                    schemas.SyncConversation.model_validate(
                        {
                            "type": "conversation",
                            "data": self,
                        }
                    ).model_dump_safe()
                ],
            },
        )
