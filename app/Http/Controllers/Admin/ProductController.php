<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;
use App\Notifications\ProductPriceDropNotification;
use App\Notifications\ProductRestockedNotification;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Show the product management dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('admin/products/index', [
            'products' => Product::query()->orderBy('name')->get(),
            'stats' => [
                'total' => Product::query()->count(),
                'featured' => Product::query()->where('is_featured', true)->count(),
                'categories' => Product::query()->distinct()->count('category'),
                'averagePrice' => (int) round((float) (Product::query()->avg('price') ?? 0)),
            ],
        ]);
    }

    /**
     * Show the form for creating a product.
     */
    public function create(): Response
    {
        return Inertia::render('admin/products/create');
    }

    /**
     * Store a newly created product.
     */
    public function store(ProductRequest $request): RedirectResponse
    {
        $product = Product::query()->create($request->validated());

        return to_route('admin.products.index')->with('success', "\"{$product->name}\" was added to the catalogue.");
    }

    /**
     * Show the form for editing a product.
     */
    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/edit', [
            'product' => $product,
        ]);
    }

    /**
     * Update an existing product.
     */
    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        // Snapshot the alert-driving fields before saving so we can tell what
        // actually changed rather than emailing on every unrelated edit.
        $wasInStock = (bool) $product->in_stock;
        $previousPrice = $product->effectivePrice();

        $product->update($request->validated());

        $this->dispatchProductAlerts($product, $wasInStock, $previousPrice);

        return to_route('admin.products.index')->with('success', "\"{$product->name}\" was updated.");
    }

    /**
     * Email the wishlisters that care about a restock or a price drop.
     *
     * Only opted-in accounts are contacted, and the two signals are mutually
     * exclusive so an edit that both restocks and discounts an item sends one
     * email rather than two in a row.
     */
    private function dispatchProductAlerts(Product $product, bool $wasInStock, int $previousPrice): void
    {
        $cameBackIntoStock = $wasInStock === false && $product->in_stock === true;
        $priceDropped = $product->effectivePrice() < $previousPrice;

        if (! $cameBackIntoStock && ! $priceDropped) {
            return;
        }

        $recipients = $product->wishlistItems()
            ->with('user')
            ->get()
            ->map(fn (WishlistItem $item) => $item->user)
            ->filter(fn (?User $user): bool => $user !== null && (bool) $user->email_opt_in)
            ->values();

        foreach ($recipients as $user) {
            if ($cameBackIntoStock) {
                $user->notify(new ProductRestockedNotification($product));
            } else {
                $user->notify(new ProductPriceDropNotification($product, $previousPrice, $product->effectivePrice()));
            }
        }
    }

    /**
     * Remove a product from the catalogue.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $name = $product->name;
        $product->delete();

        return to_route('admin.products.index')->with('success', "\"{$name}\" was deleted.");
    }
}
