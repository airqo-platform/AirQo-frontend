"""
Django settings for website project.

Generated by 'django-admin startproject' using Django 3.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""
import environ
import os
from pathlib import Path
import cloudinary
import dj_database_url


# Read environment
env = environ.Env()
# Read local .env file if it exists
env.read_env()


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool("DEBUG", default=False)
TESTING = env.bool("TESTING", default=False)

SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)

HTTP_X_FORWARDED_PROTO_VALUE = env("HTTP_X_FORWARDED_PROTO", default="https")
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', HTTP_X_FORWARDED_PROTO_VALUE)

ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS")

EXTRA_CORS_ORIGIN_REGEX_WHITELIST = env.list("EXTRA_CORS_ORIGIN_REGEX_WHITELIST", default=[])

CORS_ORIGIN_REGEX_WHITELIST = [
    r"^https://[a-zA-Z0-9_\-]+\.airqo\.net$",
    r"^https://[a-zA-Z0-9_\-]+\.airqo\.africa$",
    r"^https://[a-zA-Z0-9_\-]+\.airqo\.org$",
    r"^https://[a-zA-Z0-9_\-]+\.airqo\.io$",
    r"^https://airqo.mak.ac.ug$",
    r"^https://staging-dot-airqo-frontend.appspot.com$",
]

CORS_ORIGIN_REGEX_WHITELIST = (CORS_ORIGIN_REGEX_WHITELIST + EXTRA_CORS_ORIGIN_REGEX_WHITELIST)

CORS_ORIGIN_ALLOW_ALL = env.bool("CORS_ORIGIN_ALLOW_ALL", default=False)

CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "https://staging-dot-airqo-frontend.appspot.com",
        "https://staging.airqo.net",
        "https://airqo.net",
    ],
)

# Application definition

INSTALLED_APPS = [
    "nested_admin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party apps
    "cloudinary",
    "rest_framework",
    "drf_yasg",
    # My apps
    'backend.career.apps.CareerConfig',
    'backend.FAQ.apps.FaqConfig',
    'backend.team.apps.TeamConfig',
    'frontend.apps.FrontendConfig',
    'backend.highlights.apps.HighlightsConfig',
    'backend.partners.apps.PartnersConfig',
    'backend.board.apps.BoardConfig',
]

MIDDLEWARE = [
    # CORS middleware should be placed as high as possible to work correctly
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "author.middlewares.AuthorDefaultBackendMiddleware",
]

ROOT_URLCONF = "backend.urls"

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

WSGI_APPLICATION = "backend.wsgi.application"


# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {"default": dj_database_url.config(default=env("DATABASE_URI"))}

# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/

# Static
# Default to using webpack-dev-server on port 8081
STATIC_HOST = env("REACT_WEB_STATIC_HOST", default="http://localhost:8081/")

STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"

# This is where collectstatic will put all the static files it gathers.  These should then
# be served out from /static by the StaticFilesStorage
STATIC_ROOT = os.path.join(BASE_DIR, "static")

# This is where the files will be collected from when running `collectstatic`.
# From Django's perspective, this is the input location.
STATICFILES_DIRS = [os.path.join(BASE_DIR, "frontend/assets/")]

STATIC_URL = STATIC_HOST + "static/"

if not DEBUG:
    STATIC_URL = STATIC_HOST
    DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
    GS_BUCKET_NAME = env("GS_BUCKET_NAME")
    STATICFILES_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"

# Configure cloudinary
cloudinary.config(
    cloud_name=env("CLOUDINARY_NAME"),
    api_key=env("CLOUDINARY_KEY"),
    api_secret=env("CLOUDINARY_SECRET"),
    secure=True,
)

# =========================
# Django REST Framework
# =========================
REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions and django guardian's per-object permissions
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.DjangoObjectPermissions",
    ],
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
    ),
    "NON_FIELD_ERRORS_KEY": "errors",
}
