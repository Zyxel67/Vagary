<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A record of a promo blast sent from the admin Promos tab.
 *
 * Kept as history rather than being sent and forgotten, so an accidental
 * double-send is visible and the audience size of each promo is auditable.
 */
class Promo extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'subject',
        'message',
        'url',
        'cta_label',
        'recipients',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'recipients' => 'integer',
        ];
    }

    /**
     * The admin account that sent the promo.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}