<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Show the email preferences screen.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/notifications');
    }

    /**
     * Store the marketing opt-in choice for the signed-in account.
     *
     * Always a single boolean read straight off the form, so a checkbox that
     * was cleared arrives as false rather than silently keeping its old value.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // `present` rather than `required` so an explicit opt-out (false)
            // passes validation instead of being treated as a missing value.
            'email_opt_in' => ['present', 'boolean'],
        ]);

        $request->user()->update($validated);

        return to_route('notifications.edit');
    }
}