<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialGoal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use OpenApi\Attributes as OA;

class FinancialGoalController extends Controller
{
    // ─── GET /api/goals ───────────────────────────────────────────
    #[OA\Get(
        path: '/goals',
        operationId: 'getGoals',
        summary: 'Daftar semua target keuangan milik pengguna',
        tags: ['Goals'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Daftar target keuangan',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/FinancialGoal')),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index()
    {
        $goals = FinancialGoal::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $goals,
        ]);
    }

    // ─── POST /api/goals ──────────────────────────────────────────
    #[OA\Post(
        path: '/goals',
        operationId: 'createGoal',
        summary: 'Buat target keuangan baru',
        description: '`amount_per_period` dihitung otomatis berdasarkan target_amount, start_date, target_date, dan filling_plan yang dipilih.',
        tags: ['Goals'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['goal_name', 'target_amount', 'start_date', 'target_date', 'filling_plan'],
                properties: [
                    new OA\Property(property: 'goal_name', type: 'string', maxLength: 255, example: 'Dana Darurat'),
                    new OA\Property(property: 'target_amount', type: 'number', format: 'float', minimum: 1000, example: 10000000),
                    new OA\Property(property: 'start_date', type: 'string', format: 'date', example: '2026-01-01'),
                    new OA\Property(property: 'target_date', type: 'string', format: 'date', description: 'Harus setelah start_date', example: '2026-12-31'),
                    new OA\Property(property: 'filling_plan', type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY'], description: 'Harus tersedia untuk durasi yang dipilih', example: 'MONTHLY'),
                    new OA\Property(property: 'icon', type: 'string', nullable: true, maxLength: 10, example: '🎯'),
                    new OA\Property(property: 'color_theme', type: 'string', nullable: true, maxLength: 20, example: '#6366f1'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Goal berhasil dibuat',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Goal created successfully.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/FinancialGoal'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 422,
                description: "Validasi gagal, atau filling_plan tidak tersedia untuk durasi yang dipilih",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: false),
                    new OA\Property(property: 'message', type: 'string', example: "Plan 'WEEKLY' is not available for this duration."),
                    new OA\Property(property: 'available_plans', type: 'array', items: new OA\Items(
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'plan', type: 'string', example: 'DAILY'),
                            new OA\Property(property: 'label', type: 'string', example: 'Daily'),
                            new OA\Property(property: 'amount', type: 'number', format: 'float', example: 27397.26),
                        ]
                    )),
                ])
            ),
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'goal_name'    => 'required|string|max:255',
            'target_amount'=> 'required|numeric|min:1000',
            'start_date'   => 'required|date',
            'target_date'  => 'required|date|after:start_date',
            'filling_plan' => 'required|string|in:DAILY,WEEKLY,MONTHLY',
            'icon'         => 'nullable|string|max:10',
            'color_theme'  => 'nullable|string|max:20',
        ]);

        // Validasi: plan tersedia untuk durasi ini?
        $validated['filling_plan'] = strtoupper($validated['filling_plan']);
        $availablePlans = FinancialGoal::calculateAvailablePlans(
            $validated['target_amount'],
            $validated['start_date'],
            $validated['target_date']
        );
        $availablePlanNames = array_column($availablePlans, 'plan');

        if (!in_array($validated['filling_plan'], $availablePlanNames)) {
            return response()->json([
                'success' => false,
                'message' => "Plan '{$validated['filling_plan']}' is not available for this duration.",
                'available_plans' => $availablePlans,
            ], 422);
        }

        // Hitung otomatis — frontend TIDAK perlu kirim amount_per_period
        $amountPerPeriod = FinancialGoal::calculateAmountPerPeriod(
            $validated['target_amount'],
            $validated['filling_plan'],
            $validated['start_date'],
            $validated['target_date']
        );

        $goal = FinancialGoal::create([
            'user_id'          => Auth::id(),
            'goal_name'        => $validated['goal_name'],
            'target_amount'    => $validated['target_amount'],
            'current_amount'   => 0,
            'filling_plan'     => $validated['filling_plan'],
            'amount_per_period'=> $amountPerPeriod,
            'start_date'       => $validated['start_date'],
            'target_date'      => $validated['target_date'],
            'icon'             => $validated['icon'] ?? '🎯',
            'color_theme'      => $validated['color_theme'] ?? '#6366f1',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Goal created successfully.',
            'data'    => $goal,
        ], 201);
    }

    // ─── GET /api/goals/{id} ──────────────────────────────────────
    #[OA\Get(
        path: '/goals/{id}',
        operationId: 'getGoal',
        summary: 'Ambil detail satu target keuangan',
        tags: ['Goals'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Detail target keuangan',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/FinancialGoal'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Goal tidak ditemukan'),
        ]
    )]
    public function show($id)
    {
        $goal = FinancialGoal::where('user_id', Auth::id())->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $goal,
        ]);
    }

    // ─── PUT /api/goals/{id} ──────────────────────────────────────
    #[OA\Put(
        path: '/goals/{id}',
        operationId: 'updateGoal',
        summary: 'Perbarui target keuangan',
        description: '`amount_per_period` dihitung ulang otomatis jika target_amount, start_date, target_date, atau filling_plan diubah.',
        tags: ['Goals'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        requestBody: new OA\RequestBody(
            required: false,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'goal_name', type: 'string', maxLength: 255, example: 'Dana Darurat'),
                    new OA\Property(property: 'target_amount', type: 'number', format: 'float', minimum: 1000, example: 12000000),
                    new OA\Property(property: 'start_date', type: 'string', format: 'date', example: '2026-01-01'),
                    new OA\Property(property: 'target_date', type: 'string', format: 'date', example: '2026-12-31'),
                    new OA\Property(property: 'filling_plan', type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY'], example: 'MONTHLY'),
                    new OA\Property(property: 'current_amount', type: 'number', format: 'float', minimum: 0, example: 3000000),
                    new OA\Property(property: 'icon', type: 'string', nullable: true, maxLength: 10, example: '🎯'),
                    new OA\Property(property: 'color_theme', type: 'string', nullable: true, maxLength: 20, example: '#6366f1'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Goal berhasil diperbarui',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Goal updated successfully.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/FinancialGoal'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Goal tidak ditemukan'),
            new OA\Response(
                response: 422,
                description: "Validasi gagal, atau filling_plan tidak tersedia untuk durasi yang dipilih",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: false),
                    new OA\Property(property: 'message', type: 'string', example: "Plan 'WEEKLY' is not available for this duration."),
                    new OA\Property(property: 'available_plans', type: 'array', items: new OA\Items(type: 'object')),
                ])
            ),
        ]
    )]
    public function update(Request $request, $id)
    {
        $goal = FinancialGoal::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'goal_name'     => 'sometimes|string|max:255',
            'target_amount' => 'sometimes|numeric|min:1000',
            'start_date'    => 'sometimes|date',
            'target_date'   => 'sometimes|date|after:start_date',
            'filling_plan'  => 'sometimes|string|in:DAILY,WEEKLY,MONTHLY',
            'current_amount'=> 'sometimes|numeric|min:0',
            'icon'          => 'nullable|string|max:10',
            'color_theme'   => 'nullable|string|max:20',
        ]);

        // Merge dengan data existing agar kalkulasi tetap akurat
        $targetAmount = $validated['target_amount'] ?? $goal->target_amount;
        $startDate    = $validated['start_date']    ?? $goal->start_date;
        $targetDate   = $validated['target_date']   ?? $goal->target_date;
        $fillingPlan  = $validated['filling_plan']  ?? $goal->filling_plan;

        // Recalculate jika ada perubahan finansial
        $shouldRecalc = isset($validated['target_amount'])
            || isset($validated['start_date'])
            || isset($validated['target_date'])
            || isset($validated['filling_plan']);

        if ($shouldRecalc) {
            $availablePlans     = FinancialGoal::calculateAvailablePlans($targetAmount, $startDate, $targetDate);
            $availablePlanNames = array_column($availablePlans, 'plan');

            if (!in_array($fillingPlan, $availablePlanNames)) {
                return response()->json([
                    'success'         => false,
                    'message'         => "Plan '{$fillingPlan}' is not available for this duration.",
                    'available_plans' => $availablePlans,
                ], 422);
            }

            $validated['amount_per_period'] = FinancialGoal::calculateAmountPerPeriod(
                $targetAmount, $fillingPlan, $startDate, $targetDate
            );
        }

        $goal->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Goal updated successfully.',
            'data'    => $goal->fresh(),
        ]);

        if (isset($validated['filling_plan'])) {
            $validated['filling_plan'] = strtoupper($validated['filling_plan']);
        }
    }


    #[OA\Put(
        path: '/goals/{id}/funds',
        operationId: 'updateGoalFunds',
        summary: 'Tambah atau kurangi dana pada target keuangan',
        description: 'Jika type=decrease menyebabkan current_amount < 0, nilai akan dibatasi minimal 0.',
        tags: ['Goals'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['type', 'amount'],
                properties: [
                    new OA\Property(property: 'type', type: 'string', enum: ['increase', 'decrease'], example: 'increase'),
                    new OA\Property(property: 'amount', type: 'number', format: 'float', minimum: 1, example: 500000),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Dana berhasil diperbarui',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'message', type: 'string', example: 'Funds berhasil diperbarui'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/FinancialGoal'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Goal tidak ditemukan', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
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
    public function updateFunds(Request $request, $id)
    {
        $goal = FinancialGoal::where(
            'user_id',
            Auth::id()
        )->find($id);

        if (!$goal) {
            return response()->json([
                'message' => 'Goal tidak ditemukan'
            ], 404);
        }

        $validated = Validator::make(
            $request->all(),
            [
                'type' => 'required|in:increase,decrease',
                'amount' => 'required|numeric|min:1',
            ]
        );

        if ($validated->fails()) {

            return response()->json([
                'status' => 'error',
                'errors' => $validated->errors()
            ], 422);

        }

        $amount = $request->amount;

        if ($request->type === 'increase') {

            $goal->current_amount += $amount;

        } else {

            $goal->current_amount -= $amount;

            if ($goal->current_amount < 0) {
                $goal->current_amount = 0;
            }
        }

        $goal->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Funds berhasil diperbarui',
            'data' => $goal->fresh(),
        ]);
    }

    // ─── DELETE /api/goals/{id} ───────────────────────────────────
    #[OA\Delete(
        path: '/goals/{id}',
        operationId: 'deleteGoal',
        summary: 'Hapus target keuangan',
        tags: ['Goals'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Goal berhasil dihapus', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'message', type: 'string', example: 'Goal deleted successfully.'),
            ])),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Goal tidak ditemukan'),
        ]
    )]
    public function destroy($id)
    {
        $goal = FinancialGoal::where('user_id', Auth::id())->findOrFail($id);
        $goal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Goal deleted successfully.',
        ]);
    }

    // ─── POST /api/goals/{id}/add-funds ───────────────────────────
    // (Optional endpoint untuk Add Funds modal)
    public function addFunds(Request $request, $id)
    {
        $goal = FinancialGoal::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'amount'    => 'required|numeric|min:1',
            'operation' => 'required|in:add,subtract',
        ]);

        if ($validated['operation'] === 'add') {
            $goal->current_amount = min(
                $goal->target_amount,
                $goal->current_amount + $validated['amount']
            );
        } else {
            $goal->current_amount = max(0, $goal->current_amount - $validated['amount']);
        }

        $goal->save();

        return response()->json([
            'success' => true,
            'message' => 'Funds updated successfully.',
            'data'    => $goal->fresh(),
        ]);
    }
}