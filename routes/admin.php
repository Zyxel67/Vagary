<?php

use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\PromoController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WishlistController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'can:manage-products'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::redirect('/', '/admin/products')->name('home');

        Route::controller(ProductController::class)->group(function () {
            Route::get('products', 'index')->name('products.index');
            Route::get('products/create', 'create')->name('products.create');
            Route::post('products', 'store')->name('products.store');
            Route::get('products/{product}/edit', 'edit')->name('products.edit');
            Route::put('products/{product}', 'update')->name('products.update');
            Route::delete('products/{product}', 'destroy')->name('products.destroy');
        });

        // Read-only: every account's shortlist, grouped by buyer.
        Route::get('wishlists', [WishlistController::class, 'index'])->name('wishlists.index');

        Route::controller(PromoController::class)->group(function () {
            Route::get('promos', 'index')->name('promos.index');
            Route::post('promos', 'store')->name('promos.store');
        });

        Route::controller(UserController::class)->group(function () {
            Route::get('users', 'index')->name('users.index');
            Route::put('users/{user}', 'update')->name('users.update');
            Route::delete('users/{user}', 'destroy')->name('users.destroy');
        });
    });
