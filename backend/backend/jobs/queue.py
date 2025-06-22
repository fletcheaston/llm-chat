import uuid

from backend import schemas

from .gemini.tasks import (
    gemini_2_0_flash,
    gemini_2_0_flash_lite,
    gemini_2_5_flash,
    gemini_2_5_flash_lite,
    gemini_2_5_pro,
)
from .openai.tasks import (
    openai_gpt_4_1,
    openai_gpt_4_1_mini,
    openai_gpt_4_1_nano,
)
from .utils.tasks import echo


def queue_task(message_id: uuid.UUID, llms: list[schemas.LargeLanguageModel]) -> None:
    # Utils
    if schemas.LargeLanguageModel.UTILS_ECHO in llms:
        echo.delay_on_commit(message_id)

    # OpenAI
    if schemas.LargeLanguageModel.OPENAI_GPT_4_1 in llms:
        openai_gpt_4_1.delay_on_commit(message_id)

    if schemas.LargeLanguageModel.OPENAI_GPT_4_1_MINI in llms:
        openai_gpt_4_1_mini.delay_on_commit(message_id)

    if schemas.LargeLanguageModel.OPENAI_GPT_4_1_NANO in llms:
        openai_gpt_4_1_nano.delay_on_commit(message_id)

    # Gemini
    if schemas.LargeLanguageModel.GEMINI_2_0_FLASH in llms:
        gemini_2_0_flash.delay_on_commit(message_id)

    if schemas.LargeLanguageModel.GEMINI_2_0_FLASH_LITE in llms:
        gemini_2_0_flash_lite.delay_on_commit(message_id)

    if schemas.LargeLanguageModel.GENIMI_2_5_PRO in llms:
        gemini_2_5_pro.delay_on_commit(message_id)

    if schemas.LargeLanguageModel.GENIMI_2_5_FLASH in llms:
        gemini_2_5_flash.delay_on_commit(message_id)

    if schemas.LargeLanguageModel.GENIMI_2_5_FLASH_LITE in llms:
        gemini_2_5_flash_lite.delay_on_commit(message_id)
