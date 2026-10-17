<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('manage-products', function (User $user): bool {
            if ($user->is_admin) {
                return true;
            }

            /** @var list<string> $adminEmails */
            $adminEmails = config('vagary.admin_emails', []);

            return in_array($user->email, $adminEmails, true);
        });

        $this->guardProductionConfiguration();
    }

    /**
     * Make a misconfigured production deploy fail safe rather than noisy.
     *
     * These are the settings most easily left as they were during local
     * development, and each one is expensive to get wrong:
     *
     *  - APP_DEBUG=true renders stack traces containing APP_KEY, the database
     *    credentials and the queries being run;
     *  - MAIL_MAILER=log silently discards every email, so restock alerts and
     *    promos appear to work while nothing is delivered;
     *  - the placeholder from-address gets mail rejected or filed as spam.
     *
     * Debug is corrected outright; the other two cannot be fixed from here, so
     * they are written to the log where a deploy check will actually see them.
     */
    private function guardProductionConfiguration(): void
    {
        if (! app()->environment('production')) {
            return;
        }

        if (config('app.debug')) {
            config(['app.debug' => false]);

            Log::warning('APP_DEBUG was enabled with APP_ENV=production; forced off so stack traces cannot leak APP_KEY or database credentials.');
        }

        if (config('mail.default') === 'log') {
            Log::warning('MAIL_MAILER is still "log" with APP_ENV=production; no email will be delivered.');
        }

        if (str_contains((string) config('mail.from.address'), 'hello@example.com')) {
            Log::warning('MAIL_FROM_ADDRESS is still the Laravel placeholder; set a real sender address before sending mail.');
        }
    }
}
