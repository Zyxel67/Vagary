<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Save a product to the signed-in account's shortlist.
     *
     * Uses syncWithoutDetaching so tapping save twice is harmless instead of
     * tripping the unique index on (user_id, product_id).
     */
    public function store(Request $request, Product $product): RedirectResponse
    {
        $request->user()->wishlistedProducts()->syncWithoutDetaching([$product->id]);

        return back();
    }

    /**
     * Remove a product from the signed-in account's shortlist.
     */
    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $request->user()->wishlistedProducts()->detach($product->id);

        return back();
    }
}