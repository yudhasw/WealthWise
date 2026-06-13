<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

class TransactionController extends Controller
{
    #[OA\Get(
        path: '/transactions',
        operationId: 'getTransactions',
        summary: 'Daftar semua transaksi milik pengguna',
        description: 'Mengembalikan transaksi diurutkan dari yang terbaru, beserta info kategori dan akun terkait.',
        tags: ['Transactions'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Daftar transaksi',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/TransactionWithRelations')),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index()
    {
        $transactions = Transaction::with(['category', 'account'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($trx) {
                return [
                    'id'                 => $trx->id,
                    'transaction_amount' => $trx->transaction_amount,
                    'transaction_type'   => $trx->transaction_type,
                    'transaction_date'   => $trx->transaction_date,
                    'description'        => $trx->description,
                    'category'           => [
                        'id'   => $trx->category->id,
                        'name' => $trx->category->category_name,
                    ],
                    'account'            => [
                        'id'   => $trx->account->id,
                        'name' => $trx->account->account_name,
                    ],
                ];
            });
            
        return response()->json([
            'status' => 'success',
            'data' => $transactions
        ], 200);
    }
    

    #[OA\Post(
        path: '/transactions/add',
        operationId: 'createTransaction',
        summary: 'Catat transaksi baru',
        tags: ['Transactions'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['account_id', 'type', 'amount', 'transaction_date'],
                properties: [
                    new OA\Property(property: 'account_id', type: 'integer', example: 1),
                    new OA\Property(property: 'type', type: 'string', enum: ['INCOME', 'EXPENSE', 'TRANSFER'], example: 'EXPENSE'),
                    new OA\Property(property: 'amount', type: 'number', format: 'float', minimum: 1, example: 50000),
                    new OA\Property(property: 'transaction_date', type: 'string', format: 'date', example: '2026-06-01'),
                    new OA\Property(property: 'category_id', type: 'integer', nullable: true, example: 2),
                    new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Makan siang'),
                    new OA\Property(property: 'to_account_id', type: 'integer', nullable: true, description: 'Wajib diisi jika type = TRANSFER', example: null),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Transaksi berhasil dicatat',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'message', type: 'string', example: 'Transaksi berhasil dicatat.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Transaction'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 422,
                description: 'Validasi gagal, atau akun sumber dan tujuan sama untuk TRANSFER',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'error'),
                    new OA\Property(property: 'errors', type: 'object', nullable: true),
                    new OA\Property(property: 'message', type: 'string', nullable: true, example: 'Akun sumber dan tujuan tidak boleh sama.'),
                ])
            ),
        ]
    )]
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'account_id'       => 'required|exists:accounts,id',
            'type'             => 'required|in:INCOME,EXPENSE,TRANSFER',
            'amount'           => 'required|numeric|min:1',
            'transaction_date' => 'required|date',
            'category_id'      => 'nullable|exists:categories,id',
            'description'      => 'nullable|string',
            'to_account_id'    => 'nullable|required_if:type,TRANSFER|exists:accounts,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->type === 'TRANSFER' && $request->account_id == $request->to_account_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun sumber dan tujuan tidak boleh sama.'
            ], 422);
        }

        $transaction = Transaction::create([
            'user_id'            => Auth::id(),
            'account_id'         => $request->account_id,
            'category_id'        => $request->category_id,
            'to_account_id'      => $request->to_account_id,
            'transaction_type'   => $request->type,   
            'transaction_amount' => $request->amount,
            'transaction_date'   => $request->transaction_date,
            'description'        => $request->description,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi berhasil dicatat.',
            'data' => $transaction
        ], 201);
    }

    #[OA\Get(
        path: '/transactions/{id}',
        operationId: 'getTransaction',
        summary: 'Ambil detail satu transaksi',
        tags: ['Transactions'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Detail transaksi',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Transaction'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 404,
                description: 'Transaksi tidak ditemukan',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'error'),
                    new OA\Property(property: 'message', type: 'string', example: 'Transaksi tidak ditemukan.'),
                ])
            ),
        ]
    )]
    public function show($id)
    {
        $transaction = Transaction::where('user_id', Auth::id())->find($id);

        if (!$transaction) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $transaction
        ], 200);
    }
    
    #[OA\Put(
        path: '/transactions/{id}',
        operationId: 'updateTransaction',
        summary: 'Perbarui transaksi',
        tags: ['Transactions'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['account_id', 'type', 'amount', 'transaction_date'],
                properties: [
                    new OA\Property(property: 'account_id', type: 'integer', example: 1),
                    new OA\Property(property: 'type', type: 'string', enum: ['INCOME', 'EXPENSE', 'TRANSFER'], example: 'EXPENSE'),
                    new OA\Property(property: 'amount', type: 'number', format: 'float', minimum: 1, example: 75000),
                    new OA\Property(property: 'transaction_date', type: 'string', format: 'date', example: '2026-06-02'),
                    new OA\Property(property: 'category_id', type: 'integer', nullable: true, example: 2),
                    new OA\Property(property: 'to_account_id', type: 'integer', nullable: true, description: 'Wajib diisi jika type = TRANSFER', example: null),
                    new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Makan malam'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Transaksi berhasil diperbarui',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'message', type: 'string', example: 'Transaksi berhasil diperbarui.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Transaction'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 404,
                description: 'Transaksi tidak ditemukan',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'error'),
                    new OA\Property(property: 'message', type: 'string', example: 'Transaksi tidak ditemukan.'),
                ])
            ),
            new OA\Response(
                response: 422,
                description: 'Validasi gagal',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'error'),
                    new OA\Property(property: 'errors', type: 'object'),
                ])
            ),
        ]
    )]
    public function update(Request $request, $id)
    {
        $transaction = Transaction::where('user_id', Auth::id())->find($id);

        if (!$transaction) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'account_id' => 'required|exists:accounts,id',
            'type' => 'required|in:INCOME,EXPENSE,TRANSFER',
            'amount' => 'required|numeric|min:1',
            'transaction_date' => 'required|date',
            'category_id' => 'nullable|exists:categories,id',
            'to_account_id' => 'nullable|required_if:type,TRANSFER|exists:accounts,id',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaction->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi berhasil diperbarui.',
            'data' => $transaction
        ], 200);
    }

    #[OA\Delete(
        path: '/transactions/{id}',
        operationId: 'deleteTransaction',
        summary: 'Hapus transaksi (soft delete)',
        tags: ['Transactions'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Transaksi berhasil dihapus',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'message', type: 'string', example: 'Transaksi berhasil dihapus.'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 404,
                description: 'Transaksi tidak ditemukan',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'error'),
                    new OA\Property(property: 'message', type: 'string', example: 'Transaksi tidak ditemukan.'),
                ])
            ),
        ]
    )]
    /**
     * Menghapus transaksi (Soft Delete).
     */
    public function destroy($id)
    {
        $transaction = Transaction::where('user_id', Auth::id())->find($id);

        if (!$transaction) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi tidak ditemukan.'
            ], 404);
        }

        $transaction->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi berhasil dihapus.'
        ], 200);
    }
}