<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FinancialHealthService;
use Illuminate\Support\Facades\Http;

class FinancialHealthController extends Controller
{
    protected $financialService;

    public function __construct(FinancialHealthService $financialService)
    {
        $this->financialService = $financialService;
    }

    public function index()
    {
        $data = $this->financialService->getSummaryData();
        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

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