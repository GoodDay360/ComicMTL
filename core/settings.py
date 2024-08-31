from pathlib import Path
import environ, dj_database_url

import pymysql
pymysql.install_as_MySQLdb()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
environ.Env.read_env(Path.joinpath(BASE_DIR, '.env'))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/



# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
DEBUG_DB = True

# settings.py

# import mimetypes
# mimetypes.add_type("application/javascript", ".js", True)


# SECURITY WARNING: keep the secret key used in production secret!
if DEBUG: 
    print("Running in mode: 'development'")
    SECRET_KEY = 'django-insecure-plijnge9rt9gc2n5ie(ky^0b#)hk5y1@7yw&4etuez3&=m_we$'
    # WORKER_SERVED_SCOPE = "http://127.0.0.1:8000"
else: 
    print("Running in mode: 'production'")
    SECRET_KEY = env("DJANGO_SECRET")
    # WORKER_SERVED_SCOPE = "https://ngslibrary.fly.dev"

DEBUG_PROPAGATE_EXCEPTIONS = True
TASTYPIE_FULL_DEBUG = True
ALLOWED_HOSTS = ["*"]
WORKER_SERVED_SCOPE = "http://127.0.0.1:8000"
CSRF_TRUSTED_ORIGINS = ["http://127.0.0.1","https://ngslibrary.fly.dev","http://ngslibrary.fly.dev"]
CSRF_USE_SESSIONS = True
CSRF_COOKIE_HTTPONLY = True

# Application definition
INSTALLED_APPS = [
    
    'daphne',
    
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    
    'backend.apps.BackendConfig',
    'frontend.apps.FrontendConfig',
    'worker.apps.WorkerConfig',
    'django.contrib.sitemaps',
]


MIDDLEWARE = [
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [Path.joinpath(BASE_DIR,'frontend','dist')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'

# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases
DATABASE_ROUTERS = ['core.routers.Router']

if DEBUG:
    if DEBUG_DB:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'database.sqlite3',
            },
            'cache': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'cache.sqlite3',
            },
            'DB1': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db1.sqlite3',
            },
            'DB2': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db2.sqlite3',
            },

        }
    else:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'database.sqlite3',
            },
            'cache': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'cache.sqlite3',
            },
            'DB1': dj_database_url.config(default=env("DB1")),
            'DB2': dj_database_url.config(default=env("DB2")),

        }
else:
    DATABASES = {
        'default': dj_database_url.config(default=env("DB")),
        'cache': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'cache.sqlite3',
        },
        'DB1': dj_database_url.config(default=env("DB1")),
        'DB2': dj_database_url.config(default=env("DB2")),
        
    }



# Password validation
# https://docs.djangoproject.com/en/4.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://default:Mbn4JtBdE4ZxooCic22PVXuR6k3QbbQa@redis-10139.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com:10139",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(env("REDIS_URL"))],
        },
    },
}


# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.0/howto/static-files/


STATIC_URL = '/_expo/'
STATICFILES_DIRS = [Path.joinpath(BASE_DIR,'frontend','dist','_expo'),Path.joinpath(BASE_DIR,'frontend','dist','assets')]

MEDIA_URL = '/assets/'
MEDIA_ROOT = Path.joinpath(BASE_DIR,'frontend','dist','assets')
# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# EMAIL_BACKEND ='django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_HOST_USER = env("SMTP_EMAIL")
# EMAIL_HOST_PASSWORD = env("SMTP_PASSWORD")
# EMAIL_USE_TLS = True
# EMAIL_USE_SSL = False
