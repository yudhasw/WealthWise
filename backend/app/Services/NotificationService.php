<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Notification;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Buat notifikasi baru untuk seorang user.
     */
    public function notify(int $userId, string $type, string $title, string $message, array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'type'    => $type,
            'title'   => $title,
            'message' => $message,
            'data'    => $data,
        ]);
    }

    /**
     * Kirim pengingat ke setiap user yang belum mencatat transaksi apapun hari ini.
     * Dipanggil oleh scheduler harian (lihat routes/console.php).
     */
    public function sendDailyTransactionReminders(): int
    {
        $today = Carbon::today();
        $sent = 0;

        User::query()->each(function (User $user) use ($today, &$sent) {
            $hasTransactionToday = Transaction::where('user_id', $user->id)
                ->whereDate('transaction_date', $today)
                ->exists();

            if ($hasTransactionToday) {
                return;
            }

            $alreadyNotifiedToday = Notification::where('user_id', $user->id)
                ->where('type', 'reminder')
                ->whereDate('created_at', $today)
                ->exists();

            if ($alreadyNotifiedToday) {
                return;
            }

            $this->notify(
                $user->id,
                'reminder',
                'Kamu belum membuat catatan hari ini',
                'Yuk catat pemasukan atau pengeluaranmu hari ini agar laporan keuanganmu tetap akurat.',
            );

            $sent++;
        });

        return $sent;
    }

    /**
     * Cek penggunaan budget kategori setelah ada transaksi expense baru,
     * lalu kirim notifikasi alert jika sudah >= 80% atau melebihi limit.
     */
    public function checkBudgetAlert(Transaction $transaction): void
    {
        if ($transaction->transaction_type !== 'EXPENSE' || !$transaction->category_id) {
            return;
        }

        $category = Category::find($transaction->category_id);

        if (!$category || !$category->budget_limit || $category->budget_limit <= 0) {
            return;
        }

        [$start, $end] = $this->getBudgetPeriodRange($category);

        $spent = Transaction::where('user_id', $transaction->user_id)
            ->where('category_id', $category->id)
            ->where('transaction_type', 'EXPENSE')
            ->whereBetween('transaction_date', [$start, $end])
            ->sum('transaction_amount');

        $percentage = ($spent / $category->budget_limit) * 100;

        if ($percentage < 80) {
            return;
        }

        $level = $percentage >= 100 ? 'exceeded' : 'warning';

        $alreadyNotified = Notification::where('user_id', $transaction->user_id)
            ->where('type', 'alert')
            ->whereBetween('created_at', [$start, $end])
            ->get()
            ->contains(fn ($n) => ($n->data['category_id'] ?? null) === $category->id
                && ($n->data['level'] ?? null) === $level);

        if ($alreadyNotified) {
            return;
        }

        $title = $level === 'exceeded'
            ? "Budget Terlampaui: {$category->category_name}"
            : "Budget Alert: {$category->category_name}";

        $message = $level === 'exceeded'
            ? "Pengeluaranmu untuk kategori {$category->category_name} sudah melebihi budget sebesar Rp" . number_format($category->budget_limit, 0, ',', '.') . "."
            : "Kamu sudah menggunakan " . round($percentage) . "% dari budget {$category->category_name}. Atur kembali pengeluaranmu agar tetap sesuai rencana.";

        $this->notify($transaction->user_id, 'alert', $title, $message, [
            'category_id' => $category->id,
            'level'       => $level,
            'percentage'  => round($percentage, 1),
        ]);
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function getBudgetPeriodRange(Category $category): array
    {
        $now = Carbon::now();

        return match ($category->budget_period ?? 'MONTHLY') {
            'WEEKLY' => [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()],
            'YEARLY' => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
            default  => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
        };
    }
}
