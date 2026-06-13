<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            
            // 1. Tambahkan nullable() agar sistem bisa menyimpan kategori default
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete(); 
            
            // 2. Tambahkan kolom untuk menyimpan nama kategori
            $table->string('category_name');
            
            // 3. Ubah nama kolom menjadi 'type'
            $table->enum('type', ['INCOME', 'EXPENSE']);
            
            $table->timestamps(); 
            $table->softDeletes(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};