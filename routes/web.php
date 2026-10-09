<?php

use App\Http\Controllers\WishlistController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard', [
        'products' => Product::query()->where('is_featured', true)->orderBy('id')->get(),
    ]);
})->name('dashboard');

Route::get('marketplace', function () {
    return Inertia::render('marketplace', [
        'products' => Product::query()->orderBy('id')->get(),
        // Shortlist ids for the signed-in account, so the storefront can render
        // the saved state from the database instead of browser storage.
        'wishlist' => fn () => auth()->user()?->wishlistItems()->pluck('product_id') ?? [],
    ]);
})->name('marketplace');

Route::middleware('auth')->group(function () {
    Route::post('wishlist/{product}', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('wishlist/{product}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');

    Route::get('wishlist', function () {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        return Inertia::render('wishlist', [
            'products' => $user->wishlistedProducts()->orderBy('wishlist_items.created_at', 'desc')->get(),
        ]);
    })->name('wishlist');
});

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

