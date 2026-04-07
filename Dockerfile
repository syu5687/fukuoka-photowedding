FROM php:8.1-apache

ENV PORT=8080

RUN a2enmod rewrite expires headers deflate

# ポートを8080に変更
RUN sed -i 's/Listen 80/Listen 8080/' /etc/apache2/ports.conf
RUN sed -i 's/<VirtualHost \*:80>/<VirtualHost *:8080>/' /etc/apache2/sites-enabled/000-default.conf

# AllowOverride All（.htaccess有効化）
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

COPY . /var/www/html

RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type f -exec chmod 644 {} \; \
    && find /var/var/html -type d -exec chmod 755 {} \; 2>/dev/null || true

EXPOSE 8080
