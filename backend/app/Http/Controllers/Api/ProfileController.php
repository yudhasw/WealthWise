<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class ProfileController extends Controller
{
    #[OA\Get(
        path: '/profile',
        operationId: 'getProfile',
        summary: 'Ambil data profil pengguna',
        tags: ['Profile'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Data profil',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'id', type: 'integer', example: 1),
                        new OA\Property(property: 'name', type: 'string', example: 'John Doe'),
                        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
                        new OA\Property(property: 'email_verified_at', type: 'string', format: 'date-time', nullable: true),
                        new OA\Property(property: 'member_since', type: 'string', example: 'Jan 2026'),
                        new OA\Property(property: 'stats', properties: [
                            new OA\Property(property: 'total_transactions', type: 'integer', example: 25),
                            new OA\Property(property: 'total_accounts', type: 'integer', example: 2),
                            new OA\Property(property: 'total_categories', type: 'integer', example: 6),
                        ], type: 'object'),
                    ], type: 'object'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'id'                 => $user->id,
                'name'               => $user->name,
                'email'              => $user->email,
                'email_verified_at'  => $user->email_verified_at,
                'member_since'       => $user->created_at->translatedFormat('M Y'),
                'stats'              => [
                    'total_transactions' => $user->transactions()->count(),
                    'total_accounts'     => $user->accounts()->count(),
                    'total_categories'   => $user->categories()->count(),
                ],
            ],
        ]);
    }

    #[OA\Put(
        path: '/profile',
        operationId: 'updateProfile',
        summary: 'Perbarui nama dan email profil',
        tags: ['Profile'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'John Doe'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', maxLength: 255, example: 'john@example.com'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Profil berhasil diperbarui',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Profil berhasil diperbarui'),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'name', type: 'string', example: 'John Doe'),
                        new OA\Property(property: 'email', type: 'string', example: 'john@example.com'),
                    ], type: 'object'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validasi gagal', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        ]
    )]
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update([
            'name'  => $request->name,
            'email' => $request->email,
        ]);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'data'    => [
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    #[OA\Put(
        path: '/profile/password',
        operationId: 'updateProfilePassword',
        summary: 'Perbarui password pengguna',
        tags: ['Profile'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['current_password', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'current_password', type: 'string', format: 'password', example: 'oldpassword123'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 8, example: 'newpassword123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'newpassword123'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Password berhasil diperbarui', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 422,
                description: 'Validasi gagal atau password saat ini tidak sesuai',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'errors', type: 'object', example: ['current_password' => ['Password saat ini tidak sesuai.']]),
                ])
            ),
        ]
    )]
    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password'      => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'errors' => ['current_password' => ['Password saat ini tidak sesuai.']],
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password berhasil diperbarui',
        ]);
    }
}