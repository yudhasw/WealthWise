<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Account',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'user_id', type: 'integer', example: 1),
        new OA\Property(property: 'account_name', type: 'string', example: 'BCA Tabungan'),
        new OA\Property(property: 'account_type', type: 'string', example: 'Bank'),
        new OA\Property(property: 'balance', type: 'number', format: 'float', example: 1500000),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', nullable: true),
    ]
)]
class AccountSchema {}
