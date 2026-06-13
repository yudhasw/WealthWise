<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Account;
use App\Models\Insight;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class FinancialHealthService
{
    public function getSummaryData()
    {
        $userId = Auth::id(); 

        $transactions = Transaction::where('user_id', $userId)->get();
        $accounts = Account::where('user_id', $userId)->get();

        $totalIncome = $transactions->where('transaction_type', 'INCOME')->sum('transaction_amount');
        $totalExpense = $transactions->where('transaction_type', 'EXPENSE')->sum('transaction_amount');
        $netWorth = $accounts->sum('balance');

        $savingRatio = $totalIncome > 0 ? round((($totalIncome - $totalExpense) / $totalIncome) * 100) : 0;
        $expenseRatio = $totalIncome > 0 ? round(($totalExpense / $totalIncome) * 100) : 0;
        
        $avgMonthlyExpense = $totalExpense > 0 ? $totalExpense : 1;
        $emergencyMonths = round($netWorth / $avgMonthlyExpense, 1);
        
        $totalExpense = $transactions->where('transaction_type', 'EXPENSE')
                             ->sum('transaction_amount');

        $expenseRatio = $totalIncome > 0 ? round(($totalExpense / $totalIncome) * 100) : 0;

        $score = 100;
        if ($expenseRatio > 70) $score -= 30; elseif ($expenseRatio > 50) $score -= 15;
        if ($savingRatio < 10) $score -= 20; elseif ($savingRatio < 20) $score -= 10;
        if ($emergencyMonths < 3) $score -= 20; elseif ($emergencyMonths < 6) $score -= 10;
        $score = max(0, min(100, $score));

        // --- 2. LOGIKA AI INSIGHTS ---
        
        // Cek apakah insight hari ini sudah digenerate agar tidak boros API Groq
        $todayInsights = Insight::where('user_id', $userId)
                                ->whereDate('created_at', Carbon::today())
                                ->get();

        // Jika database belum punya insight hari ini, panggil Groq!
        if ($todayInsights->isEmpty() && ($totalIncome > 0 || $totalExpense > 0)) {
            $todayInsights = $this->generateInsightsFromGroq($userId, $savingRatio, $expenseRatio, $emergencyMonths, $score);
        }

        return [
            'summary' => [
                'netWorth' => $netWorth,
                'savingRatio' => $savingRatio,
                'expenseRatio' => $expenseRatio,
                'emergencyMonths' => $emergencyMonths,
                'expenseRatio' => $expenseRatio,
                'score' => $score,
            ],
            // Map data dari database agar formatnya cocok dengan React
            'insights' => $todayInsights->map(function ($insight) {
                return [
                    'emoji' => $insight->emoji,
                    'title' => $insight->title,
                    'desc' => $insight->desc,
                    'actionLabel' => $insight->actionLabel,
                    'urgent' => (bool) $insight->urgent,
                ];
            })
        ];
    }

    // Fungsi khusus menembak Groq dan menyimpan JSON-nya
    private function generateInsightsFromGroq($userId, $savingRatio, $expenseRatio, $emergencyMonths, $score)
    {
        $prompt = "Kamu adalah analis keuangan. Analisis profil pengguna berikut:\n" .
                  "- Saving Ratio: {$savingRatio}%\n" .
                  "- Expense Ratio: {$expenseRatio}%\n" .
                  "- Dana Darurat: {$emergencyMonths} bulan\n" .
                  "- Skor Kesehatan: {$score}/100\n\n" .
                  "Buat 2 insight penting dalam Bahasa Indonesia. " .
                  "WAJIB kembalikan response HANYA dalam format JSON ARRAY murni (tanpa tag markdown ```json). " .
                  "Format persis seperti ini:\n" .
                  '[{"emoji": "🚨", "title": "Judul", "desc": "Penjelasan detail maksimal 2 kalimat", "actionLabel": "Teks Tombol", "urgent": true}]';

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => [['role' => 'system', 'content' => $prompt]],
                'temperature' => 0.3,
            ]);

            if ($response->successful()) {
                $content = $response->json()['choices'][0]['message']['content'];
                
                // 1. REKAM APA KATA GROQ KE LOG (Untuk debugging)
                \Illuminate\Support\Facades\Log::info("Balasan Asli Groq: " . $content);

                // 2. EKSTRAK HANYA ARRAY JSON-NYA SAJA MENGGUNAKAN REGEX
                // Mencari apa pun yang berada di antara [ dan ]
                preg_match('/\[.*\]/s', $content, $matches);
                
                if (!empty($matches) && isset($matches[0])) {
                    // Coba terjemahkan teks yang sudah dibersihkan ke Array PHP
                    $aiInsights = json_decode($matches[0], true);

                    if (is_array($aiInsights)) {
                        // Simpan hasil dari Groq ke Database
                        foreach ($aiInsights as $item) {
                            Insight::create([
                                'user_id' => $userId,
                                'emoji' => $item['emoji'] ?? '💡',
                                'title' => $item['title'] ?? 'Insight Keuangan',
                                'desc' => $item['desc'] ?? '-',
                                'actionLabel' => $item['actionLabel'] ?? null,
                                'urgent' => $item['urgent'] ?? false,
                            ]);
                        }
                        // Ambil ulang dari database agar ID terikat
                        return Insight::where('user_id', $userId)->whereDate('created_at', Carbon::today())->get();
                    } else {
                        \Illuminate\Support\Facades\Log::error("JSON Decode Gagal. Hasil Regex: " . $matches[0]);
                    }
                } else {
                    \Illuminate\Support\Facades\Log::error("Regex tidak menemukan Array JSON pada: " . $content);
                }
            } else {
                \Illuminate\Support\Facades\Log::error("Groq API Error: " . $response->body());
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Exception FinancialService: " . $e->getMessage());
        }

        // Jika gagal di titik mana pun, kembalikan kosong agar React tidak crash
        return collect([]);
    }
}