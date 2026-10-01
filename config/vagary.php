<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Product management administrators
    |--------------------------------------------------------------------------
    |
    | Emails allowed to manage the storefront catalogue, configured through the
    | comma separated VAGARY_ADMIN_EMAILS environment variable. This is a
    | safety net for local setup and sits on top of the `users.is_admin`
    | flag, which remains the primary way to grant admin rights.
    |
    */

    'admin_emails' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('VAGARY_ADMIN_EMAILS', '')),
    ))),

];
