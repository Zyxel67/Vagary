<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * List every account with its admin flag and shortlist size.
     */
    public function index(): Response
    {
        $users = User::query()
            ->withCount('wishlistItems')
            ->orderByDesc('is_admin')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'is_admin' => (bool) $user->is_admin,
                'has_google' => $user->google_id !== null,
                'saved_count' => $user->wishlist_items_count,
                'created_at' => $user->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'stats' => [
                'total' => count($users),
                'admins' => collect($users)->where('is_admin', true)->count(),
                'google' => collect($users)->where('has_google', true)->count(),
            ],
        ]);
    }

    /**
     * Toggle the admin flag for an account.
     *
     * The current user cannot demote themselves, which keeps at least one
     * administrator in place and avoids locking everyone out of the panel.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'is_admin' => ['required', 'boolean'],
        ]);

        if ($request->user()->is($user) && ! $validated['is_admin']) {
            return back()->with('success', 'You cannot remove your own admin access.');
        }

        $user->update(['is_admin' => $validated['is_admin']]);

        return back()->with('success', sprintf(
            '%s is %s an administrator.',
            $user->name,
            $validated['is_admin'] ? 'now' : 'no longer',
        ));
    }

    /**
     * Remove an account. Administrators cannot delete themselves.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->is($user)) {
            return back()->with('success', 'You cannot delete your own account from here.');
        }

        $name = $user->name;
        $user->delete();

        return back()->with('success', "\"{$name}\" was removed.");
    }
}