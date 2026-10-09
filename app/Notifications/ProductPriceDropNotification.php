<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Emails everyone who saved a product when its effective price drops.
 *
 * `$previousPrice` / `$newPrice` are whole dollars, matching how prices are
 * stored and formatted across the storefront.
 */
class ProductPriceDropNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Product $product,
        public int $previousPrice,
        public int $newPrice,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return $notifiable->email_opt_in ? ['mail'] : [];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $saving = $this->previousPrice - $this->newPrice;

        return (new MailMessage)
            ->subject('Price drop: '.$this->product->name.' is now '.$this->money($this->newPrice))
            ->greeting('Hello '.$notifiable->name.',')
            ->line('The '.$this->product->name.' you saved has just dropped in price.')
            ->line(
                'Was '.$this->money($this->previousPrice).', now '.$this->money($this->newPrice)
                .' — you save '.$this->money($saving).'.'
            )
            ->action('See the new price', $this->productUrl())
            ->line('Prices can change at any time, so grab it if it fits.')
            ->line('You can change what we email you about from your notification settings.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'price_drop',
            'product_id' => $this->product->id,
            'previous_price' => $this->previousPrice,
            'new_price' => $this->newPrice,
        ];
    }

    protected function productUrl(): string
    {
        return route('marketplace').'?product='.rawurlencode($this->product->name);
    }

    /**
     * Format whole rupiah for the email body, e.g. 97000 -> "Rp 97.000".
     *
     * Mirrors `formatPrice` on the storefront so the number in the email and
     * the number on the page can never disagree.
     */
    protected function money(int $amount): string
    {
        return 'Rp '.number_format($amount, 0, ',', '.');
    }
}