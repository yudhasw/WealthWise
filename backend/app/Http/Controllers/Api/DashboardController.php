<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FinancialStatsService;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

class DashboardController extends Controller
{
    protected $statsService;
    protected $transactionService;

    public function __construct(FinancialStatsService $statsService, TransactionService $transactionService)
    {
        $this->statsService = $statsService;
        $this->transactionService = $transactionService;
    }

    #[OA\Get(
        path: '/dashboard',
        operationId: 'getDashboard',
        summary: 'Ringkasan dashboard',
        description: 'Mengembalikan ringkasan keuangan beserta 5 transaksi terbaru.',
        tags: ['Dashboard'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Data dashboard',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'summary', properties: [
                        new OA\Property(property: 'total_income', type: 'number', format: 'float', example: 5000000),
                        new OA\Property(property: 'total_expense', type: 'number', format: 'float', example: 2000000),
                        new OA\Property(property: 'net_balance', type: 'number', format: 'float', example: 3000000),
                        new OA\Property(property: 'top_category', type: 'string', example: 'Makanan'),
                        new OA\Property(property: 'chart', type: 'object', example: ['Makanan' => 1000000, 'Transportasi' => 500000]),
                    ], type: 'object'),
                    new OA\Property(property: 'recent_transactions', type: 'array', items: new OA\Items(ref: '#/components/schemas/TransactionWithRelations')),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index()
    {
        $userId = Auth::id();

        $stats = $this->statsService->getDashboardSummary($userId);
        $recentTransactions = $this->transactionService->getRecent($userId, 5);

        return response()->json([
            'summary' => $stats,
            'recent_transactions' => $recentTransactions
        ]);
    }
}