<?php

namespace App\Notifications\Concerns;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;
use Symfony\Component\Mime\Email;

/**
 * The footer and unsubscribe headers every marketing email must carry.
 *
 * Kept in one place so a restock alert, a price drop and a promo blast cannot
 * drift apart in what they tell the recipient or how they offer an opt-out.
 */
trait SendsMarketingEmail
{
    /**
     * Append the opt-out copy, a manage-settings button and the headers that
     * let Gmail and Outlook render a native "Unsubscribe" link.
     *
     * The visible button points at a normal authenticated page, but the header
     * carries a signed one-click URL: one-click POSTs arrive from the mail
     * provider's servers, so there is no logged-in session to rely on.
     */
    protected function withMarketingFooter(MailMessage $mail, object $notifiable): MailMessage
    {
        $mail->line('You are receiving this because email notifications are switched on for your Vagary account.');
        $mail->action('Notification settings', route('notifications.edit'));
        $mail->line('Restock alerts, price drops and promos can each be turned off whenever you like.');

        $mail->withSymfonyMessage(function (Email $email) use ($notifiable): void {
            $email->getHeaders()
                ->addTextHeader(
                    'List-Unsubscribe',
                    '<'.URL::signedRoute('email.unsubscribe', ['user' => $notifiable->id]).'>',
                )
                ->addTextHeader('List-Unsubscribe-Post', 'List-Unsubscribe=One-Click');
        });

        return $mail;
    }
}