<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\PromoNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromoController extends Controller
{
    /**
     * Show the promo composer with the size of the opted-in audience.
     */
    public function index(): Response
    {
        return Inertia::render('admin/promos/index', [
            'stats' => [
                'audience' => User::query()->where('email_opt_in', true)->count(),
                'total' => User::query()->count(),
            ],
        ]);
    }

    /**
     * Send a promo to every account that opted in.
     *
     * The opt-in filter happens here rather than only inside the notification,
     * so nobody outside the audience is even iterated over.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:120'],
            'message' => ['required', 'string', 'max:2000'],
            'url' => ['nullable', 'url', 'max:2048'],
            'cta_label' => ['nullable', 'string', 'max:60'],
        ], [
            'message.required' => 'Write the promo your subscribers will receive.',
            'subject.max' => 'Keep the subject line under 120 characters.',
        ]);

        $audience = User::query()->where('email_opt_in', true)->get();

        foreach ($audience as $user) {
            $user->notify(new PromoNotification(
                subject: $validated['subject'],
                message: $validated['message'],
                url: $validated['url'] ?? null,
                ctaLabel: $validated['cta_label'] !== '' && $validated['cta_label'] !== null
                    ? $validated['cta_label']
                    : 'Shop now',
            ));
        }

        return back()->with('success', sprintf(
            'Promo sent to %d subscriber%s.',
            $audience->count(),
            $audience->count() === 1 ? '' : 's',
        ));
    }
}