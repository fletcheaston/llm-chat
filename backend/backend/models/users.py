from typing import Any

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser
from django.db import models
from simple_history.models import HistoricalRecords

from .models import DjangoModel, LowercaseEmailField


class UserQuerySet(models.QuerySet["User"]):
    pass


class UserManager(BaseUserManager["User"]):
    def create_user(
        self,
        name: str,
        email: str,
        username: str,
        **extra_fields: Any,
    ) -> "User":
        if not name:
            raise ValueError("Name must be provided.")

        if not email:
            raise ValueError("Email must be provided.")

        if not username:
            raise ValueError("Username must be provided.")

        # Create the user in our system
        user: User = self.model(
            name=name,
            email=email,
            username=username,
            **extra_fields,
        )

        user.save()

        return user

    def create_superuser(
        self,
        name: str,
        email: str,
        username: str,
        **extra_fields: Any,
    ) -> "User":
        extra_fields["is_staff"] = True
        extra_fields["is_superuser"] = True
        extra_fields["is_active"] = True

        return self.create_user(
            name,
            email,
            username,
            **extra_fields,
        )


class User(DjangoModel, AbstractBaseUser):
    ############################################################################
    # Normal fields
    name = models.TextField(default="")
    email = LowercaseEmailField(unique=True)
    username = models.TextField(unique=True)
    image_url = models.TextField(default="")

    # Django user fields
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    ############################################################################
    # Queryset managers
    objects = UserManager.from_queryset(UserQuerySet)()

    history = HistoricalRecords(table_name="user_history")

    ############################################################################
    # Meta
    class Meta:
        db_table = "user"

    ############################################################################
    # Properties

    ############################################################################
    # Methods
    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser
