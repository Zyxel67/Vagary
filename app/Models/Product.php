<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        ];
    }
}
