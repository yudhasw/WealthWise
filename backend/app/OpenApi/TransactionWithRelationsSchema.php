<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TransactionWithRelations',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'transaction_amount', type: 'number', format: 'float', example: 50000),
        new OA\Property(property: 'transaction_type', type: 'string', enum: ['INCOME', 'EXPENSE', 'TRANSFER'], example: 'EXPENSE'),
        new OA\Property(property: 'transaction_date', type: 'string', format: 'date', example: '2026-06-01'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Makan siang'),
        new OA\Property(
            property: 'category',
            type: 'object',
            properties: [
                new OA\Property(property: 'id', type: 'integer', example: 2),
                new OA\Property(property: 'name', type: 'string', example: 'Makanan'),
            ]
        ),
        new OA\Property(
            property: 'account',
            type: 'object',
            properties: [
                new OA\Property(property: 'id', type: 'integer', example: 1),
                new OA\Property(property: 'name', type: 'string', example: 'BCA Tabungan'),
            ]
        ),
    ]
)]
class TransactionWithRelationsSchema {}
