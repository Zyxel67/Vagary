<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    /**
     * Read-only overview of every account's shortlist, grouped by buyer.
     */
    public function index(): Response
    {
        $accounts = User::query()
            ->withCount('wishlistItems')
            ->with(['wishlistedProducts' => fn ($query) => $query->orderBy('wishlist_items.created_at', 'desc')])
            ->whereHas('wishlistItems')
            ->orderByDesc('wishlist_items_count')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'saved_count' => $user->wishlist_items_count,
                'products' => $user->wishlistedProducts
                    ->map(fn (Product $product): array => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'price' => $product->price,
                        'image' => $product->image,
                    ])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();

        // Ordered in PHP rather than with a HAVING clause: filtering on a
        // counted sub-select has no aggregate to group by, which SQLite rejects
        // outright and MySQL would silently collapse into one row.
        $topProduct = Product::query()
            ->withCount('wishlistItems')
            ->orderByDesc('wishlist_items_count')
            ->first();

        if ($topProduct !== null && $topProduct->wishlist_items_count === 0) {
            $topProduct = null;
        }

        return Inertia::render('admin/wishlists/index', [
            'accounts' => $accounts,
            'stats' => [
                'saved' => WishlistItem::query()->count(),
                'accounts' => count($accounts),
                'topProduct' => $topProduct?->name,
                'topProductCount' => $topProduct?->wishlist_items_count ?? 0,
            ],
        ]);
    }
}