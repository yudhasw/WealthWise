<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Nullable karena transfer tidak butuh kategori
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete(); 
            
            // Akun asal (wajib)
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            
            // Akun tujuan (nullable, hanya diisi kalau tipenya TRANSFER)
            $table->foreignId('to_account_id')->nullable()->constrained('accounts')->cascadeOnDelete();
            
            // Menggunakan decimal untuk uang, atau bigInteger jika spesifik IDR tanpa desimal
            $table->decimal('transaction_amount', 15, 2); 
            $table->enum('transaction_type', ['INCOME', 'EXPENSE', 'TRANSFER']);
            $table->dateTime('transaction_date');
            
            // Deskripsi dibuat nullable agar user bisa kosongi jika sedang buru-buru
            $table->text('description')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};