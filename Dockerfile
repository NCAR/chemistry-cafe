# Runs the version 1 Chemistry Cafe (AngularJS + PHP + PostgreSQL) for local tests.
FROM php:7.4-apache

# The base image uses Debian 11 (bullseye). Debian moved bullseye to the archive mirror.
RUN printf '%s\n' \
        'deb http://archive.debian.org/debian bullseye main' \
        'deb http://archive.debian.org/debian bullseye-updates main' \
        'deb http://archive.debian.org/debian-security bullseye-security main' \
        > /etc/apt/sources.list \
    && rm -f /etc/apt/sources.list.d/* \
    && apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pgsql \
    && rm -rf /var/lib/apt/lists/*

# The production server serves the app from /home/www/html.
# php/tags.php uses that path for the campp skeleton files.
ENV APACHE_DOCUMENT_ROOT=/home/www/html
RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
        /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf

COPY . /home/www/html

RUN mkdir -p /home/www/html/tag_files \
    && chown -R www-data:www-data /home/www/html
