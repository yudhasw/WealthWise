<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class FinancialStatsService
{
    /**
     * Menghitung total pemasukan (INCOME)
     */
    public function getTotalIncome($userId)
    {
        return (float) Transaction::where('user_id', $userId)
            ->where('transaction_type', 'INCOME')
            ->sum('transaction_amount');
    }

    /**
     * Menghitung total pengeluaran (EXPENSE)
     */
    public function getTotalExpense($userId)
    {
        return (float) Transaction::where('user_id', $userId)
            ->where('transaction_type', 'EXPENSE')
            ->sum('transaction_amount');
    }

    /**
     * Menghitung sisa saldo (Net Balance)
     */
    public function getNetBalance($userId)
    {
        // Langsung memanggil fungsi yang sudah kita buat di atas
        $totalIncome = $this->getTotalIncome($userId);
        $totalExpense = $this->getTotalExpense($userId);
        
        return $totalIncome - $totalExpense;
    }

    /**
     * Mencari kategori pengeluaran paling besar
     */
    public function getTopCategory($userId)
    {
        $topCategory = Transaction::select('categories.category_name', DB::raw('SUM(transactions.transaction_amount) as total'))
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)
            ->where('transactions.transaction_type', 'EXPENSE')
            ->groupBy('categories.category_name')
            ->orderByDesc('total')
            ->first();

        return $topCategory ? $topCategory->category_name : 'Belum ada pengeluaran';
    }

    /**
     * Menghitung total pengeluaran dikelompokkan berdasarkan kategori
     */
    public function getExpenseChartData($userId)
    {
        return Transaction::join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $userId)
            ->where('transactions.transaction_type', 'EXPENSE')
            ->groupBy('categories.category_name')
            ->selectRaw('categories.category_name, SUM(transactions.transaction_amount) as total')
            ->pluck('total', 'categories.category_name') 
            ->toArray();
    }
    
    /**
     * Menggabungkan fungsi financialStats untuk Dashboard
     */
    public function getDashboardSummary($userId)
    {
        return [
            'total_income'  => $this->getTotalIncome($userId),
            'total_expense' => $this->getTotalExpense($userId),
            'net_balance'   => $this->getNetBalance($userId),
            'top_category'  => $this->getTopCategory($userId),
            'chart'         => $this->getExpenseChartData($userId),
        ];
    }
}