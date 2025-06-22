from ninja import Router

from backend import models, schemas
from backend.requests import AuthenticatedHttpRequest

router = Router()


@router.patch(
    "",
    response={200: schemas.SettingSchema},
    by_alias=True,
)
def update_my_settings(  # noqa: C901
    request: AuthenticatedHttpRequest,
    data: schemas.UpdateSettingSchema,
) -> models.Setting:
    setting, _ = models.Setting.objects.get_or_create(user=request.user)

    # LLM settings
    if data.llm_nickname is not None:
        setting.llm_nickname = data.llm_nickname

    if data.llm_job is not None:
        setting.llm_job = data.llm_job

    if data.llm_traits is not None:
        setting.llm_traits = data.llm_traits

    if data.llm_context is not None:
        setting.llm_context = data.llm_context

    if data.llms_available is not None:
        setting.llms_available = data.llms_available

    # Visual settings
    if data.visual_theme is not None:
        setting.visual_theme = data.visual_theme

    if data.visual_theme_primary_override is not None:
        setting.visual_theme_primary_override = data.visual_theme_primary_override

    if data.visual_theme_secondary_override is not None:
        setting.visual_theme_secondary_override = data.visual_theme_secondary_override

    if data.visual_theme_background_override is not None:
        setting.visual_theme_background_override = data.visual_theme_background_override

    if data.visual_theme_text_override is not None:
        setting.visual_theme_text_override = data.visual_theme_text_override

    if data.visual_theme_border_override is not None:
        setting.visual_theme_border_override = data.visual_theme_border_override

    if data.visual_branch_vertical is not None:
        setting.visual_branch_vertical = data.visual_branch_vertical

    if data.visual_stats_for_nerds is not None:
        setting.visual_stats_for_nerds = data.visual_stats_for_nerds

    # Save and return
    setting.save()

    return setting
