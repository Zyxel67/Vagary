<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promo;
use App\Models\User;
use App\Notifications\PromoNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromoController extends Controller
{
    /**
     * Show the promo composer, the audience size and what already went out.
     */
    public function index(): Response
    {
        return Inertia::render('admin/promos/index', [
            'stats' => [
                'audience' => User::query()->where('email_opt_in', true)->count(),
                'total' => User::query()->count(),
            ],
            'recent' => Promo::query()
                ->with('sender')
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (Promo $promo): array => [
                    'id' => $promo->id,
                    'subject' => $promo->subject,
                    'recipients' => $promo->recipients,
                    'sent_by' => $promo->sender?->name ?? 'Deleted account',
                    'sent_at' => $promo->created_at?->toIso8601String(),
                ])
                ->values()
                ->all(),
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

        // The same words twice within ten minutes is almost always a double
        // click rather than a second campaign, so refuse before anyone is
        // emailed again.
        $isDuplicate = Promo::query()
            ->where('subject', $validated['subject'])
            ->where('message', $validated['message'])
            ->where('created_at', '>=', now()->subMinutes(10))
            ->exists();

        if ($isDuplicate) {
            return back()->withErrors([
                'subject' => 'An identical promo was already sent in the last 10 minutes. Nothing was sent again.',
            ]);
        }

        $ctaLabel = trim((string) ($validated['cta_label'] ?? ''));
        $ctaLabel = $ctaLabel !== '' ? $ctaLabel : 'Shop now';

        $audience = User::query()->where('email_opt_in', true)->get();

        foreach ($audience as $user) {
            $user->notify(new PromoNotification(
                subject: $validated['subject'],
                message: $validated['message'],
                url: $validated['url'] ?? null,
                ctaLabel: $ctaLabel,
            ));
        }

        // Recorded after sending so the history reflects what actually went
        // out, including the exact size of that audience.
        Promo::create([
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'url' => $validated['url'] ?? null,
            'cta_label' => $ctaLabel,
            'recipients' => $audience->count(),
        ]);

        return back()->with('success', sprintf(
            'Promo sent to %d subscriber%s.',
            $audience->count(),
            $audience->count() === 1 ? '' : 's',
        ));
    }
}