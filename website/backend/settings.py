"""
Django settings for website project.
"""

import os
from pathlib import Path
import environ
import dj_database_url
import cloudinary
from django.utils.translation import gettext_lazy as _
from dotenv import load_dotenv

load_dotenv()

# Initialize environment variables
env = environ.Env()
env.read_env()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY SETTINGS
# -----------------
SECRET_KEY = env("SECRET_KEY")
DEBUG = env.bool("DEBUG", default=False)
TESTING = env.bool("TESTING", default=False)
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS")
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', env(
    "HTTP_X_FORWARDED_PROTO", default="https"))

# CORS SETTINGS
# -------------
CORS_ORIGIN_ALLOW_ALL = env.bool("CORS_ORIGIN_ALLOW_ALL", default=False)
CORS_ORIGIN_REGEX_WHITELIST = [
    r"^https://[a-zA-Z0-9_\-]+\.airqo\.(net|africa|org|io)$",
    r"^https://airqo.(africa|org|mak.ac.ug)$",
    r"^https://staging-dot-airqo-frontend.appspot.com$",
] + env.list("EXTRA_CORS_ORIGIN_REGEX_WHITELIST", default=[])

CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "https://staging-dot-airqo-frontend.appspot.com",
        "https://staging.airqo.net",
        "https://airqo.net",
        "https://airqo.africa",
        "https://airqo.org",
        "https://airqo.mak.ac.ug",
    ],
)

# APPLICATION DEFINITION
# ----------------------
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "nested_admin",
    "cloudinary",
    "rest_framework",
    "modeltranslation",
    "drf_yasg",
    "django_quill",
    "corsheaders",
]

LOCAL_APPS = [
    'frontend.apps.FrontendConfig',
    'backend.career.apps.CareerConfig',
    'backend.FAQ.apps.FaqConfig',
    'backend.team.apps.TeamConfig',
    'backend.highlights.apps.HighlightsConfig',
    'backend.partners.apps.PartnersConfig',
    'backend.board.apps.BoardConfig',
    'backend.publications.apps.PublicationsConfig',
    'backend.event.apps.EventConfig',
    'backend.africancities.apps.AfricanCitiesConfig',
    'backend.press.apps.PressConfig',
    'backend.impact.apps.ImpactConfig',
    'backend.cleanair.apps.CleanAirConfig',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
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
        "DIRS": [
            os.path.join(BASE_DIR, 'frontend', 'templates'),],
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

# DATABASE
# --------
DATABASES = {"default": dj_database_url.config(default=env("DATABASE_URI"))}

# PASSWORD VALIDATION
# -------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# INTERNATIONALIZATION
# --------------------
LANGUAGES = [
    ('en', _('English')),
    ('fr', _('French')),
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Kampala"
USE_I18N = True
USE_L10N = True
USE_TZ = True

LOCALE_PATHS = [os.path.join(BASE_DIR, "locale")]

# STATIC FILES
# ------------
STATIC_HOST = env("REACT_WEB_STATIC_HOST", default="http://localhost:8081/")
STATIC_ROOT = os.path.join(BASE_DIR, "static")
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "frontend/assets/"),
    os.path.join(BASE_DIR, 'frontend'),
]
STATIC_URL = STATIC_HOST + "static/"

# MEDIA FILES
# -----------
MEDIA_HOST = env("REACT_WEB_MEDIA_HOST", default="http://localhost:8000/")
MEDIA_ROOT = os.path.join(BASE_DIR, 'backend/assets')
MEDIA_URL = MEDIA_HOST + 'backend/assets/'

# PRODUCTION SETTINGS
# -------------------
if not DEBUG:
    STATIC_URL = STATIC_HOST
    DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
    GS_BUCKET_NAME = env("GS_BUCKET_NAME")
    STATICFILES_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
else:
    DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
    STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"

# CLOUDINARY CONFIGURATION
# ------------------------
cloudinary.config(
    cloud_name=env("CLOUDINARY_NAME"),
    api_key=env("CLOUDINARY_KEY"),
    api_secret=env("CLOUDINARY_SECRET"),
    secure=True,
)

# DJANGO REST FRAMEWORK
# ---------------------
LOGIN_URL = '/admin/login/'
LOGOUT_URL = '/admin/logout/'

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.DjangoModelPermissions"],
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_SCHEMA_CLASS": "rest_framework.schemas.coreapi.AutoSchema",
    "NON_FIELD_ERRORS_KEY": "errors",
}

# SWAGGER SETTINGS
# ----------------
SWAGGER_SETTINGS = {
    'LOGIN_URL': '/admin/login/',
    'LOGOUT_URL': '/admin/logout/',
    'USE_SESSION_AUTH': True,
    'SECURITY_DEFINITIONS': {'basic': {'type': 'basic'}},
}
