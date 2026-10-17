<?php

/** @var TestCase $this */

use App\Providers\AppServiceProvider;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

/*
 | The production guard lives in AppServiceProvider::boot(). Each test swaps
 | the container's `env` binding (which Application::environment() reads) so a
 | production boot can be exercised without changing APP_ENV globally.
 */

test('debug is forced off when the app boots in production', function () {
    config(['app.debug' => true]);
    $this->app->instance('env', 'production');

    (new AppServiceProvider($this->app))->boot();

    expect(config('app.debug'))->toBeFalse();
});

test('debug stays on during local development', function () {
    config(['app.debug' => true]);
    $this->app->instance('env', 'local');

    (new AppServiceProvider($this->app))->boot();

    expect(config('app.debug'))->toBeTrue();
});

test('a production boot still on the log mailer warns that nothing will send', function () {
    Log::spy();

    config([
        'app.debug' => false,
        'mail.default' => 'log',
        'mail.from.address' => 'real@example.com',
    ]);
    $this->app->instance('env', 'production');

    (new AppServiceProvider($this->app))->boot();

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message): bool => str_contains($message, 'MAIL_MAILER'))
        ->once();
});

test('a production boot with real SMTP and a real sender says nothing', function () {
    Log::spy();

    config([
        'app.debug' => false,
        'mail.default' => 'smtp',
        'mail.from.address' => 'orders@vagary.example',
    ]);
    $this->app->instance('env', 'production');

    (new AppServiceProvider($this->app))->boot();

    Log::shouldNotHaveReceived('warning');
});

test('the placeholder from-address is called out in production', function () {
    Log::spy();

    config([
        'app.debug' => false,
        'mail.default' => 'smtp',
        'mail.from.address' => 'hello@example.com',
    ]);
    $this->app->instance('env', 'production');

    (new AppServiceProvider($this->app))->boot();

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message): bool => str_contains($message, 'MAIL_FROM_ADDRESS'))
        ->once();
});
