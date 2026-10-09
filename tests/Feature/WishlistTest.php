<?php

/** @var \Tests\TestCase $this */

use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;

/**
 * Builds a catalogue product so the wishlist tests do not depend on the seeder.
 */
function makeProduct(string $name = 'Argus G3'): Product
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

test('guests are sent to the login screen when trying to save a product', function () {
    $product = makeProduct();

    $this->post('/wishlist/'.$product->id)->assertRedirect('/login');
    $this->delete('/wishlist/'.$product->id)->assertRedirect('/login');

    expect(WishlistItem::count())->toBe(0);
});

test('a signed-in account can save a product', function () {
    $user = User::factory()->create();
    $product = makeProduct();

    $this->actingAs($user)->post('/wishlist/'.$product->id)->assertRedirect();

    expect($user->wishlistedProducts()->pluck('products.id')->all())->toBe([$product->id]);
});

test('saving the same product twice does not duplicate the row', function () {
    $user = User::factory()->create();
    $product = makeProduct();

    $this->actingAs($user)->post('/wishlist/'.$product->id)->assertRedirect();
    $this->actingAs($user)->post('/wishlist/'.$product->id)->assertRedirect();

    expect(WishlistItem::count())->toBe(1);
});

test('a signed-in account can remove a saved product', function () {
    $user = User::factory()->create();
    $product = makeProduct();

    $user->wishlistedProducts()->attach($product->id);

    $this->actingAs($user)->delete('/wishlist/'.$product->id)->assertRedirect();

    expect($user->wishlistedProducts()->count())->toBe(0);
});

test('the wishlist page lists the signed-in account products', function () {
    $user = User::factory()->create();
    $product = makeProduct('Xlim Pro 2');
    $user->wishlistedProducts()->attach($product->id);

    $this->actingAs($user)
        ->get('/wishlist')
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page->component('wishlist')->has('products', 1)->where('products.0.name', 'Xlim Pro 2')
        );
});

test('the wishlist page is only reachable by signed-in accounts', function () {
    $this->get('/wishlist')->assertRedirect('/login');
});

test('the marketplace shares the saved product ids with the storefront', function () {
    $user = User::factory()->create();
    $first = makeProduct('Argus G3');
    $second = makeProduct('Xlim Pro 2');
    $user->wishlistedProducts()->attach($second->id);

    $this->actingAs($user)
        ->get('/marketplace')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('marketplace')->where('wishlist', [$second->id]));
});

test('a guest is told the marketplace shortlist is empty', function () {
    $this->get('/marketplace')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('marketplace')->where('wishlist', []));
});
