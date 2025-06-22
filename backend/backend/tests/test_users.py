import pytest

from backend.models import User


@pytest.mark.integration
@pytest.mark.django_db()
def test_create_user_success(user_email: str, user_username: str) -> None:
    # Create the user
    user = User.objects.create_user(
        name="Test User",
        email=user_email,
        username=user_username,
    )

    # Check settings
    assert user.email == user_email

    assert not user.is_staff
    assert not user.is_superuser
    assert user.is_active


@pytest.mark.integration
@pytest.mark.django_db()
def test_create_user_failure_no_name(user_email: str, user_username: str) -> None:
    with pytest.raises(ValueError):
        User.objects.create_user(
            name="",
            email=user_email,
            username=user_username,
        )


@pytest.mark.integration
@pytest.mark.django_db()
def test_create_user_failure_no_email(user_username: str) -> None:
    with pytest.raises(ValueError):
        User.objects.create_user(
            name="Test User",
            email="",
            username=user_username,
        )


@pytest.mark.integration
@pytest.mark.django_db()
def test_create_user_failure_no_username(user_email: str) -> None:
    with pytest.raises(ValueError):
        User.objects.create_user(
            name="Test User",
            email=user_email,
            username="",
        )


@pytest.mark.integration
@pytest.mark.django_db()
def test_create_superuser_success(user_email: str, user_username: str) -> None:
    # Create the user
    user = User.objects.create_superuser(
        name="Test User",
        email=user_email,
        username=user_username,
    )

    # Check settings
    assert user.email == user_email
    assert user.username == user_username

    assert user.is_staff
    assert user.is_superuser
    assert user.is_active
