import uuid

from django.db import models


class LowercaseEmailField(models.EmailField):
    def to_python(self, value: str) -> str:
        value = super().to_python(value)
        return value.lower()


class DjangoModel(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
