<?php

/** @var \Tests\TestCase $this */

use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/** A real 1x1 PNG. GD is unavailable here, so the bytes are embedded. */
function uploadPng(string $name = 'photo.png'): UploadedFile
{
    return UploadedFile::fake()->createWithContent($name, base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    ));
}

function uploadAdmin(): User
{
    return User::factory()->create(['is_admin' => true]);
}

/**
 * Full admin form payload, with per-test overrides on top.
 *
 * @return array<string, mixed>
 */
function uploadPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Uploaded Case',
        'price' => 150000,
        'tag' => 'New arrival',
        'category' => 'Case',
        'color' => 'bg-stone-200',
        'image' => '',
        'gallery' => [],
        'specs' => [],
        'marketplace_url' => null,
        'is_featured' => true,
        'in_stock' => true,
        'sale_price' => null,
    ], $overrides);
}

test('an admin can upload a main image instead of typing a path', function () {
    Storage::fake('public');

    $this->actingAs(uploadAdmin())
        ->post('/admin/products', uploadPayload(['image_file' => uploadPng()]))
        ->assertRedirect();

    $product = Product::query()->firstOrFail();

    expect($product->image)->toStartWith('/storage/products/')
        ->and(Storage::disk('public')->exists(Str::after($product->image, '/storage/')))->toBeTrue();
});

test('a product still needs an image from one source or another', function () {
    Storage::fake('public');

    $this->actingAs(uploadAdmin())
        ->post('/admin/products', uploadPayload(['image' => '']))
        ->assertSessionHasErrors('image');

    expect(Product::query()->count())->toBe(0);
});

test('an image path on its own still works, so the seeded catalogue survives', function () {
    Storage::fake('public');

    $this->actingAs(uploadAdmin())
        ->post('/admin/products', uploadPayload(['image' => '/images/case/existing.jpg']))
        ->assertRedirect();

    expect(Product::query()->firstOrFail()->image)->toBe('/images/case/existing.jpg');
});

test('uploaded gallery images are appended to the gallery already listed', function () {
    Storage::fake('public');

    $this->actingAs(uploadAdmin())
        ->post('/admin/products', uploadPayload([
            'image' => '/images/case/hero.jpg',
            'gallery' => ['/images/case/one.jpg'],
            'gallery_files' => [uploadPng('a.png'), uploadPng('b.png')],
        ]))
        ->assertRedirect();

    $gallery = Product::query()->firstOrFail()->gallery;

    expect($gallery)->toHaveCount(3)
        ->and($gallery[0])->toBe('/images/case/one.jpg')
        ->and($gallery[1])->toStartWith('/storage/products/')
        ->and($gallery[2])->toStartWith('/storage/products/');
});

test('replacing the main image deletes the previous uploaded file', function () {
    Storage::fake('public');

    $this->actingAs(uploadAdmin())
        ->post('/admin/products', uploadPayload(['image_file' => uploadPng('first.png')]))
        ->assertRedirect();

    $product = Product::query()->firstOrFail();
    $previous = Str::after($product->image, '/storage/');
    expect(Storage::disk('public')->exists($previous))->toBeTrue();

    $this->actingAs(uploadAdmin())
        ->put('/admin/products/'.$product->id, uploadPayload([
            'name' => $product->name,
            'image' => '',
            'image_file' => uploadPng('second.png'),
        ]))
        ->assertRedirect();

    expect(Product::query()->firstOrFail()->image)->not->toBe('/storage/'.$previous)
        ->and(Storage::disk('public')->exists($previous))->toBeFalse();
});

test('deleting a product removes the files it uploaded', function () {
    Storage::fake('public');

    $this->actingAs(uploadAdmin())
        ->post('/admin/products', uploadPayload([
            'image_file' => uploadPng('hero.png'),
            'gallery_files' => [uploadPng('extra.png')],
        ]))
        ->assertRedirect();

    $product = Product::query()->firstOrFail();
    $hero = Str::after($product->image, '/storage/');
    $extra = Str::after($product->gallery[0], '/storage/');

    $this->actingAs(uploadAdmin())
        ->delete('/admin/products/'.$product->id)
        ->assertRedirect();

    expect(Storage::disk('public')->exists($hero))->toBeFalse()
        ->and(Storage::disk('public')->exists($extra))->toBeFalse()
        ->and(Product::query()->count())->toBe(0);
});

test('deleting a product leaves seeded paths and unrelated files alone', function () {
    Storage::fake('public');

    Storage::disk('public')->put('products/unrelated.png', 'keep me');

    $this->actingAs(uploadAdmin())
        ->post('/admin/products', uploadPayload(['image' => '/images/case/seeded.jpg']))
        ->assertRedirect();

    $this->actingAs(uploadAdmin())
        ->delete('/admin/products/'.Product::query()->firstOrFail()->id)
        ->assertRedirect();

    expect(Storage::disk('public')->exists('products/unrelated.png'))->toBeTrue();
});

test('a renamed non-image is rejected because the mime type is sniffed', function () {
    Storage::fake('public');

    // A real UploadedFile is required here: UploadedFile::fake() fakes the
    // MIME type from the filename, so it could never fail this rule. A genuine
    // instance makes Symfony sniff the bytes with finfo, exactly as it does
    // for a browser upload in production.
    $path = tempnam(sys_get_temp_dir(), 'vagary-upload');
    file_put_contents($path, 'not an image at all');

    try {
        $this->actingAs(uploadAdmin())
            ->post('/admin/products', uploadPayload([
                'image_file' => new UploadedFile($path, 'definitely-a-photo.jpg', null, UPLOAD_ERR_OK, true),
            ]))
            ->assertSessionHasErrors('image_file');
    } finally {
        @unlink($path);
    }

    expect(Product::query()->count())->toBe(0)
        ->and(Storage::disk('public')->allFiles())->toBe([]);
});

test('an oversized image is rejected', function () {
    Storage::fake('public');

    $tooBig = UploadedFile::fake()->createWithContent(
        'huge.png',
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==').str_repeat("\0", 6 * 1024 * 1024),
    );

    $this->actingAs(uploadAdmin())
        ->post('/admin/products', uploadPayload(['image_file' => $tooBig]))
        ->assertSessionHasErrors('image_file');

    expect(Product::query()->count())->toBe(0);
});

test('a regular account cannot upload images through the product form', function () {
    Storage::fake('public');

    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)
        ->post('/admin/products', uploadPayload(['image_file' => uploadPng()]))
        ->assertForbidden();

    expect(Product::query()->count())->toBe(0)
        ->and(Storage::disk('public')->allFiles())->toBe([]);
});
