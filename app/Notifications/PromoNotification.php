<?php

namespace App\Notifications;

use App\Notifications\Concerns\SendsMarketingEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * The general-purpose promo / newsletter blast sent from the admin Promos tab.
 *
 * Only ever delivered to accounts that ticked the opt-in, which the `via()`
 * method re-checks so an account that opted out mid-send is skipped.
 */
class PromoNotification extends Notification
{
    use Queueable, SendsMarketingEmail;

    public function __construct(
        public string $subject,
        public string $message,
        public ?string $url = null,
        public string $ctaLabel = 'Shop now',
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
        $mail = (new MailMessage)
            ->subject($this->subject)
            ->greeting('Hello '.$notifiable->name.',')
            ->line($this->message);

        if ($this->url !== null && $this->url !== '') {
            $mail->action($this->ctaLabel, $this->url);
        }

        return $this->withMarketingFooter($mail, $notifiable);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return ['type' => 'promo', 'subject' => $this->subject];
    }
}