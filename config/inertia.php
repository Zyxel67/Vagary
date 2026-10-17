<?php

return [

    /*
    |---------------------------------------------------------------------
    | Pages
    |---------------------------------------------------------------------
    |
    | Inertia resolves page components relative to these paths.
    |
    | The upstream default points at resources/js/Pages, but this project
    | follows the Laravel starter kit and keeps them in the lowercase
    | resources/js/pages. That difference is invisible on a
    | case-insensitive filesystem (Windows, macOS) and makes every lookup
    | fail on Linux — including in CI.
    |
    */

    'ensure_pages_exist' => false,

    'page_paths' => [
        resource_path('js/pages'),
    ],

    'page_extensions' => [
        'js',
        'jsx',
        'svelte',
        'ts',
        'tsx',
        'vue',
    ],

    'ssr' => [
        'enabled' => (bool) env('INERTIA_SSR_ENABLED', true),
        'url' => env('INERTIA_SSR_URL', 'http://127.0.0.1:13714'),
        'ensure_bundle_exists' => (bool) env('INERTIA_SSR_ENSURE_BUNDLE_EXISTS', true),
    ],

    'testing' => [
        // Keeps assertInertia() honest: a mistyped component name fails the
        // test rather than silently passing against a non-existent page.
        'ensure_pages_exist' => true,

        'page_paths' => [
            resource_path('js/pages'),
        ],

        'page_extensions' => [
            'js',
            'jsx',
            'svelte',
            'ts',
            'tsx',
            'vue',
        ],
    ],

    'history' => [
        'encrypt' => (bool) env('INERTIA_ENCRYPT_HISTORY', false),
    ],

    'use_script_element_for_initial_page' => (bool) env('INERTIA_USE_SCRIPT_ELEMENT_FOR_INITIAL_PAGE', false),

];