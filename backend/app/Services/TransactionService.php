<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    /**
     * Mengambil transaksi terbaru untuk dashboard
     */
    public function getRecent($userId, $limit = 5)
    {   
        return Transaction::with(['category', 'account'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->limit($limit) 
            ->get()
            ->map(function($trx) {
                return [
                    'id'                 => $trx->id,
                    'transaction_amount' => $trx->transaction_amount,
                    'transaction_type'   => $trx->transaction_type,
                    'transaction_date'   => $trx->transaction_date,
                    'description'        => $trx->description,
                    'category'           => [
                        'id'   => $trx->category->id,
                        'name' => $trx->category->category_name,
                    ],
                    'account'            => [
                        'id'   => $trx->account->id,
                        'name' => $trx->account->account_name,
                    ],
                ];
            });
    }
}