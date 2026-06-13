<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('financial_goals', function (Blueprint $table) {
            // Tambah hanya kolom yang belum ada
            if (!Schema::hasColumn('financial_goals', 'start_date')) {
                $table->date('start_date')->nullable()->after('current_amount');
            }
            if (!Schema::hasColumn('financial_goals', 'target_date')) {
                $table->date('target_date')->nullable()->after('start_date');
            }
            if (!Schema::hasColumn('financial_goals', 'color_theme')) {
                $table->string('color_theme')->nullable()->default('#067A55')->after('icon');
            }
            // Pastikan filling_plan & amount_per_period ada
            if (!Schema::hasColumn('financial_goals', 'filling_plan')) {
                $table->string('filling_plan')->default('monthly')->after('current_amount');
            }
            if (!Schema::hasColumn('financial_goals', 'amount_per_period')) {
                $table->decimal('amount_per_period', 15, 2)->default(0)->after('filling_plan');
            }
        });
    }

    public function down(): void
    {
        Schema::table('financial_goals', function (Blueprint $table) {
            $table->dropColumn([
                'start_date', 'target_date', 'color_theme',
                'filling_plan', 'amount_per_period',
            ]);
        });
    }
};