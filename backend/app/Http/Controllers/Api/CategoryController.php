<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

class CategoryController extends Controller
{
    #[OA\Get(
        path: '/categories',
        operationId: 'getCategories',
        summary: 'Daftar kategori (milik pengguna + kategori global)',
        description: 'Untuk kategori bertipe EXPENSE, akan disertakan field `spent` (total pengeluaran sesuai filter periode).',
        tags: ['Categories'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'period', in: 'query', required: false, description: "'monthly' (default) atau 'yearly'", schema: new OA\Schema(type: 'string', enum: ['monthly', 'yearly'], default: 'monthly')),
            new OA\Parameter(name: 'year', in: 'query', required: false, description: 'Default: tahun sekarang', schema: new OA\Schema(type: 'integer', example: 2026)),
            new OA\Parameter(name: 'month', in: 'query', required: false, description: 'Default: bulan sekarang. Hanya dipakai jika period=monthly', schema: new OA\Schema(type: 'integer', example: 6)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Daftar kategori',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Category')),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(Request $request)
    {
        $userId = Auth::id();
        $period = $request->query('period', 'monthly');
        $year   = (int) $request->query('year',  now()->year);
        $month  = (int) $request->query('month', now()->month);

        $categories = Category::where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->orWhereNull('user_id');
            })
            ->get()
            ->map(function ($category) use ($userId, $period, $year, $month) {
                $data = $category->toArray();

                if ($category->type === 'EXPENSE') {
                    $txQuery = $category->transactions()
                        ->where('user_id', $userId)
                        ->where('transaction_type', 'EXPENSE')
                        ->whereYear('transaction_date', $year);

                    if ($period === 'monthly') {
                        $txQuery->whereMonth('transaction_date', $month);
                    }

                    $data['spent'] = (float) $txQuery->sum('transaction_amount');
                }

                return $data;
            });

        return response()->json([
            'status' => 'success',
            'data'   => $categories,
        ]);
    }

    #[OA\Post(
        path: '/categories/add',
        operationId: 'createCategory',
        summary: 'Buat kategori baru',
        tags: ['Categories'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['category_name', 'type'],
                properties: [
                    new OA\Property(property: 'category_name', type: 'string', maxLength: 255, example: 'Transportasi'),
                    new OA\Property(property: 'type', type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE'),
                    new OA\Property(property: 'budget_limit', type: 'number', format: 'float', nullable: true, minimum: 0, example: 500000),
                    new OA\Property(property: 'budget_period', type: 'string', enum: ['WEEKLY', 'MONTHLY', 'YEARLY'], nullable: true, example: 'MONTHLY'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Kategori berhasil dibuat',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'message', type: 'string', example: 'Category created successfully'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Category'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validasi gagal', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        ]
    )]
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'category_name' => 'required|string|max:255',
            'type'          => 'required|in:INCOME,EXPENSE',
            'budget_limit'  => 'nullable|numeric|min:0',
            'budget_period' => 'nullable|in:WEEKLY,MONTHLY,YEARLY',
        ]);

        $validatedData['user_id'] = Auth::id();

        if ($validatedData['type'] !== 'EXPENSE') {
            $validatedData['budget_limit']  = null;
            $validatedData['budget_period'] = null;
        }

        $category = Category::create($validatedData);

        return response()->json([
            'status'  => 'success',
            'message' => 'Category created successfully',
            'data'    => $category,
        ], 201);
    }

    #[OA\Get(
        path: '/categories/{id}',
        operationId: 'getCategory',
        summary: 'Ambil detail satu kategori',
        description: 'Untuk kategori bertipe EXPENSE, akan disertakan field `spent` (total pengeluaran bulan ini).',
        tags: ['Categories'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Detail kategori',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Category'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 404,
                description: 'Kategori tidak ditemukan',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'error'),
                    new OA\Property(property: 'message', type: 'string', example: 'Category not found'),
                ])
            ),
        ]
    )]
    public function show(string $id)
    {
        $userId = Auth::id();
        $year  = now()->year;
        $month = now()->month;

        $category = Category::where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->orWhereNull('user_id');
            })
            ->where('id', $id)
            ->first();

        if (!$category) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Category not found',
            ], 404);
        }

        $data = $category->toArray();

        if ($category->type === 'EXPENSE') {
            $data['spent'] = (float) $category->transactions()
                ->where('user_id', $userId)
                ->where('transaction_type', 'EXPENSE')
                ->whereYear('transaction_date', $year)
                ->whereMonth('transaction_date', $month)
                ->sum('transaction_amount');
        }

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }

    #[OA\Put(
        path: '/categories/{id}',
        operationId: 'updateCategory',
        summary: 'Perbarui kategori',
        tags: ['Categories'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        requestBody: new OA\RequestBody(
            required: false,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'category_name', type: 'string', maxLength: 255, example: 'Transportasi'),
                    new OA\Property(property: 'type', type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE'),
                    new OA\Property(property: 'budget_limit', type: 'number', format: 'float', nullable: true, minimum: 0, example: 600000),
                    new OA\Property(property: 'budget_period', type: 'string', enum: ['WEEKLY', 'MONTHLY', 'YEARLY'], nullable: true, example: 'MONTHLY'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Kategori berhasil diperbarui',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'message', type: 'string', example: 'Category updated successfully'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Category'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 403,
                description: 'Kategori tidak ditemukan atau bukan milik pengguna',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'error'),
                    new OA\Property(property: 'message', type: 'string', example: 'Category not found or you do not have permission to edit this'),
                ])
            ),
            new OA\Response(response: 422, description: 'Validasi gagal', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        ]
    )]
    public function update(Request $request, string $id)
    {
        $category = Category::where('user_id', Auth::id())->find($id);

        if (!$category) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Category not found or you do not have permission to edit this',
            ], 403);
        }

        $validatedData = $request->validate([
            'category_name' => 'sometimes|required|string|max:255',
            'type'          => 'sometimes|required|in:INCOME,EXPENSE',
            'budget_limit'  => 'nullable|numeric|min:0',
            'budget_period' => 'nullable|in:WEEKLY,MONTHLY,YEARLY',
        ]);

        $type = $validatedData['type'] ?? $category->type;
        if ($type !== 'EXPENSE') {
            $validatedData['budget_limit']  = null;
            $validatedData['budget_period'] = null;
        }

        $category->update($validatedData);

        return response()->json([
            'status'  => 'success',
            'message' => 'Category updated successfully',
            'data'    => $category,
        ]);
    }

    #[OA\Delete(
        path: '/categories/{id}',
        operationId: 'deleteCategory',
        summary: 'Hapus kategori',
        tags: ['Categories'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Kategori berhasil dihapus',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'message', type: 'string', example: 'Category deleted successfully'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 403,
                description: 'Kategori tidak ditemukan atau bukan milik pengguna',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'error'),
                    new OA\Property(property: 'message', type: 'string', example: 'Category not found or you do not have permission to delete this'),
                ])
            ),
        ]
    )]
    public function destroy(string $id)
    {
        $category = Category::where('user_id', Auth::id())->find($id);

        if (!$category) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Category not found or you do not have permission to delete this',
            ], 403);
        }

        $category->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Category deleted successfully',
        ]);
    }
}
