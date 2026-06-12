<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class VerificationController extends Controller
{
    #[OA\Post(
        path: '/email/verify-code',
        operationId: 'verifyEmailCode',
        summary: 'Verifikasi email dengan kode 6-digit',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'code'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
                    new OA\Property(property: 'code', type: 'string', minLength: 6, maxLength: 6, example: '123456'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Email berhasil diverifikasi', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 400, description: 'Email sudah terverifikasi', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 404, description: 'Pengguna tidak ditemukan', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 422, description: 'Kode tidak valid/kadaluarsa atau validasi gagal', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        ]
    )]
    public function verifyCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'Pengguna tidak ditemukan.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email sudah terverifikasi.'], 400);
        }

        if (
            is_null($user->verification_code) ||
            is_null($user->verification_code_expires_at) ||
            now()->greaterThan($user->verification_code_expires_at) ||
            $user->verification_code !== $request->code
        ) {
            return response()->json(['message' => 'Kode verifikasi tidak valid atau sudah kadaluarsa.'], 422);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_code_expires_at' => null,
        ])->save();

        return response()->json(['message' => 'Email berhasil diverifikasi. Silakan login.']);
    }

    #[OA\Post(
        path: '/email/resend-code',
        operationId: 'resendVerificationCode',
        summary: 'Kirim ulang kode verifikasi email',
        description: 'Dibatasi maksimal 3 kali per menit (throttle).',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Kode verifikasi telah dikirim ulang', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 400, description: 'Email sudah terverifikasi', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 404, description: 'Pengguna tidak ditemukan', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 422, description: 'Validasi gagal', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
            new OA\Response(response: 429, description: 'Terlalu banyak permintaan (throttle)'),
        ]
    )]
    public function resendCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'Pengguna tidak ditemukan.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email sudah terverifikasi.'], 400);
        }

        $user->sendVerificationCodeNotification();

        return response()->json(['message' => 'Kode verifikasi telah dikirim ulang ke email kamu.']);
    }
}
