<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Account;
use Illuminate\Support\Facades\Http;

class FinancialHealthApiTest extends TestCase
{
    use RefreshDatabase; // Me-reset database setiap kali testing berjalan

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Persiapan: Buat 1 User simulasi
        $this->user = User::factory()->create();
    }

    /**
     * Test Case 1: Pastikan API mengembalikan struktur JSON yang valid.
     */
    public function test_financial_health_endpoint_returns_correct_structure()
    {
        $response = $this->actingAs($this->user)->getJson('/api/financial-health');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'data' => [
                         'summary' => [
                             'netWorth', 'savingRatio', 'expenseRatio', 
                             'emergencyMonths', 'dtiRatio', 'score'
                         ],
                         'insights' => [
                             '*' => ['emoji', 'title', 'desc'] // Memeriksa isi array insights
                         ]
                     ]
                 ]);
    }

    /**
     * Test Case 2: Pastikan kalkulasi rasio dan skor sesuai dengan rumus matematis.
     */
    public function test_financial_calculations_are_accurate()
    {
        // 1. Buat data dummy di database dan simpan ke variabel $account
        $account = Account::create([
            'user_id' => $this->user->id,
            'balance' => 30000000,
            'account_name' => 'BCA', 
            'account_type' => 'BANK', 
        ]);

        Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $account->id, // <-- TAMBAHKAN BARIS INI
            'transaction_type' => 'INCOME',
            'transaction_amount' => 10000000,
            'transaction_date' => '2026-05-12 00:00:00'
            // 'category_id' => 1, // Buka komen ini jika category_id juga wajib diisi
        ]);

        Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $account->id, // <-- TAMBAHKAN BARIS INI
            'transaction_type' => 'EXPENSE',
            'transaction_amount' => 5000000,
            'transaction_date' => '2026-05-12 00:00:00'
            // 'category_id' => 2, // Buka komen ini jika category_id juga wajib diisi
        ]);

        // 2. Jalankan API
        $response = $this->actingAs($this->user)->getJson('/api/financial-health');

        // 3. Verifikasi hasil kalkulasi
        $response->assertStatus(200)
                 ->assertJson([
                     'data' => [
                         'summary' => [
                             'netWorth' => 30000000,
                             'expenseRatio' => 50, // 5jt / 10jt * 100%
                             'savingRatio' => 50, // (10jt-5jt)/10jt * 100%
                             'emergencyMonths' => 6, // 30jt / 5jt
                         ]
                     ]
                 ]);
    }

    /**
     * Test Case 3: Menguji integrasi Chatbot Groq menggunakan teknik "Mocking".
     */
    public function test_chatbot_can_return_ai_response()
    {
        // Cegah Laravel menembak API asli Groq ke internet
        Http::fake([
            'api.groq.com/*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => 'Ini adalah balasan simulasi dari WealthWise AI.'
                        ]
                    ]
                ]
            ], 200)
        ]);

        $payload = [
            'messages' => [
                ['role' => 'user', 'content' => 'Halo, bagaimana kondisi keuanganku?']
            ]
        ];

        $response = $this->actingAs($this->user)->postJson('/api/financial-health/chat', $payload);

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'reply' => 'Ini adalah balasan simulasi dari WealthWise AI.'
                 ]);
    }
}