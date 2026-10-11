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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
        $product = Product::query()->create($this->resolveProductImages($request, $request->validated()));

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

        $product->update($this->resolveProductImages($request, $request->validated(), $product));

        $this->dispatchProductAlerts($product, $wasInStock, $previousPrice);

        return to_route('admin.products.index')->with('success', "\"{$product->name}\" was updated.");
    }

    /**
     * Turn freshly uploaded images into public URLs, replacing the path fields
     * the form also submits.
     *
     * Stored values keep the same shape as the seeded `/images/case/...` paths
     * (a leading slash), so every downstream `<img src>` works unchanged.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function resolveProductImages(ProductRequest $request, array $validated, ?Product $product = null): array
    {
        if ($request->hasFile('image_file')) {
            $previous = $product?->image ?? $validated['image'] ?? null;
            $validated['image'] = $this->storeProductImage($request->file('image_file'));
            $this->forgetStoredImage($previous);
        }

        if ($request->hasFile('gallery_files')) {
            $uploaded = array_values(array_map(
                fn ($file): string => $this->storeProductImage($file),
                $request->file('gallery_files'),
            ));

            // Appended, not replaced, so editing an existing product keeps the
            // gallery it already had instead of silently wiping it.
            $validated['gallery'] = array_values(array_merge($validated['gallery'] ?? [], $uploaded));
        }

        // These keys only exist to carry the uploads; the model has no columns
        // for them and they must not reach create()/update().
        unset($validated['image_file'], $validated['gallery_files']);

        return $validated;
    }

    /**
     * Store an uploaded image on the public disk and return its public URL.
     */
    private function storeProductImage(UploadedFile $file): string
    {
        return '/storage/'.$file->store('products', 'public');
    }

    /**
     * Remove a file we uploaded, leaving seeded paths and remote URLs alone.
     */
    private function forgetStoredImage(?string $path): void
    {
        if ($path === null || ! str_starts_with($path, '/storage/products/')) {
            return;
        }

        Storage::disk('public')->delete(substr($path, strlen('/storage/')));
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

        // Only files under /storage/products are touched; seeded catalogue
        // images in /images stay on disk.
        $this->forgetStoredImage($product->image);
        foreach ($product->gallery ?? [] as $path) {
            $this->forgetStoredImage($path);
        }

        $product->delete();

        return to_route('admin.products.index')->with('success', "\"{$name}\" was deleted.");
    }
}
