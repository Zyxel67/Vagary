<?php

/** @var \Tests\TestCase $this */

use App\Models\Product;
use App\Models\Promo;
use App\Models\User;
use App\Notifications\ProductRestockedNotification;
use App\Notifications\PromoNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Symfony\Component\Mime\Email;

function unsubAdmin(): User
{
    return User::factory()->create(['is_admin' => true]);
}

function unsubProduct(string $name = 'Argus G3'): Product
{
    return Product::create([
        'name' => $name,
        'price' => 97000,
        'tag' => 'New arrival',
        'category' => 'Case',
        'color' => 'bg-stone-200',
        'image' => '/images/case/Argus%20G3/IMG-20250708-WA0001.jpg',
        'gallery' => [],
        'specs' => [],
        'marketplace_url' => null,
        'is_featured' => true,
        'in_stock' => true,
        'sale_price' => null,
    ]);
}

/**
 * Runs the message callbacks against a real Symfony email, exactly as
 * MailChannel does when rendering, so headers can be inspected.
 */
function renderedHeaders(object $notification, User $user): Email
{
    $email = new Email();

    foreach ($notification->toMail($user)->callbacks as $callback) {
        $callback($email);
    }

    return $email;
}

test('a signed unsubscribe link turns email off for that account', function () {
    $user = User::factory()->create(['email_opt_in' => true]);

    $this->post(URL::signedRoute('email.unsubscribe', ['user' => $user->id]))->assertRedirect();

    expect($user->fresh()->email_opt_in)->toBeFalse();
});

test('an unsigned unsubscribe link is refused and changes nothing', function () {
    $user = User::factory()->create(['email_opt_in' => true]);

    $this->post(route('email.unsubscribe', ['user' => $user->id]))->assertForbidden();

    expect($user->fresh()->email_opt_in)->toBeTrue();
});

test('marketing emails carry the one-click unsubscribe headers', function () {
    $user = User::factory()->create(['email_opt_in' => true]);

    $headers = renderedHeaders(new ProductRestockedNotification(unsubProduct()), $user)->getHeaders();

    expect($headers->get('List-Unsubscribe'))->not->toBeNull()
        ->and($headers->get('List-Unsubscribe')->getBodyAsString())->toContain('/email/unsubscribe/'.$user->id)
        ->and($headers->get('List-Unsubscribe-Post')->getBodyAsString())->toBe('List-Unsubscribe=One-Click');
});

test('marketing emails explain why they arrived and link to the settings', function () {
    $user = User::factory()->create(['name' => 'Rani', 'email_opt_in' => true]);

    $promo = new PromoNotification('Weekend sale', 'Everything is discounted this weekend.');
    $mail = $promo->toMail($user);

    expect(implode(' ', $mail->introLines))
        ->toContain('because email notifications are switched on')
        ->and($mail->actionUrl)->toBe(route('notifications.edit'));
});

test('a sent promo is recorded with its audience size and sender', function () {
    Notification::fake();

    $admin = unsubAdmin();
    User::factory()->create(['email_opt_in' => true]);
    User::factory()->create(['email_opt_in' => true]);
    User::factory()->create(['email_opt_in' => false]);

    $this->actingAs($admin)
        ->post('/admin/promos', [
            'subject' => 'Weekend sale',
            'message' => 'Everything is discounted this weekend.',
        ])
        ->assertRedirect();

    $promo = Promo::query()->firstOrFail();

    expect($promo->recipients)->toBe(2)
        ->and($promo->user_id)->toBe($admin->id)
        ->and($promo->subject)->toBe('Weekend sale')
        ->and($promo->sender->name)->toBe($admin->name);
});

test('an identical promo inside ten minutes is blocked instead of re-sending', function () {
    Notification::fake();

    $admin = unsubAdmin();
    $subscriber = User::factory()->create(['email_opt_in' => true]);

    $payload = ['subject' => 'Weekend sale', 'message' => 'Everything is discounted this weekend.'];

    $this->actingAs($admin)->post('/admin/promos', $payload)->assertRedirect();
    $this->actingAs($admin)->post('/admin/promos', $payload)->assertSessionHasErrors('subject');

    expect(Promo::query()->count())->toBe(1);

    // Still exactly one, so the second press really was refused.
    Notification::assertSentToTimes($subscriber, PromoNotification::class, 1);
});

test('a different promo is still allowed straight after another', function () {
    Notification::fake();

    $admin = unsubAdmin();
    User::factory()->create(['email_opt_in' => true]);

    $this->actingAs($admin)->post('/admin/promos', [
        'subject' => 'Weekend sale',
        'message' => 'Everything is discounted this weekend.',
    ])->assertRedirect();

    $this->actingAs($admin)->post('/admin/promos', [
        'subject' => 'New arrivals',
        'message' => 'Fresh stock just landed.',
    ])->assertRedirect();

    expect(Promo::query()->count())->toBe(2);
});

test('the promos tab lists what has already been sent', function () {
    $admin = unsubAdmin();

    Promo::create([
        'user_id' => $admin->id,
        'subject' => 'Weekend sale',
        'message' => 'Everything is discounted this weekend.',
        'url' => null,
        'cta_label' => 'Shop now',
        'recipients' => 3,
    ]);

    $this->actingAs($admin)
        ->get('/admin/promos')
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page->component('admin/promos/index')
                ->has('recent', 1)
                ->where('recent.0.subject', 'Weekend sale')
                ->where('recent.0.recipients', 3)
                ->where('recent.0.sent_by', $admin->name),
        );
});
