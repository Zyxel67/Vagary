<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('manage-products');
    }

    /**
     * Normalise the incoming payload before validation so optional, repeatable
     * fields (gallery images and specification rows) arrive tidy.
     */
    protected function prepareForValidation(): void
    {
        $gallery = collect($this->input('gallery', []))
            ->map(static fn ($image): string => is_string($image) ? trim($image) : '')
            ->filter()
            ->values()
            ->all();

        $specs = collect($this->input('specs', []))
            ->map(static fn ($spec): array => [
                'label' => trim((string) ($spec['label'] ?? '')),
                'value' => trim((string) ($spec['value'] ?? '')),
            ])
            ->filter(static fn (array $spec): bool => $spec['label'] !== '' || $spec['value'] !== '')
            ->values()
            ->all();

        $this->merge([
            'name' => trim((string) $this->input('name')),
            'price' => (int) $this->input('price'),
            'tag' => trim((string) $this->input('tag')),
            'category' => trim((string) $this->input('category')),
            'color' => trim((string) $this->input('color')),
            'image' => trim((string) $this->input('image')),
            'gallery' => $gallery,
            'specs' => $specs,
            'marketplace_url' => $this->filled('marketplace_url') ? trim((string) $this->input('marketplace_url')) : null,
            'is_featured' => $this->boolean('is_featured'),
            'in_stock' => $this->boolean('in_stock'),
            'sale_price' => $this->filled('sale_price') ? (int) $this->input('sale_price') : null,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'name' => ['required', 'string', 'max:120', Rule::unique('products', 'name')->ignore($productId)],
            // Prices are whole rupiah, so the ceiling is ~Rp 100 million rather
            // than the old dollar-era one million.
            'price' => ['required', 'integer', 'min:0', 'max:100000000'],
            'tag' => ['required', 'string', 'max:60'],
            'category' => ['required', 'string', 'max:60'],
            'color' => ['required', 'string', 'max:60'],
            'image' => ['required', 'string', 'max:2048'],
            'gallery' => ['present', 'array'],
            'gallery.*' => ['required', 'string', 'max:2048'],
            'specs' => ['present', 'array'],
            'specs.*.label' => ['required_with:specs.*.value', 'string', 'max:60'],
            'specs.*.value' => ['required_with:specs.*.label', 'string', 'max:160'],
            'marketplace_url' => ['nullable', 'url', 'max:2048'],
            'is_featured' => ['boolean'],
            // Toggling this off then on again is what triggers the restock email.
            'in_stock' => ['boolean'],
            // Must actually undercut the list price, otherwise it is not a sale
            // and the storefront would show a misleading markdown.
            'sale_price' => ['nullable', 'integer', 'min:0', 'max:100000000', 'lt:price'],
        ];
    }

    /**
     * Get the custom validation messages for the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image.required' => 'Add a main image path or URL so the product has a photo.',
            'gallery.present' => 'Provide a gallery (it can be empty).',
            'marketplace_url.url' => 'The marketplace link must be a full URL, for example https://shopee.co.id/...',
            'sale_price.lt' => 'The sale price must be lower than the regular price.',
            'sale_price.integer' => 'The sale price must be a whole number of dollars.',
            'sale_price.min' => 'The sale price cannot be negative.',
        ];
    }
}
