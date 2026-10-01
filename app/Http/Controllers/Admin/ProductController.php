<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Product;
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
        $product->update($request->validated());

        return to_route('admin.products.index')->with('success', "\"{$product->name}\" was updated.");
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
