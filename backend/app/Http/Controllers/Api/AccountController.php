<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Account;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

class AccountController extends Controller
{
    #[OA\Get(
        path: '/accounts',
        operationId: 'getAccounts',
        summary: 'Daftar semua akun milik pengguna',
        tags: ['Accounts'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Daftar akun',
                content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/Account'))
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    // Tampilkan semua akun milik user
    public function index()
    {
        $accounts = Account::where('user_id', Auth::id())->get();
        return response()->json($accounts);
    }

    #[OA\Post(
        path: '/accounts',
        operationId: 'createAccount',
        summary: 'Buat akun baru',
        tags: ['Accounts'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['account_name', 'account_type', 'balance'],
                properties: [
                    new OA\Property(property: 'account_name', type: 'string', maxLength: 255, example: 'BCA Tabungan'),
                    new OA\Property(property: 'account_type', type: 'string', example: 'Bank'),
                    new OA\Property(property: 'balance', type: 'number', format: 'float', example: 1000000),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Akun berhasil dibuat', content: new OA\JsonContent(ref: '#/components/schemas/Account')),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validasi gagal', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        ]
    )]
    // Simpan akun baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|string',
            'balance'      => 'required|numeric',
        ]);

        $account = Account::create([
            'user_id'      => Auth::id(),
            'account_name' => $validated['account_name'],
            'account_type' => $validated['account_type'],
            'balance'      => $validated['balance']
        ]);

        return response()->json($account, 201);
    }

    // --- FUNGSI BARU UNTUK EDIT ---

    #[OA\Get(
        path: '/accounts/{id}',
        operationId: 'getAccount',
        summary: 'Ambil detail satu akun',
        tags: ['Accounts'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detail akun', content: new OA\JsonContent(ref: '#/components/schemas/Account')),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Akun tidak ditemukan', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        ]
    )]
    /**
     * Ambil SATU data akun untuk EditAccountPage
     */
    public function show($id)
    {
        // Cari akun berdasarkan ID dan pastikan milik user yang sedang login
        $account = Account::where('user_id', Auth::id())->find($id);

        if (!$account) {
            return response()->json(['message' => 'Akun tidak ditemukan'], 404);
        }

        return response()->json($account);
    }

    #[OA\Put(
        path: '/accounts/{id}',
        operationId: 'updateAccount',
        summary: 'Perbarui data akun',
        tags: ['Accounts'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['account_name', 'account_type', 'balance'],
                properties: [
                    new OA\Property(property: 'account_name', type: 'string', maxLength: 255, example: 'BCA Tabungan'),
                    new OA\Property(property: 'account_type', type: 'string', example: 'Bank'),
                    new OA\Property(property: 'balance', type: 'number', format: 'float', example: 1500000),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Akun berhasil diperbarui',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'data', ref: '#/components/schemas/Account'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Akun tidak ditemukan', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 422, description: 'Validasi gagal', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        ]
    )]
    /**
     * Update data akun dari EditAccountPage
     */
    public function update(Request $request, $id)
    {
        $account = Account::where('user_id', Auth::id())->find($id);

        if (!$account) {
            return response()->json(['message' => 'Akun tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|string',
            'balance'      => 'required|numeric',
        ]);

        $account->update($validated);

        return response()->json([
            'status' => 'success',
            'data'   => $account
        ]);
    }

    #[OA\Delete(
        path: '/accounts/{id}',
        operationId: 'deleteAccount',
        summary: 'Hapus akun',
        tags: ['Accounts'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Akun berhasil dihapus', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Akun tidak ditemukan', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        ]
    )]
    /**
     * Hapus akun
     */
    public function destroy($id)
    {
        $account = Account::where('user_id', Auth::id())->find($id);

        if (!$account) {
            return response()->json(['message' => 'Akun tidak ditemukan'], 404);
        }

        $account->delete();

        return response()->json(['message' => 'Akun berhasil dihapus']);
    }

    // --- FUNGSI TOTAL BALANCE ---

    #[OA\Get(
        path: '/accounts/total',
        operationId: 'getTotalBalance',
        summary: 'Total saldo dari semua akun pengguna',
        tags: ['Accounts'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Total saldo',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'total', type: 'number', format: 'float', example: 5000000),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function totalBalance()
    {
        $total = Account::where('user_id', Auth::id())->sum('balance');
        return response()->json(['total' => $total]);
    }
}