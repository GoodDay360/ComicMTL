# syntax=docker/dockerfile:1.3
ARG PYTHON_VERSION=3.12-slim-bullseye

FROM python:${PYTHON_VERSION}

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN useradd -m -u 1000 user

RUN --mount=type=secret,id=HOST,required=true \
    --mount=type=secret,id=DJANGO_SECRET,required=true \
    --mount=type=secret,id=SECURE_TOKEN,required=true \
    --mount=type=secret,id=WORKER_TOKEN,required=true \
    --mount=type=secret,id=CLOUDFLARE_TURNSTILE_SECRET,required=true \
    --mount=type=secret,id=REDIS_URL,required=true \
    bash -c "printf 'HOST=\"%s\"\n' \"$(cat /run/secrets/HOST)\" >> /etc/profile.d/secrets.sh && \
             printf 'DJANGO_SECRET=\"%s\"\n' \"$(cat /run/secrets/DJANGO_SECRET)\" >> /etc/profile.d/secrets.sh && \
             printf 'SECURE_TOKEN=\"%s\"\n' \"$(cat /run/secrets/SECURE_TOKEN)\" >> /etc/profile.d/secrets.sh && \
             printf 'WORKER_TOKEN=\"%s\"\n' \"$(cat /run/secrets/WORKER_TOKEN)\" >> /etc/profile.d/secrets.sh && \
             printf 'CLOUDFLARE_TURNSTILE_SECRET=\"%s\"\n' \"$(cat /run/secrets/CLOUDFLARE_TURNSTILE_SECRET)\" >> /etc/profile.d/secrets.sh && \
             printf 'REDIS_URL=\"%s\"\n' \"$(cat /run/secrets/REDIS_URL)\" >> /etc/profile.d/secrets.sh"


RUN chown user:user /etc/profile.d/secrets.sh



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



USER user
ENV PATH="/home/user/.local/bin:$PATH"

RUN . /etc/profile.d/secrets.sh

# Install Python dependencies
COPY --chown=user requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /tmp/requirements.txt

# Copy application code
COPY --chown=user . /code
WORKDIR /code

RUN cat /etc/profile.d/secrets.sh

RUN . /etc/profile.d/secrets.sh && \
    bash -c 'python manage.py makemigrations && \
             python manage.py migrate --database=default && \
             python manage.py migrate --database=cache && \
             python manage.py migrate --database=DB1 && \
             python manage.py migrate --database=DB2'

CMD ["daphne", "-b", "0.0.0.0", "-p", "7860", "core.asgi:application"]
