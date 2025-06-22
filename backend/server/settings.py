import sys
from pathlib import Path

from .env import SETTINGS

########################################################################################
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = SETTINGS.SECRET_KEY

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = SETTINGS.DEBUG

########################################################################################
# Boring stuff
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

COLLECTING_STATIC = sys.argv[1:2] == ["collectstatic"]

DATA_UPLOAD_MAX_MEMORY_SIZE = 30000000  # Arbitrarily high
DATA_UPLOAD_MAX_NUMBER_FIELDS = None

########################################################################################
# Sessions/CSRF
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

CSRF_COOKIE_SAMESITE = "lax"
SESSION_COOKIE_SAMESITE = "lax"

# How many seconds the cookie will last.
# 1209600 = 2 weeks.
SESSION_COOKIE_AGE = 1209600

# True prevents client side JS from accessing the cookie.
SESSION_COOKIE_HTTPONLY = True

CSRF_USE_SESSIONS = False

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS = [
    ####################################################################################
    # Local dev
    "http://localhost:3000",
    "http://localhost:8000",
    ####################################################################################
    # Real domains
    "https://llm-chat.com",
    "https://llms.fletcheaston.com",
]

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

CORS_EXPOSE_HEADERS = ["Content-Type", "X-CSRFToken"]

ALLOWED_HOSTS: list[str] = [
    ####################################################################################
    # Local dev
    "localhost",
    ####################################################################################
    # Real domains
    "llm-chat.com",
    "llms.fletcheaston.com",
]

SECURE_CROSS_ORIGIN_OPENER_POLICY = "unsafe-none"

########################################################################################
# Application definition
AUTH_USER_MODEL = "chats.User"

LOGIN_URL = "/login/"

INSTALLED_APPS = [
    ####################################################################################
    # First apps
    "daphne",
    "backend",
    ####################################################################################
    # Django's builtin apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
    ####################################################################################
    # Third-party apps
    "corsheaders",
    "silk",
    "simple_history",
    "ninja",
]

AUTHENTICATION_BACKENDS = ("django.contrib.auth.backends.ModelBackend",)

MIDDLEWARE = [
    ####################################################################################
    # Django's builtin middleware
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django.middleware.gzip.GZipMiddleware",
    ####################################################################################
    # Third-party middleware
    "silk.middleware.SilkyMiddleware",
    "simple_history.middleware.HistoryRequestMiddleware",
]


ROOT_URLCONF = "server.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

ASGI_APPLICATION = "server.asgi.application"
WSGI_APPLICATION = "server.wsgi.application"

SILKY_PYTHON_PROFILER = False
SILKY_PYTHON_PROFILER_BINARY = False
SILKY_PYTHON_PROFILER_RESULT_PATH = "silk_profiling/"
SILKY_META = False
SILKY_ANALYZE_QUERIES = False
SILKY_INTERCEPT_PERCENT = 0

########################################################################################
# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": SETTINGS.PG_DB,
        "USER": SETTINGS.PG_USER,
        "PASSWORD": SETTINGS.PG_PASSWORD,
        "HOST": SETTINGS.PG_HOST,
        "PORT": 5432,
    },
}

########################################################################################
# Celery
# https://docs.celeryq.dev/en/latest/userguide/configuration.html#broker-url
CELERY_BROKER_URL = f"redis://{SETTINGS.REDIS_HOST}:6379/0"

# https://docs.celeryq.dev/en/latest/userguide/configuration.html#worker-prefetch-multiplier
CELERY_WORKER_PREFETCH_MULTIPLIER = 1

# https://docs.celeryq.dev/en/latest/userguide/configuration.html#task-track-started
CELERY_TASK_TIME_LIMIT = 60

########################################################################################
# Cache
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": f"redis://{SETTINGS.REDIS_HOST}:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
    }
}

########################################################################################
# Channels
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(SETTINGS.REDIS_HOST, 6379)],
            "capacity": 1000,
            "expiry": 3,
        },
    },
}

########################################################################################
# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}

########################################################################################
# Static files (CSS, JavaScript, Images)
STATIC_ROOT = "static/"
STATIC_URL = "static/"
MEDIA_URL = "media/"

########################################################################################
# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
