ARG PYTHON_VERSION=3.12-slim-bullseye

FROM python:${PYTHON_VERSION}

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install psycopg2 dependencies.
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /code

WORKDIR /code

COPY requirements.txt /tmp/requirements.txt
RUN set -ex && \
    pip install --upgrade pip && \
    pip install -r /tmp/requirements.txt && \
    rm -rf /root/.cache/
COPY . /code


RUN python manage.py makemigrations
RUN python manage.py migrate --database=default
RUN python manage.py migrate --database=cache
RUN python manage.py migrate --database=DB1
RUN python manage.py migrate --database=DB2



EXPOSE 8000

# CMD ["gunicorn", "--bind", ":8000", "--workers", "1", "--worker-class", "gevent", "core.wsgi:application"]
# CMD ["daphne", "-u", "/tmp/daphne.sock", "core.asgi:application"]
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "core.asgi:application"]

# CMD ["gunicorn", "--bind", ":8000", "--workers", "1", "--worker-class", "uvicorn.workers.UvicornWorker", "core.asgi:application"]


