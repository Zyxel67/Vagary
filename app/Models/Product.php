<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'price',
        'tag',
        'category',
        'color',
        'image',
        'gallery',
        'specs',
        'marketplace_url',
        'is_featured',
        'in_stock',
        'sale_price',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'gallery' => 'array',
            'specs' => 'array',
            'is_featured' => 'boolean',
            'in_stock' => 'boolean',
            'sale_price' => 'integer',
        ];
    }

    /**
     * The price a buyer actually pays: the sale price when one is set.
     */
    public function effectivePrice(): int
    {
        return $this->sale_price ?? $this->price;
    }

    /**
     * Whether the product is genuinely discounted below its list price.
     *
     * A sale price at or above the list price is not a discount, so it is
     * deliberately ignored rather than shown as a false markdown.
     */
    public function isDiscounted(): bool
    {
        return $this->sale_price !== null && $this->sale_price < $this->price;
    }

    /**
     * The shortlist rows that reference this product.
     */
    public function wishlistItems(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }
}
