<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Transaction',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'user_id', type: 'integer', example: 1),
        new OA\Property(property: 'account_id', type: 'integer', example: 1),
        new OA\Property(property: 'to_account_id', type: 'integer', nullable: true, example: null),
        new OA\Property(property: 'category_id', type: 'integer', nullable: true, example: 2),
        new OA\Property(property: 'transaction_type', type: 'string', enum: ['INCOME', 'EXPENSE', 'TRANSFER'], example: 'EXPENSE'),
        new OA\Property(property: 'transaction_amount', type: 'number', format: 'float', example: 50000),
        new OA\Property(property: 'transaction_date', type: 'string', format: 'date', example: '2026-06-01'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Makan siang'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', nullable: true),
    ]
)]
class TransactionSchema {}
