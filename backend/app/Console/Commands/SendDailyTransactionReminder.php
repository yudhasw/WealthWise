<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;

class SendDailyTransactionReminder extends Command
{
    protected $signature = 'notifications:daily-reminder';

    protected $description = 'Kirim notifikasi pengingat ke pengguna yang belum mencatat transaksi hari ini';

    public function handle(NotificationService $notificationService): int
    {
        $count = $notificationService->sendDailyTransactionReminders();

        $this->info("Reminder dikirim ke {$count} pengguna.");

        return self::SUCCESS;
    }
}
