<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FinancialStatsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

class FinancialStatsController extends Controller
{
    protected $statsService;

    public function __construct(FinancialStatsService $statsService)
    {
        $this->statsService = $statsService;
    }

    #[OA\Get(
        path: '/stats/summary',
        operationId: 'getStatsSummary',
        summary: 'Ringkasan statistik keuangan',
        tags: ['Statistics'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Statistik berhasil dimuat',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Statistik berhasil dimuat'),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'total_income', type: 'number', format: 'float', example: 5000000),
                        new OA\Property(property: 'total_expense', type: 'number', format: 'float', example: 2000000),
                        new OA\Property(property: 'net_balance', type: 'number', format: 'float', example: 3000000),
                        new OA\Property(property: 'top_category', type: 'string', example: 'Makanan'),
                        new OA\Property(property: 'chart', type: 'object', example: ['Makanan' => 1000000, 'Transportasi' => 500000]),
                    ], type: 'object'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    /**
     * Endpoint API untuk mengambil statistik
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $stats = $this->statsService->getDashboardSummary($userId);

        return response()->json([
            'message' => 'Statistik berhasil dimuat',
            'data'    => $stats
        ], 200);
    }
}