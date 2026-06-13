<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
         Schema::create('financial_goals', function (Blueprint $table) {

            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->string('goal_name');

            $table->decimal('target_amount', 15, 2);

            $table->decimal('current_amount', 15, 2)
                ->default(0);

            $table->enum('filling_plan', [
                'DAILY',
                'WEEKLY',
                'MONTHLY'
            ]);

            $table->decimal('amount_per_period', 15, 2);

            $table->date('start_date');

            $table->date('target_date');

            $table->string('icon')->nullable();

            $table->string('color_theme')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_goals');
    }
};