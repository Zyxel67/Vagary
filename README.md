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
| `APP_URL` | `http://localhost` |

### 4. Apache vhost (avoids needing `php artisan serve`)

Add this to `C:\xampp\apache\conf\extra\httpd-vhosts.conf` — adjust the path if your clone
lives somewhere other than `htdocs\Vagary`:

```apache
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot "C:/xampp/htdocs/Vagary/public"

    <Directory "C:/xampp/htdocs/Vagary/public">
        Options Indexes FollowSymLinks Includes ExecCGI
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Restart Apache. `mod_rewrite` must be enabled (it is by default in XAMPP) because
`public/.htaccess` needs it for pretty URLs.

> **Why `localhost` and not a custom host like `vagary.test`?** Google OAuth refuses to
> register redirect URIs on reserved TLDs such as `.test` — only `localhost` or a public
> top-level domain are accepted. No `hosts` file entry is needed either.

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

Open **http://localhost**

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

Every marketing email carries:

- a **Notification settings** button, and
- `List-Unsubscribe` / `List-Unsubscribe-Post` headers so Gmail and Outlook can
  show their own Unsubscribe link.

One-click unsubscribe hits a **signed** URL rather than a logged-in session (the POST
comes from the mail provider's servers), so that route is exempted from CSRF
verification in `bootstrap/app.php` — its protection is the HMAC signature.

Promos sent from the admin tab are recorded in the `promos` table with their audience
size and sender, and an identical subject + body inside ten minutes is refused rather
than sent twice.

## Deploying

The app refuses to stay insecurely configured: when `APP_ENV=production`,
`AppServiceProvider` **forces `APP_DEBUG` off** (stack traces would otherwise
expose `APP_KEY` and database credentials) and writes a warning to the log if
`MAIL_MAILER` is still `log` or `MAIL_FROM_ADDRESS` is still the Laravel
placeholder.

**1. Create the production env** (git-ignored — never commit it):

```bash
cp .env.production.example .env.production
```

**2. Fill in the four values that matter:**

| Key | Value |
| --- | --- |
| `APP_URL` | Exact public URL, no trailing slash |
| `GOOGLE_REDIRECT_URI` | `{APP_URL}/auth/google/callback` — must match Google Cloud Console → APIs & Credentials → Authorised redirect URIs |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Gmail address and a 16-char **App Password** (`myaccount.google.com/apppasswords`) — your normal password will be rejected |
| `MAIL_FROM_ADDRESS` | A real sender on your domain |

> Reserved TLDs (`.test`, `.local`) are refused by Google for the redirect URI.
> Use a public domain, or `localhost` while developing.

**3. Build and migrate:**

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan view:cache
```

**4. Queue worker.** Notifications send synchronously so no worker is required
at small volume. If you enable `ShouldQueue`, or send promos to a large list,
run `php artisan queue:work` under a process manager.

**5. Point the web server at `public/`** — never at the repository root.

## Tests

```bash
php artisan test
```

Tests run on an in-memory SQLite database, so MySQL does not need to be running.
