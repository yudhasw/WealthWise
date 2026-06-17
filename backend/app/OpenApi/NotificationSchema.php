<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Notification',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'user_id', type: 'integer', example: 1),
        new OA\Property(property: 'type', type: 'string', enum: ['alert', 'insight', 'transaction', 'system', 'goal', 'reminder'], example: 'reminder'),
        new OA\Property(property: 'title', type: 'string', example: 'Kamu belum membuat catatan hari ini'),
        new OA\Property(property: 'message', type: 'string', example: 'Yuk catat pemasukan atau pengeluaranmu hari ini agar laporan keuanganmu tetap akurat.'),
        new OA\Property(property: 'data', type: 'object', nullable: true, example: ['category_id' => 3, 'level' => 'warning', 'percentage' => 92.5]),
        new OA\Property(property: 'is_read', type: 'boolean', example: false),
        new OA\Property(property: 'read_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
class NotificationSchema {}
