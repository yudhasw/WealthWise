<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'ValidationError',
    type: 'object',
    properties: [
        new OA\Property(
            property: 'errors',
            type: 'object',
            example: ['field_name' => ['Pesan error untuk field ini.']]
        ),
    ]
)]
class ValidationErrorSchema {}
