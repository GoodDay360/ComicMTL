# syntax=docker/dockerfile:1.3
ARG PYTHON_VERSION=3.12-slim-bullseye

FROM python:${PYTHON_VERSION}

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    g++ \
    wget \
    unzip \
    xvfb \
    libxi6 \
    libgconf-2-4 \
    gnupg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable

# Install ChromeDriver
RUN CHROMEDRIVER_VERSION=$(curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE) \
    && wget -O /tmp/chromedriver.zip http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip \
    && unzip /tmp/chromedriver.zip chromedriver -d /usr/local/bin/

RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Install Python dependencies
COPY --chown=user requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /tmp/requirements.txt

# Copy application code
COPY --chown=user . /code
WORKDIR /code

USER root
# Use secrets during build
RUN mkdir -p /secrets
RUN --mount=type=secret,id=HOST,required=true \
    --mount=type=secret,id=DJANGO_SECRET,required=true \
    --mount=type=secret,id=SECURE_TOKEN,required=true \
    --mount=type=secret,id=WORKER_TOKEN,required=true \
    --mount=type=secret,id=CLOUDFLARE_TURNSTILE_SECRET,required=true \
    --mount=type=secret,id=REDIS_URL,required=true \
    bash -c 'cp -r /run/secrets/* /secrets/'

RUN chown -R user:user /secrets
USER user

RUN bash -c 'export HOST=$(cat /secrets/HOST) && \
             export DJANGO_SECRET=$(cat /secrets/DJANGO_SECRET) && \
             export SECURE_TOKEN=$(cat /secrets/SECURE_TOKEN) && \
             export WORKER_TOKEN=$(cat /secrets/WORKER_TOKEN) && \
             export CLOUDFLARE_TURNSTILE_SECRET=$(cat /secrets/CLOUDFLARE_TURNSTILE_SECRET) && \
             export REDIS_URL=$(cat /secrets/REDIS_URL) && \
             python manage.py makemigrations && \
             python manage.py migrate --database=default && \
             python manage.py migrate --database=cache && \
             python manage.py migrate --database=DB1 && \
             python manage.py migrate --database=DB2'

USER root
RUN rm -rf /secrets
USER user

CMD ["uvicorn", "core.asgi:application", "--host", "0.0.0.0", "--port", "7860", "--log-level", "debug"]

