FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git unzip libpq-dev curl \
 && docker-php-ext-install pdo pdo_pgsql \
 && curl -1sLf 'https://dl.cloudsmith.io/public/symfony/stable/setup.deb.sh' | bash \
 && apt-get install -y symfony-cli \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app