<?php

namespace App\Notifications;

use App\Models\Product;
use App\Notifications\Concerns\SendsMarketingEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Emails everyone who saved a product as soon as it comes back into stock.
 *
 * Deliberately not queued: the opt-in audience for a single product is small,
 * sending synchronously keeps it working without a queue worker running.
 * Flip on ShouldQueue once there is a worker behind it.
 */
class ProductRestockedNotification extends Notification
{
    use Queueable, SendsMarketingEmail;

    public function __construct(public Product $product) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        // Re-checked at send time so an opt-out lands even if the recipient
        // list was built a moment earlier.
        return $notifiable->email_opt_in ? ['mail'] : [];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject("Back in stock: {$this->product->name}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Good news — the {$this->product->name} leather case is back in stock.")
            ->line('You saved it to your wishlist, so we wanted to tell you first.')
            ->action('View the product', $this->productUrl())
            ->line('Get it while stocks last.');

        return $this->withMarketingFooter($mail, $notifiable);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return ['type' => 'restock', 'product_id' => $this->product->id];
    }

    protected function productUrl(): string
    {
        return route('marketplace').'?product='.rawurlencode($this->product->name);
    }
}