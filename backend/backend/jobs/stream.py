import uuid

import tiktoken
from channels.layers import get_channel_layer
from django.utils import timezone
from openai import OpenAI

from backend import models, schemas


def stream_completions(
    *,
    message_id: uuid.UUID,
    model: str,
    llm: schemas.LargeLanguageModel,
    input_context_size: int,
    client: OpenAI,
) -> None:
    message = models.Message.objects.get(id=message_id)
    settings = models.Setting.objects.get(user_id=message.author_id)

    messages = models.Message.objects.raw(
        """
SELECT
    *
FROM
    threaded_messages(%s, %s::integer);
""",
        [message_id, input_context_size // 4],
    )

    stream = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "developer",
                "content": settings.developer_prompt,
            },
            *[
                {
                    "role": message.role,
                    "content": message.content,
                }
                for message in messages
            ],
        ],
        stream=True,
    )

    # Broadcast via channels
    channel_layer = get_channel_layer()

    new_message = models.Message.objects.create(
        id=uuid.uuid4(),
        title="",
        content="",
        llm=llm,
        conversation_id=message.conversation_id,
        reply_to=message,
    )

    for event in stream:
        for choice in event.choices:
            if choice.delta.content:
                new_message.content += choice.delta.content
                new_message.modified = timezone.now()
                new_message.broadcast(channel_layer)

    new_message.llm_completed = timezone.now()

    tokens = tiktoken.get_encoding("o200k_base").encode(new_message.content)

    new_message.tokens = len(tokens)

    new_message.save()
