<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'account_name',
        'account_type',
        'balance'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recalculateBalance()
    {
        $income = $this->transactions()->where('transaction_type', 'INCOME')->sum('transaction_amount');
        $expense = $this->transactions()->where('transaction_type', 'EXPENSE')->sum('transaction_amount');
        
        $this->balance = $income - $expense;
        $this->save();
    }

    public function outgoingTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'account_id');
    }

    public function incomingTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'to_account_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}