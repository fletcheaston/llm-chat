import uuid

from celery import shared_task
from openai import OpenAI

from backend import schemas
from server.env import SETTINGS

from ..stream import stream_completions

client = OpenAI(api_key=SETTINGS.OPENAI_API_KEY)


@shared_task(name=f"openai.{schemas.LargeLanguageModel.OPENAI_GPT_4_1}")
def openai_gpt_4_1(message_id: uuid.UUID) -> None:
    stream_completions(
        message_id=message_id,
        model="gpt-4.1",
        llm=schemas.LargeLanguageModel.OPENAI_GPT_4_1,
        input_context_size=1_047_576,
        client=client,
    )


@shared_task(name=f"openai.{schemas.LargeLanguageModel.OPENAI_GPT_4_1_MINI}")
def openai_gpt_4_1_mini(message_id: uuid.UUID) -> None:
    stream_completions(
        message_id=message_id,
        model="gpt-4.1-mini",
        llm=schemas.LargeLanguageModel.OPENAI_GPT_4_1_MINI,
        input_context_size=1_047_576,
        client=client,
    )


@shared_task(name=f"openai.{schemas.LargeLanguageModel.OPENAI_GPT_4_1_NANO}")
def openai_gpt_4_1_nano(message_id: uuid.UUID) -> None:
    stream_completions(
        message_id=message_id,
        model="gpt-4.1-nano",
        llm=schemas.LargeLanguageModel.OPENAI_GPT_4_1_NANO,
        input_context_size=1_047_576,
        client=client,
    )
