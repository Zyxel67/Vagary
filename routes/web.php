<?php

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
    ]);
})->name('marketplace');

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

