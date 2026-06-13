<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Category',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'user_id', type: 'integer', nullable: true, example: 1),
        new OA\Property(property: 'category_name', type: 'string', example: 'Makanan'),
        new OA\Property(property: 'type', type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE'),
        new OA\Property(property: 'budget_limit', type: 'number', format: 'float', nullable: true, example: 1000000),
        new OA\Property(property: 'budget_period', type: 'string', enum: ['WEEKLY', 'MONTHLY', 'YEARLY'], nullable: true, example: 'MONTHLY'),
        new OA\Property(property: 'spent', type: 'number', format: 'float', example: 250000, description: 'Hanya tampil untuk kategori bertipe EXPENSE'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', nullable: true),
    ]
)]
class CategorySchema {}
