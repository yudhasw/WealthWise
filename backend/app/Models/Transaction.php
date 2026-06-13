<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'account_id',
        'to_account_id',
        'transaction_amount',
        'transaction_type',
        'transaction_date',
        'description'
    ];

    protected $casts = [
        'transaction_amount' => 'float',
        'transaction_date' => 'datetime',
        'transaction_amount' => 'decimal:2', 
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        static::saved(function ($transaction) {
            if ($transaction->account) {
                $transaction->account->recalculateBalance(); 
            }
        });

        static::deleted(function ($transaction) {
            if ($transaction->account) {
                $transaction->account->recalculateBalance();
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function sourceAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function destinationAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'to_account_id');
    }

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function toAccount()
    {
        return $this->belongsTo(Account::class, 'to_account_id');
    }
}