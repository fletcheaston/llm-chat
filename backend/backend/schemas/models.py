from enum import StrEnum


class LargeLanguageModel(StrEnum):
    UTILS_ECHO = "utils-echo"

    OPENAI_GPT_4_1 = "openai-gpt-4.1"
    OPENAI_GPT_4_1_MINI = "openai-gpt-4.1-mini"
    OPENAI_GPT_4_1_NANO = "openai-gpt-4.1-nano"

    GEMINI_2_0_FLASH = "gemini-2.0-flash"
    GEMINI_2_0_FLASH_LITE = "gemini-2.0-flash-lite"

    GENIMI_2_5_PRO = "gemini-2.5-pro"
    GENIMI_2_5_FLASH = "gemini-2.5-flash"
    GENIMI_2_5_FLASH_LITE = "gemini-2.5-flash-lite"
