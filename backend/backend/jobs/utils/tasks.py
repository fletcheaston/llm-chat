import time
import uuid

from celery import shared_task

from backend import models, schemas


@shared_task(name="utils.echo")
def echo(message_id: uuid.UUID) -> None:
    message = models.Message.objects.get(id=message_id)

    time.sleep(1)

    models.Message.objects.create(
        title=message.title,
        content=message.content,
        llm=schemas.LargeLanguageModel.UTILS_ECHO,
        conversation_id=message.conversation_id,
        reply_to=message,
    )
