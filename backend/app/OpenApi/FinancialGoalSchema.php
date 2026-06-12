<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'FinancialGoal',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'user_id', type: 'integer', example: 1),
        new OA\Property(property: 'goal_name', type: 'string', example: 'Dana Darurat'),
        new OA\Property(property: 'target_amount', type: 'number', format: 'float', example: 10000000),
        new OA\Property(property: 'current_amount', type: 'number', format: 'float', example: 2500000),
        new OA\Property(property: 'filling_plan', type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY'], example: 'MONTHLY'),
        new OA\Property(property: 'amount_per_period', type: 'number', format: 'float', example: 500000),
        new OA\Property(property: 'start_date', type: 'string', format: 'date', example: '2026-01-01'),
        new OA\Property(property: 'target_date', type: 'string', format: 'date', example: '2026-12-31'),
        new OA\Property(property: 'icon', type: 'string', example: '🎯'),
        new OA\Property(property: 'color_theme', type: 'string', example: '#6366f1'),
        new OA\Property(property: 'progress_percentage', type: 'number', format: 'float', example: 25),
        new OA\Property(property: 'remaining_amount', type: 'number', format: 'float', example: 7500000),
        new OA\Property(property: 'estimated_completion', type: 'string', nullable: true, example: '31 Dec 2026'),
        new OA\Property(property: 'time_remaining_human', type: 'string', example: '6 months left'),
        new OA\Property(
            property: 'available_plans',
            type: 'array',
            items: new OA\Items(
                type: 'object',
                properties: [
                    new OA\Property(property: 'plan', type: 'string', example: 'MONTHLY'),
                    new OA\Property(property: 'label', type: 'string', example: 'Monthly'),
                    new OA\Property(property: 'amount', type: 'number', format: 'float', example: 500000),
                ]
            )
        ),
    ]
)]
class FinancialGoalSchema {}
