import json
from enum import StrEnum
from functools import cached_property
from typing import Any

from humps import camelize
from pydantic import BaseModel as PydanticBaseModel
from pydantic import ConfigDict


class BaseModel(PydanticBaseModel):
    model_config = ConfigDict(
        # Camelize will give us camelCase field names for external usage
        # while maintaining snake_case for internal usage.
        alias_generator=camelize,
        # Allow internal usage of snake_case field names.
        populate_by_name=True,
        # Extra whitespace? Gross.
        str_strip_whitespace=True,
        arbitrary_types_allowed=True,
        from_attributes=True,
        use_enum_values=True,
        ignored_types=(cached_property,),
        # Ignore any extra fields
        extra="ignore",
    )

    def model_dump_safe(self) -> dict[str, Any]:
        data = json.loads(self.model_dump_json())

        assert isinstance(data, dict)

        return data


class Schema(BaseModel):
    pass


class ErrorMessage(StrEnum):
    UNAUTHENTICATED_USER = "User is unauthenticated."
    INVALID_TOKEN = "Invalid auth token."
    RESOURCE_DOES_NOT_EXIST = "Resource does not exist."
    RATE_LIMIT = "Rate limit exceeded."


class ErrorSchema(Schema):
    detail: ErrorMessage
