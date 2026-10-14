<?php

/** @var \Tests\TestCase $this */

use App\Models\Product;
use Database\Seeders\ProductSeeder;

/**
 * Resolves every image path a product would render and returns the ones that
 * do not exist on disk.
 *
 * Runs the real filesystem rather than Storage::fake() on purpose: this is
 * here to catch case mismatches (`/images/case` vs `images/Case`), which pass
 * on a Windows dev machine and 404 everywhere on Linux.
 *
 * @return list<string>
 */
function missingCatalogueImages(): array
{
    $paths = [];

    foreach (Product::query()->get() as $product) {
        $paths = array_merge($paths, [$product->image], $product->gallery ?? []);
    }

    // Paths are URL-encoded (a space is %20) because they go straight into
    // <img src>; the filesystem needs them decoded again.
    return array_values(array_filter(
        array_unique($paths),
        fn (string $path): bool => ! file_exists(public_path(urldecode(ltrim($path, '/')))),
    ));
}

test('every seeded product image exists on disk with the right casing', function () {
    $this->seed(ProductSeeder::class);

    expect(missingCatalogueImages())->toBe([]);
});

test('the seeded image paths use the capitalised Case folder', function () {
    $this->seed(ProductSeeder::class);

    expect(Product::query()->pluck('image')->reject(fn (string $path) => str_starts_with($path, '/images/Case/'))->all())
        ->toBe([]);
});