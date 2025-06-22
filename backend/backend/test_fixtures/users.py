import pytest

from backend.models import User


@pytest.fixture(scope="session")
def user_email() -> str:
    return "test-user@fletcheaston.com"


@pytest.fixture(scope="session")
def user_username() -> str:
    return "fletcheaston"


@pytest.fixture()
@pytest.mark.django_db()
def user(user_email: str, user_username: str) -> User:
    return User.objects.create_user(
        name="Test User",
        email=user_email,
        username=user_username,
        password="PASSWORD",
    )
