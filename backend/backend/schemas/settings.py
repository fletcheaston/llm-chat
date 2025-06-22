import uuid
from datetime import datetime

from .base import Schema
from .models import LargeLanguageModel


class SettingSchema(Schema):
    id: uuid.UUID
    created: datetime
    modified: datetime

    llm_nickname: str
    llm_job: str
    llm_traits: list[str]
    llm_context: str
    llms_available: list[LargeLanguageModel]

    visual_theme: str
    visual_theme_primary_override: str
    visual_theme_secondary_override: str
    visual_theme_background_override: str
    visual_theme_text_override: str
    visual_theme_border_override: str

    visual_branch_vertical: bool
    visual_stats_for_nerds: bool


class UpdateSettingSchema(Schema):
    llm_nickname: str | None = None
    llm_job: str | None = None
    llm_traits: list[str] | None = None
    llm_context: str | None = None
    llms_available: list[LargeLanguageModel] | None = None

    visual_theme: str | None = None
    visual_theme_primary_override: str | None = None
    visual_theme_secondary_override: str | None = None
    visual_theme_background_override: str | None = None
    visual_theme_text_override: str | None = None
    visual_theme_border_override: str | None = None

    visual_branch_vertical: bool | None = None
    visual_stats_for_nerds: bool | None = None
