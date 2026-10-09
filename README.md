# Vagary

A leather-case storefront and catalogue admin, built with **Laravel 12 · React (Inertia) · Tailwind CSS**.

Shoppers browse a marketplace and save products to an **account-backed wishlist**. Accounts that opt in receive **restock**, **price-drop** and **promo** emails. Admins run the whole thing from a tabbed panel.

## Requirements

- PHP 8.2+ with `pdo_mysql`
- XAMPP (Apache + MySQL/MariaDB)
- Node 18+

## Setup

### 1. Dependencies

```bash
composer install
npm install
```

### 2. Database

Start **MySQL** in the XAMPP Control Panel, then create the database:

```bash
mysql -u root -e "CREATE DATABASE vagary DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. Environment

```bash
cp .env.example .env
php artisan key:generate
```

Check these values in `.env`:

| Key | Value |
| --- | --- |
| `DB_CONNECTION` | `mysql` |
| `DB_DATABASE` | `vagary` |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / *(empty on a default XAMPP)* |
| `APP_URL` | `http://vagary.test` |

### 4. Apache vhost (avoids needing `php artisan serve`)

Add this to `C:\xampp\apache\conf\extra\httpd-vhosts.conf` — adjust the path if your clone
lives somewhere other than `htdocs\Vagary`:

```apache
<VirtualHost *:80>
    ServerName vagary.test
    DocumentRoot "C:/xampp/htdocs/Vagary/public"

    <Directory "C:/xampp/htdocs/Vagary/public">
        Options Indexes FollowSymLinks Includes ExecCGI
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Then add this line to `C:\Windows\System32\drivers\etc\hosts` **as Administrator**:

```
127.0.0.1 vagary.test
```

Restart Apache. `mod_rewrite` must be enabled (it is by default in XAMPP) because
`public/.htaccess` needs it for pretty URLs.

> No vhost? Then run `php artisan serve` and use `http://localhost:8000` — just remember to
> set `APP_URL` to match.

### 5. Migrate and seed

```bash
php artisan migrate --seed
```

### 6. Build assets

```bash
npm run dev      # development, with HMR
npm run build    # production
```

Open **http://vagary.test**

## Admin access

An account can reach `/admin/*` when either is true:

- `users.is_admin` is `true`, **or**
- its email is in the comma-separated `VAGARY_ADMIN_EMAILS` env var

Tabs: **Products · Wishlists · Promos · Users**

Product edits drive the alerts: flipping **In stock** back on emails everyone who saved that
item, and lowering the **Sale price** emails them the new price.

## Email

`MAIL_MAILER=log` by default, so messages are rendered into `storage/logs/laravel.log`
instead of being delivered — nothing leaves your machine until you change it.

For real delivery with Gmail (use a Google **App Password**, not your account password):

```ini
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=you@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM_ADDRESS=you@gmail.com
MAIL_FROM_NAME="Vagary"
```

Only accounts that opt in at **Settings → Notifications** are ever emailed.

## Tests

```bash
php artisan test
```

Tests run on an in-memory SQLite database, so MySQL does not need to be running.
