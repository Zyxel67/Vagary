<?php

use App\Http\Controllers\Admin\ProductController;
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
    });
