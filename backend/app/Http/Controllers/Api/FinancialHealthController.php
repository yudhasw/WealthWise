<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FinancialHealthService;
use Illuminate\Support\Facades\Http;
use OpenApi\Attributes as OA;

class FinancialHealthController extends Controller
{
    protected $financialService;

    public function __construct(FinancialHealthService $financialService)
    {
        $this->financialService = $financialService;
    }

    #[OA\Get(
        path: '/financial-health',
        operationId: 'getFinancialHealth',
        summary: 'Skor kesehatan finansial & insight AI',
        description: 'Mengembalikan ringkasan rasio keuangan beserta insight yang dihasilkan AI (digenerate sekali per hari).',
        tags: ['Financial Health'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Data kesehatan finansial',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'summary', properties: [
                            new OA\Property(property: 'netWorth', type: 'number', format: 'float', example: 5000000),
                            new OA\Property(property: 'savingRatio', type: 'number', example: 40),
                            new OA\Property(property: 'expenseRatio', type: 'number', example: 60),
                            new OA\Property(property: 'emergencyMonths', type: 'number', example: 2.5),
                            new OA\Property(property: 'score', type: 'integer', example: 65),
                        ], type: 'object'),
                        new OA\Property(property: 'insights', type: 'array', items: new OA\Items(
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'emoji', type: 'string', example: '🚨'),
                                new OA\Property(property: 'title', type: 'string', example: 'Rasio Pengeluaran Tinggi'),
                                new OA\Property(property: 'desc', type: 'string', example: 'Pengeluaranmu mencapai 60% dari pemasukan bulan ini.'),
                                new OA\Property(property: 'actionLabel', type: 'string', nullable: true, example: 'Lihat Detail'),
                                new OA\Property(property: 'urgent', type: 'boolean', example: true),
                            ]
                        )),
                    ], type: 'object'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index()
    {
        $data = $this->financialService->getSummaryData();
        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    #[OA\Post(
        path: '/financial-health/chat',
        operationId: 'financialHealthChat',
        summary: 'Chat dengan WealthWise AI Planner',
        description: 'Mengirim riwayat percakapan ke chatbot AI (Groq) yang sudah diberi konteks ringkasan keuangan pengguna.',
        tags: ['Financial Health'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['messages'],
                properties: [
                    new OA\Property(property: 'messages', type: 'array', items: new OA\Items(
                        type: 'object',
                        required: ['role', 'content'],
                        properties: [
                            new OA\Property(property: 'role', type: 'string', enum: ['user', 'assistant'], example: 'user'),
                            new OA\Property(property: 'content', type: 'string', example: 'Bagaimana cara mengatur dana darurat saya?'),
                        ]
                    )),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Balasan dari AI',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'reply', type: 'string', example: 'Cobalah sisihkan minimal 10% dari pemasukan bulananmu untuk dana darurat.'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validasi gagal', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
            new OA\Response(
                response: 500,
                description: 'Gagal menghubungi layanan AI Groq',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'error'),
                    new OA\Property(property: 'message', type: 'string', example: 'API Groq Error'),
                    new OA\Property(property: 'details', type: 'object'),
                    new OA\Property(property: 'status_code', type: 'integer', example: 500),
                ])
            ),
        ]
    )]
    // Endpoint khusus untuk Chatbot AI via Groq
    public function chat(Request $request)
    {
        $request->validate([
            'messages' => 'required|array',
            'messages.*.role' => 'required|string|in:user,assistant',
            'messages.*.content' => 'required|string'
        ]);

        $data = $this->financialService->getSummaryData();
        $summary = (object) $data['summary'];

        $systemPrompt = "Kamu adalah WealthWise AI Planner, asisten keuangan pribadi. " .
            "Berikan saran singkat, praktis, dan ramah dalam Bahasa Indonesia (2-3 kalimat). " .
            "Data pengguna saat ini: Saving Ratio {$summary->savingRatio}%, Expense Ratio {$summary->expenseRatio}%, " .
            "Emergency Fund {$summary->emergencyMonths} bulan, Skor {$summary->score}.";

        $formattedMessages = [
            [
                'role' => 'system',
                'content' => $systemPrompt
            ]
        ];

        foreach ($request->messages as $msg) {
            $formattedMessages[] = [
                'role' => $msg['role'],
                'content' => $msg['content']
            ];
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.groq.com/openai/v1/chat/completions', [
            'model' => 'llama-3.3-70b-versatile',
            'messages' => $formattedMessages,
            'max_tokens' => 1000,
            'temperature' => 0.7,
        ]);

        if ($response->successful()) {
            return response()->json([
                'status' => 'success',
                'reply' => $response->json()['choices'][0]['message']['content']
            ]);
        }

        return response()->json([
            'status' => 'error', 
            'message' => 'API Groq Error',
            'details' => $response->json(),
            'status_code' => $response->status()
        ], 500);
    }
}