<?php

use App\Http\Controllers\Settings\NotificationController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
 | One-click unsubscribe, as used by the List-Unsubscribe header.
 |
 | Signed rather than authenticated: the POST arrives from the mail provider's
 | servers, not from a browser with a session. The signature proves Laravel
 | generated the link, and the target is only ever an opt-out.
 */
Route::post('email/unsubscribe/{user}', [NotificationController::class, 'unsubscribe'])
    ->middleware(['signed', 'throttle:10,1'])
    ->name('email.unsubscribe');

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/notifications', [NotificationController::class, 'edit'])->name('notifications.edit');
    Route::patch('settings/notifications', [NotificationController::class, 'update'])->name('notifications.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
