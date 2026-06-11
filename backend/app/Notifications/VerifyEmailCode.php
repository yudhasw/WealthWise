<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailCode extends Notification
{
    public function __construct(protected string $code)
    {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Kode Verifikasi Email - WealthWise')
            ->greeting('Halo ' . $notifiable->name . ',')
            ->line('Gunakan kode berikut untuk memverifikasi alamat email Anda:')
            ->line(new \Illuminate\Support\HtmlString('<h1 style="text-align:center; letter-spacing: 8px;">' . $this->code . '</h1>'))
            ->line('Kode ini berlaku selama 10 menit.')
            ->line('Jika Anda tidak merasa melakukan pendaftaran ini, abaikan email ini.');
    }
}
