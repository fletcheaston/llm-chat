from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.postgres.fields import ArrayField
from django.db import models
from simple_history.models import HistoricalRecords

from backend import schemas

from .conversations import Conversation
from .models import DjangoModel
from .users import User


class ConversationMemberQuerySet(models.QuerySet["ConversationMember"]):
    pass


class ConversationMember(DjangoModel):
    ############################################################################
    # Normal fields
    conversation = models.ForeignKey(
        Conversation,
        related_name="db_members",
        on_delete=models.PROTECT,
    )

    user = models.ForeignKey(
        User,
        related_name="conversations",
        on_delete=models.PROTECT,
    )

    added_by = models.ForeignKey(
        User,
        related_name="+",
        on_delete=models.PROTECT,
    )

    llms_selected = ArrayField(
        models.TextField(
            choices=[(llm.value, llm.name) for llm in schemas.LargeLanguageModel],
        ),
        blank=True,
        default=list,
    )

    message_branches = models.JSONField(blank=True, default=dict)

    hidden = models.BooleanField(default=False)

    ############################################################################
    # Queryset managers
    objects = ConversationMemberQuerySet.as_manager()

    history = HistoricalRecords(table_name="conversation_member_history")

    ############################################################################
    # Meta
    class Meta:
        db_table = "conversation_member"

    ############################################################################
    # Properties

    ############################################################################
    # Methods
    def save(self, *args, **kwargs) -> None:
        super().save(*args, **kwargs)

        # Broadcast via channels
        self.broadcast()

    def broadcast(self) -> None:
        channel_layer = get_channel_layer()

        # Broadcast to all users in the conversation
        for user in User.objects.filter(
            conversations__conversation_id=self.conversation_id
        ):
            async_to_sync(channel_layer.group_send)(
                f"user-{user.id}",
                {
                    "type": "send_data",
                    "event": [
                        schemas.SyncMember.model_validate(
                            {
                                "type": "member",
                                "data": self,
                            }
                        ).model_dump_safe()
                    ],
                },
            )
