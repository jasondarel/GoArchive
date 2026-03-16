FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions for Laravel & PostgreSQL
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

CMD bash -c "composer install && if [ ! -f .env ]; then cp .env.example .env; fi && php artisan key:generate && php artisan optimize:clear && sed -i 's/DB_HOST=127.0.0.1/DB_HOST=db/' .env && sed -i 's/DB_USERNAME=postgres/DB_USERNAME=goarchive_user/' .env && sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=secret/' .env && php artisan storage:link --force && php artisan migrate:fresh --seed --force && php artisan serve --host=0.0.0.0 --port=8000"
