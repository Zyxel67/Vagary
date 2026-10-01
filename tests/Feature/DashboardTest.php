<?php

/** @var \Tests\TestCase $this */

use App\Models\User;

test('guests can visit the dashboard', function () {
    /** @var \Tests\TestCase $this */
    $this->get('/dashboard')->assertOk();
});

test('authenticated users can visit the dashboard', function () {
    /** @var \Tests\TestCase $this */
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertOk();
});
