<?php

/** @var \Tests\TestCase $this */

use App\Models\Product;
use App\Models\User;
use App\Notifications\ProductPriceDropNotification;
use App\Notifications\ProductRestockedNotification;
use App\Notifications\PromoNotification;
use Illuminate\Support\Facades\Notification;

function alertAdmin(): User
{
    return User::factory()->create(['is_admin' => true]);
}

/**
 * Builds a product priced in rupiah so the alert tests do not depend on the seeder.
 */
function alertProduct(string $name = 'Argus G3'): Product
{
    return Product::create([
        'name' => $name,
        'price' => 97000,
        'tag' => 'New arrival',
        'category' => 'Case',
        'color' => 'bg-stone-200',
        'image' => '/images/case/Argus-G3/IMG-20250708-WA0001.jpg',
        'gallery' => ['/images/case/Argus-G3/IMG-20250708-WA0001.jpg'],
        'specs' => [['label' => 'Format', 'value' => 'Protective case']],
        'marketplace_url' => null,
        'is_featured' => true,
        'in_stock' => true,
        'sale_price' => null,
    ]);
}

/**
 * Full admin form payload for a product, with per-test overrides on top.
 *
 * @return array<string, mixed>
 */
function alertPayload(Product $product, array $overrides = []): array
{
    return array_merge([
        'name' => $product->name,
        'price' => $product->price,
        'tag' => $product->tag,
        'category' => $product->category,
        'color' => $product->color,
        'image' => $product->image,
        'gallery' => $product->gallery,
        'specs' => $product->specs,
        'marketplace_url' => $product->marketplace_url,
        'is_featured' => $product->is_featured,
        'in_stock' => $product->in_stock,
        'sale_price' => $product->sale_price,
    ], $overrides);
}

test('restocking a saved product emails opted-in wishlisters', function () {
    $admin = alertAdmin();
    $fan = User::factory()->create(['email_opt_in' => true]);
    $product = alertProduct();
    $fan->wishlistedProducts()->attach($product->id);

    Notification::fake();

    // Taking it out of stock is not the news anyone wants, so nothing is sent.
    $this->actingAs($admin)
        ->put('/admin/products/'.$product->id, alertPayload($product, ['in_stock' => false]))
        ->assertRedirect();

    Notification::assertNothingSent();

    // Putting it back is the signal everyone was waiting for.
    $this->actingAs($admin)
        ->put('/admin/products/'.$product->id, alertPayload($product, ['in_stock' => true]))
        ->assertRedirect();

    Notification::assertSentTo($fan, ProductRestockedNotification::class);
});

test('restocking skips accounts that never opted in', function () {
    $admin = alertAdmin();
    $declined = User::factory()->create(['email_opt_in' => false]);
    $product = alertProduct();
    $declined->wishlistedProducts()->attach($product->id);

    Notification::fake();

    $this->actingAs($admin)
        ->put('/admin/products/'.$product->id, alertPayload($product, ['in_stock' => false]))
        ->assertRedirect();
    $this->actingAs($admin)
        ->put('/admin/products/'.$product->id, alertPayload($product, ['in_stock' => true]))
        ->assertRedirect();

    Notification::assertNothingSent();
});

test('restocking does not email accounts that did not save the product', function () {
    $admin = alertAdmin();
    $bystander = User::factory()->create(['email_opt_in' => true]);
    $product = alertProduct();

    Notification::fake();

    $this->actingAs($admin)
        ->put('/admin/products/'.$product->id, alertPayload($product, ['in_stock' => false]))
        ->assertRedirect();
    $this->actingAs($admin)
        ->put('/admin/products/'.$product->id, alertPayload($product, ['in_stock' => true]))
        ->assertRedirect();

    Notification::assertNotSentTo($bystander, ProductRestockedNotification::class);
});

