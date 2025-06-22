import uuid

from celery import shared_task
from openai import OpenAI

from backend import schemas
from server.env import SETTINGS

from ..stream import stream_completions

client = OpenAI(
    api_key=SETTINGS.GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)


@shared_task(name=f"gemini.{schemas.LargeLanguageModel.GEMINI_2_0_FLASH}")
def gemini_2_0_flash(message_id: uuid.UUID) -> None:
    stream_completions(
        message_id=message_id,
        model="gemini-2.0-flash",
        llm=schemas.LargeLanguageModel.GEMINI_2_0_FLASH,
        input_context_size=1_047_576,
        client=client,
    )


@shared_task(name=f"gemini.{schemas.LargeLanguageModel.GEMINI_2_0_FLASH_LITE}")
def gemini_2_0_flash_lite(message_id: uuid.UUID) -> None:
    stream_completions(
        message_id=message_id,
        model="gemini-2.0-flash-lite",
        llm=schemas.LargeLanguageModel.GEMINI_2_0_FLASH_LITE,
        input_context_size=1_047_576,
        client=client,
    )


@shared_task(name=f"gemini.{schemas.LargeLanguageModel.GENIMI_2_5_PRO}")
def gemini_2_5_pro(message_id: uuid.UUID) -> None:
    stream_completions(
        message_id=message_id,
        model="gemini-2.5-pro",
        llm=schemas.LargeLanguageModel.GENIMI_2_5_PRO,
        input_context_size=1_047_576,
        client=client,
    )


@shared_task(name=f"gemini.{schemas.LargeLanguageModel.GENIMI_2_5_FLASH}")
def gemini_2_5_flash(message_id: uuid.UUID) -> None:
    stream_completions(
        message_id=message_id,
        model="gemini-2.5-flash",
        llm=schemas.LargeLanguageModel.GENIMI_2_5_FLASH,
        input_context_size=1_047_576,
        client=client,
    )


@shared_task(name=f"gemini.{schemas.LargeLanguageModel.GENIMI_2_5_FLASH_LITE}")
def gemini_2_5_flash_lite(message_id: uuid.UUID) -> None:
    stream_completions(
        message_id=message_id,
        model="gemini-2.5-flash-lite-preview-06-17",
        llm=schemas.LargeLanguageModel.GENIMI_2_5_FLASH_LITE,
        input_context_size=1_000_000,
        client=client,
    )
