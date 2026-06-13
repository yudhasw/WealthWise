<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use OpenApi\Attributes as OA;

class ReceiptScanController extends Controller
{
    #[OA\Post(
        path: '/receipt/scan',
        operationId: 'scanReceipt',
        summary: 'Scan struk belanja menggunakan AI',
        description: 'Mengunggah foto struk, lalu menggunakan AI (Groq) untuk mengekstrak deskripsi, jumlah, tanggal, dan tipe transaksi.',
        tags: ['Transactions'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    required: ['receipt'],
                    properties: [
                        new OA\Property(
                            property: 'receipt',
                            type: 'string',
                            format: 'binary',
                            description: 'File gambar struk (jpg, jpeg, png, webp, gif), maks 10MB'
                        ),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Data struk berhasil diekstrak',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'success'),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'description', type: 'string', example: 'Indomaret - belanja bulanan'),
                        new OA\Property(property: 'amount', type: 'integer', example: 150000),
                        new OA\Property(property: 'transaction_date', type: 'string', format: 'date', example: '2026-06-12'),
                        new OA\Property(property: 'type', type: 'string', example: 'EXPENSE'),
                    ], type: 'object'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validasi gagal atau gagal membaca data dari struk', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 500, description: 'API key AI tidak dikonfigurasi', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 502, description: 'Gagal menghubungi layanan AI', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        ]
    )]
    public function scan(Request $request)
    {
        $request->validate([
            'receipt' => 'required|file|mimes:jpg,jpeg,png,webp,gif|max:10240',
        ]);

        $file     = $request->file('receipt');
        $base64   = base64_encode(file_get_contents($file->getRealPath()));
        $mimeType = $file->getMimeType();

        $apiKey = config('services.groq.key');

        if (!$apiKey) {
            return response()->json([
                'status'  => 'error',
                'message' => 'API key tidak dikonfigurasi.',
            ], 500);
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type'  => 'application/json',
        ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', [
            'model'      => 'meta-llama/llama-4-scout-17b-16e-instruct',
            'max_tokens' => 512,
            'messages'   => [
                [
                    'role'    => 'user',
                    'content' => [
                        [
                            'type'      => 'image_url',
                            'image_url' => [
                                'url' => "data:{$mimeType};base64,{$base64}",
                            ],
                        ],
                        [
                            'type' => 'text',
                            'text' => <<<PROMPT
Analyze this receipt image and extract the transaction details.
Return ONLY a valid JSON object with exactly these fields:
{
  "description": "merchant name and brief description of purchase",
  "amount": 150000,
  "transaction_date": "2026-05-14",
  "type": "EXPENSE"
}
Rules:
- amount: integer in IDR (Indonesian Rupiah), no decimals
- transaction_date: format YYYY-MM-DD, use today if not visible
- type: always "EXPENSE" for receipts
- description: concise, max 100 chars
Return ONLY the JSON object, no other text.
PROMPT,
                        ],
                    ],
                ],
            ],
        ]);

        if ($response->failed()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal menghubungi layanan AI. Coba lagi.',
            ], 502);
        }

        $rawText = $response->json('choices.0.message.content', '');

        // Extract JSON (handle possible markdown code blocks)
        preg_match('/\{[^{}]*\}/s', $rawText, $matches);
        $jsonString = $matches[0] ?? $rawText;

        $data = json_decode($jsonString, true);

        if (!$data || !isset($data['amount'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal membaca data dari struk. Pastikan gambar jelas dan terbaca.',
            ], 422);
        }

        $data['amount']           = (int) ($data['amount'] ?? 0);
        $data['description']      = substr($data['description'] ?? '', 0, 100);
        $data['transaction_date'] = $data['transaction_date'] ?? now()->format('Y-m-d');
        $data['type']             = 'EXPENSE';

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }
}
