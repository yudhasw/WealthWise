<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VerificationController extends Controller
{
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
