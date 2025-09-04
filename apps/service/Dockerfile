FROM php:8.4-apache as development

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    && docker-php-ext-install zip pdo pdo_mysql

# Enable Apache modules
RUN a2enmod rewrite

# Enable php logs
RUN { \
    echo "log_errors = On"; \
    echo "error_reporting = E_ALL"; \
    echo "display_errors = Off"; \
    echo "display_startup_errors = Off"; \
    echo "error_log = /proc/self/fd/2"; \
} > /usr/local/etc/php/conf.d/error-logging.ini

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-interaction --optimize-autoloader

# Copy application files
COPY . .

# Set permissions
RUN chown -R www-data:www-data /app && \
    chown -R www-data:www-data /var/www/html