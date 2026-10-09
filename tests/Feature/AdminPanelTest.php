<?php

/** @var \Tests\TestCase $this */

use App\Models\Product;
use App\Models\User;

/**
 * Builds a catalogue product so the admin tests do not depend on the seeder.
 */
function makeAdminProduct(string $name = 'Argus G3'): Product
{
    return Product::create([
        'name' => $name,
        'price' => 109,
        'tag' => 'New arrival',
        'category' => 'Case',
        'color' => 'bg-stone-200',
        'image' => '/images/case/Argus-G3/IMG-20250708-WA0001.jpg',
        'gallery' => ['/images/case/Argus-G3/IMG-20250708-WA0001.jpg'],
        'specs' => [['label' => 'Format', 'value' => 'Protective case']],
        'marketplace_url' => null,
        'is_featured' => true,
    ]);
}

function adminUser(array $attributes = []): User
{
    return User::factory()->create(['is_admin' => true] + $attributes);
}

test('guests are redirected away from the admin tabs', function () {
    $this->get('/admin/products')->assertRedirect('/login');
    $this->get('/admin/wishlists')->assertRedirect('/login');
    $this->get('/admin/users')->assertRedirect('/login');
});

test('a regular account cannot reach the admin tabs', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get('/admin/products')->assertForbidden();
    $this->actingAs($user)->get('/admin/wishlists')->assertForbidden();
    $this->actingAs($user)->get('/admin/users')->assertForbidden();
});

test('the admin products tab renders', function () {
    $this->actingAs(adminUser())
        ->get('/admin/products')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/products/index'));
});

test('an account listed in VAGARY_ADMIN_EMAILS can reach the admin tabs', function () {
    config(['vagary.admin_emails' => ['curator@example.com']]);
    $user = User::factory()->create(['email' => 'curator@example.com', 'is_admin' => false]);

    $this->actingAs($user)->get('/admin/products')->assertOk();
});

test('the wishlists tab groups saved products by account', function () {
    $buyer = User::factory()->create(['name' => 'Rani']);
    $product = makeAdminProduct('Xlim Pro 2');
    $buyer->wishlistedProducts()->attach($product->id);

    $this->actingAs(adminUser())
        ->get('/admin/wishlists')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/wishlists/index')
            ->where('accounts.0.email', $buyer->email)
            ->where('accounts.0.saved_count', 1)
            ->where('accounts.0.products.0.name', 'Xlim Pro 2'));
});

test('the wishlists tab is empty until somebody saves something', function () {
    $this->actingAs(adminUser())
        ->get('/admin/wishlists')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/wishlists/index')->where('accounts', []));
});

test('the users tab lists every account', function () {
    $admin = adminUser(['name' => 'Admin']);
    $buyer = User::factory()->create(['name' => 'Buyer', 'is_admin' => false]);

    $this->actingAs($admin)
        ->get('/admin/users')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/users/index')
            ->where('stats.total', 2)
            ->where('stats.admins', 1)
            ->where('users.0.name', 'Admin'));
});
