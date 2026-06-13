<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use OpenApi\Attributes as OA;

class StatisticsController extends Controller
{
    #[OA\Get(
        path: '/statistics',
        operationId: 'getStatistics',
        summary: 'Statistik transaksi (income/expense) per periode',
        tags: ['Statistics'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'type', in: 'query', required: false, description: "Jenis transaksi yang difokuskan untuk top_categories & weekly_chart", schema: new OA\Schema(type: 'string', enum: ['income', 'outcome'], default: 'outcome')),
            new OA\Parameter(name: 'period', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['month', '3months', 'year'], default: 'month')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Statistik transaksi',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'total_income', type: 'number', format: 'float', example: 5000000),
                    new OA\Property(property: 'total_expense', type: 'number', format: 'float', example: 2000000),
                    new OA\Property(property: 'net_savings', type: 'number', format: 'float', example: 3000000),
                    new OA\Property(property: 'top_categories', type: 'array', items: new OA\Items(
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'category_name', type: 'string', nullable: true, example: 'Makanan'),
                            new OA\Property(property: 'total', type: 'number', format: 'float', example: 1000000),
                            new OA\Property(property: 'percentage', type: 'number', example: 50),
                        ]
                    )),
                    new OA\Property(property: 'weekly_chart', type: 'array', items: new OA\Items(
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'day', type: 'string', example: 'Mon'),
                            new OA\Property(property: 'total', type: 'number', format: 'float', example: 250000),
                        ]
                    )),
                    new OA\Property(property: 'transactions', type: 'array', items: new OA\Items(ref: '#/components/schemas/Transaction')),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(Request $request)
    {
        $type = $request->query('type', 'outcome');
        $period = $request->query('period', 'month');

        // Mapping frontend -> database
        $transactionType =
            $type === 'income'
            ? 'INCOME'
            : 'EXPENSE';

        /*
        |--------------------------------------------------------------------------
        | BASE QUERY
        |--------------------------------------------------------------------------
        */

        $query = Transaction::query()
            ->where('user_id', auth()->id())
            ->where('transaction_type', $transactionType);

        /*
        |--------------------------------------------------------------------------
        | FILTER PERIOD
        |--------------------------------------------------------------------------
        */

        if ($period === 'month') {

            $query->whereMonth(
                'transaction_date',
                now()->month
            )->whereYear(
                'transaction_date',
                now()->year
            );

        } elseif ($period === '3months') {

            $query->whereBetween(
                'transaction_date',
                [
                    now()->subMonths(3),
                    now()
                ]
            );

        } elseif ($period === 'year') {

            $query->whereYear(
                'transaction_date',
                now()->year
            );
        }

        /*
        |--------------------------------------------------------------------------
        | GET TRANSACTIONS
        |--------------------------------------------------------------------------
        */

        $transactions = $query->get();

        /*
        |--------------------------------------------------------------------------
        | TOTAL INCOME
        |--------------------------------------------------------------------------
        */

        $totalIncomeQuery = Transaction::query()
            ->where('user_id', auth()->id())
            ->where('transaction_type', 'INCOME');

        if ($period === 'month') {

            $totalIncomeQuery
                ->whereMonth('transaction_date', now()->month)
                ->whereYear('transaction_date', now()->year);

        } elseif ($period === '3months') {

            $totalIncomeQuery->whereBetween(
                'transaction_date',
                [now()->subMonths(3), now()]
            );

        } elseif ($period === 'year') {

            $totalIncomeQuery
                ->whereYear('transaction_date', now()->year);
        }

        $totalIncome = $totalIncomeQuery->sum('transaction_amount');

        /*
        |--------------------------------------------------------------------------
        | TOTAL EXPENSE
        |--------------------------------------------------------------------------
        */

        $totalExpenseQuery = Transaction::query()
            ->where('user_id', auth()->id())
            ->where('transaction_type', 'EXPENSE');

        if ($period === 'month') {

            $totalExpenseQuery
                ->whereMonth('transaction_date', now()->month)
                ->whereYear('transaction_date', now()->year);

        } elseif ($period === '3months') {

            $totalExpenseQuery->whereBetween(
                'transaction_date',
                [now()->subMonths(3), now()]
            );

        } elseif ($period === 'year') {

            $totalExpenseQuery
                ->whereYear('transaction_date', now()->year);
        }

        $totalExpense = $totalExpenseQuery->sum('transaction_amount');

        /*
        |--------------------------------------------------------------------------
        | NET SAVINGS
        |--------------------------------------------------------------------------
        */

        $netSavings = $totalIncome - $totalExpense;

        /*
        |--------------------------------------------------------------------------
        | TOP CATEGORIES
        |--------------------------------------------------------------------------
        */
        $baseTotal =
            $transactionType === 'INCOME'
            ? (float) $totalIncome
            : (float) $totalExpense;


        $topCategories = $transactions
        ->groupBy('category_id')
        ->map(function ($items) use ($baseTotal) {

            $first = $items->first();

            $total = $items->sum(function ($transaction) {
                return (float) $transaction->transaction_amount;
            });

            $percentage =
                $baseTotal > 0
                ? round(($total / $baseTotal) * 100)
                : 0;

            return [
                'category_name' => optional($first->category)->category_name,
                'total' => $total,
                'percentage' => $percentage,
            ];
        })
        ->sortByDesc('total')
        ->take(4)
        ->values();

        /*
        |--------------------------------------------------------------------------
        | WEEKLY CHART
        |--------------------------------------------------------------------------
        */

        $weeklyChartQuery = Transaction::select(
            DB::raw("TO_CHAR(transaction_date, 'Dy') as day"),
            DB::raw('SUM(transaction_amount) as total')
        )
        ->where('user_id', auth()->id())
        ->where('transaction_type', $transactionType);

    if ($period === 'month') {

        $weeklyChartQuery
            ->whereMonth('transaction_date', now()->month)
            ->whereYear('transaction_date', now()->year);

    } elseif ($period === '3months') {

        $weeklyChartQuery->whereBetween(
            'transaction_date',
            [now()->subMonths(3), now()]
        );

    } elseif ($period === 'year') {

        $weeklyChartQuery
            ->whereYear('transaction_date', now()->year);
    }

    $weeklyChart = $weeklyChartQuery
        ->groupBy('day')
        ->get();

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'net_savings' => $netSavings,

            'top_categories' => $topCategories,

            'weekly_chart' => $weeklyChart,

            'transactions' => $transactions,
        ]);
    }
}