test('dropping the price emails opted-in wishlisters with both prices', function () {
    $admin = alertAdmin();
    $fan = User::factory()->create(['email_opt_in' => true]);
    $product = alertProduct('Xlim Pro 2');
    $fan->wishlistedProducts()->attach($product->id);

    Notification::fake();

    $this->actingAs($admin)
        ->put('/admin/products/'.$product->id, alertPayload($product, ['sale_price' => 80000]))
        ->assertRedirect();

    Notification::assertSentTo(
        $fan,
        ProductPriceDropNotification::class,
        fn (ProductPriceDropNotification $notification) => $notification->previousPrice === 97000
            && $notification->newPrice === 80000
    );
});

test('raising the price sends nothing', function () {
    $admin = alertAdmin();
    $fan = User::factory()->create(['email_opt_in' => true]);
    $product = alertProduct();
    $fan->wishlistedProducts()->attach($product->id);

    Notification::fake();

    $this->actingAs($admin)
        ->put('/admin/products/'.$product->id, alertPayload($product, ['price' => 120000]))
        ->assertRedirect();

    Notification::assertNothingSent();
});

test('a promo reaches every opted-in account and nobody else', function () {
    $admin = alertAdmin();
    $subscribed = User::factory()->create(['email_opt_in' => true]);
    $unsubscribed = User::factory()->create(['email_opt_in' => false]);

    Notification::fake();

    $this->actingAs($admin)
        ->post('/admin/promos', [
            'subject' => 'Weekend sale',
            'message' => 'Fifteen percent off every leather case this weekend.',
            'url' => 'https://example.com/sale',
            'cta_label' => 'Shop the sale',
        ])
        ->assertRedirect();

    Notification::assertSentTo($subscribed, PromoNotification::class);
    Notification::assertNotSentTo($unsubscribed, PromoNotification::class);
    Notification::assertNotSentTo($admin, PromoNotification::class);
});

test('a regular account cannot send promos', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)
        ->post('/admin/promos', [
            'subject' => 'Weekend sale',
            'message' => 'Fifteen percent off every leather case this weekend.',
        ])
        ->assertForbidden();
});

test('a promo needs a message before it can be sent', function () {
    $this->actingAs(alertAdmin())
        ->post('/admin/promos', ['subject' => 'Weekend sale', 'message' => ''])
        ->assertSessionHasErrors('message');
});

test('an account can turn email notifications on and off', function () {
    $user = User::factory()->create(['email_opt_in' => false]);

    $this->actingAs($user)
        ->patch('/settings/notifications', ['email_opt_in' => true])
        ->assertRedirect('/settings/notifications');
    expect($user->fresh()->email_opt_in)->toBeTrue();

    $this->actingAs($user)
        ->patch('/settings/notifications', ['email_opt_in' => false])
        ->assertRedirect('/settings/notifications');
    expect($user->fresh()->email_opt_in)->toBeFalse();
});

test('the notification settings page renders', function () {
    $this->actingAs(User::factory()->create())
        ->get('/settings/notifications')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/notifications'));
});

test('notifications refuse to send to an account that opted out', function () {
    $optedOut = User::factory()->create(['email_opt_in' => false]);
    $optedIn = User::factory()->create(['email_opt_in' => true]);

    expect((new ProductRestockedNotification(alertProduct('First')))->via($optedOut))->toBe([])
        ->and((new ProductRestockedNotification(alertProduct('Second')))->via($optedIn))->toBe(['mail']);
});

test('a restock email formats its prices as rupiah', function () {
    $product = alertProduct('Xros 5');
    $product->update(['price' => 109000, 'sale_price' => 95000]);

    $mail = (new ProductPriceDropNotification($product->fresh(), 109000, 95000))
        ->toMail(User::factory()->create(['name' => 'Rani']));

    expect(implode(' ', $mail->introLines))->toContain('Rp 109.000')->toContain('Rp 95.000');
});

test('the promos tab renders with the size of the subscriber list', function () {
    User::factory()->create(['email_opt_in' => true]);
    User::factory()->create(['email_opt_in' => false]);

    $this->actingAs(alertAdmin())
        ->get('/admin/promos')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/promos/index')->where('stats.audience', 1));
});

