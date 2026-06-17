<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE financial_goals ALTER COLUMN start_date DROP NOT NULL');
        DB::statement('ALTER TABLE financial_goals ALTER COLUMN target_date DROP NOT NULL');
        DB::statement("ALTER TABLE financial_goals ALTER COLUMN color_theme SET DEFAULT '#067A55'");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE financial_goals ALTER COLUMN start_date SET NOT NULL');
        DB::statement('ALTER TABLE financial_goals ALTER COLUMN target_date SET NOT NULL');
        DB::statement('ALTER TABLE financial_goals ALTER COLUMN color_theme DROP DEFAULT');
    }
};
