import pytest

pytest_plugins = [
    "backend.test_fixtures.users",
]


@pytest.fixture(autouse=True)
def use_test_database(settings):
    settings.DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": "test",
            "USER": "postgres",
            "PASSWORD": "postgres",
            "HOST": "localhost",
            "PORT": 5432,
        },
    }
