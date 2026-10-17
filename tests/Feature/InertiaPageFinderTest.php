<?php

use Tests\TestCase;

/** @var TestCase $this */

/*
 | Inertia's upstream default is resources/js/Pages, but this project keeps
 | the starter kit's lowercase resources/js/pages.
 |
 | On Windows and macOS that difference is invisible; on Linux (which is what
 | CI runs) the capitalised path resolves to nothing and every assertInertia()
 | fails with "page component file does not exist". This test pins the config
 | to the directory that actually exists.
 */

test('inertia is pointed at the lowercase pages directory this project uses', function () {
    expect(config('inertia.testing.page_paths'))->toContain(resource_path('js/pages'));

    expect(is_dir(resource_path('js/pages')))->toBeTrue();
});

test('inertia still verifies that page components exist during tests', function () {
    expect(config('inertia.testing.ensure_pages_exist'))->toBeTrue();

    expect(config('inertia.testing.page_extensions'))->toContain('tsx');
});
