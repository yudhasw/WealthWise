<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class FinancialGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'goal_name',
        'target_amount',
        'current_amount',
        'filling_plan',
        'amount_per_period',
        'start_date',
        'target_date',
        'icon',
        'color_theme',
    ];

    protected $casts = [
        'target_amount'    => 'float',
        'current_amount'   => 'float',
        'amount_per_period'=> 'float',
        'start_date'       => 'date',
        'target_date'      => 'date',
    ];

    protected $appends = [
        'progress_percentage',
        'remaining_amount',
        'estimated_completion',
        'time_remaining_human',
        'available_plans',
    ];

    // ─── Accessors ────────────────────────────────────────────────

    public function getProgressPercentageAttribute(): float
    {
        if ($this->target_amount <= 0) return 0;
        return min(100, round(($this->current_amount / $this->target_amount) * 100, 1));
    }

    public function getRemainingAmountAttribute(): float
    {
        return max(0, $this->target_amount - $this->current_amount);
    }

    public function getEstimatedCompletionAttribute(): ?string
    {
        if ($this->amount_per_period <= 0) return null;
        $remaining = $this->remaining_amount;
        if ($remaining <= 0) return 'Completed';

        $periodsLeft = ceil($remaining / $this->amount_per_period);

        $now = Carbon::now();
        return match($this->filling_plan) {
            'DAILY'   => $now->addDays($periodsLeft)->format('d M Y'),
            'WEEKLY'  => $now->addWeeks($periodsLeft)->format('d M Y'),
            'MONTHLY' => $now->addMonths($periodsLeft)->format('d M Y'),
            default   => null,
        };
    }

    public function getTimeRemainingHumanAttribute(): string
    {
        $targetDate = $this->target_date;
        if (!$targetDate) return 'No deadline';

        $now = Carbon::now()->startOfDay();
        $target = Carbon::parse($targetDate)->startOfDay();

        if ($now->gt($target)) return 'Overdue';
        if ($now->eq($target)) return 'Due today';

        $diff = $now->diff($target);

        if ($diff->y > 0) return $diff->y . ' year' . ($diff->y > 1 ? 's' : '') . ' left';
        if ($diff->m > 0) return $diff->m . ' month' . ($diff->m > 1 ? 's' : '') . ' left';
        if ($diff->d > 0) return $diff->d . ' day' . ($diff->d > 1 ? 's' : '') . ' left';

        return 'Due today';
    }

    public function getAvailablePlansAttribute(): array
    {
        if (!$this->start_date || !$this->target_date) return [];
        return self::calculateAvailablePlans(
            $this->target_amount,
            $this->start_date,
            $this->target_date
        );
    }

    // ─── Static Helper (dipakai juga oleh Controller) ─────────────

    /**
     * Hitung available plans + amount per period.
     * Return: [ ['plan'=>'monthly','amount'=>2000000], ... ]
     */
    public static function calculateAvailablePlans(
        float $targetAmount,
        $startDate,
        $targetDate
    ): array {
        $start  = Carbon::parse($startDate)->startOfDay();
        $end    = Carbon::parse($targetDate)->startOfDay();
        $days   = $start->diffInDays($end);

        $plans = [];

        // DAILY — selalu ada kalau durasi >= 1 hari
        if ($days >= 1) {
            $plans[] = [
                'plan'   => 'DAILY',
                'label'  => 'Daily',
                'amount' => $days > 0 ? round($targetAmount / $days, 2) : $targetAmount,
            ];
        }

        // WEEKLY — durasi >= 7 hari
        if ($days >= 7) {
            $weeks   = $start->diffInWeeks($end);
            $weeks   = max(1, $weeks);
            $plans[] = [
                'plan'   => 'WEEKLY',
                'label'  => 'Weekly',
                'amount' => round($targetAmount / $weeks, 2),
            ];
        }

        // MONTHLY — durasi >= 30 hari
        if ($days >= 30) {
            $months  = $start->diffInMonths($end);
            $months  = max(1, $months);
            $plans[] = [
                'plan'   => 'MONTHLY',
                'label'  => 'Monthly',
                'amount' => round($targetAmount / $months, 2),
            ];
        }

        return $plans;
    }

    /**
     * Hitung amount_per_period berdasarkan plan yang dipilih.
     */
    public static function calculateAmountPerPeriod(
        float $targetAmount,
        string $plan,
        $startDate,
        $targetDate
    ): float {
        $plans = self::calculateAvailablePlans($targetAmount, $startDate, $targetDate);
        foreach ($plans as $p) {
            if ($p['plan'] === $plan) return $p['amount'];
        }
        // fallback
        return $targetAmount;
    }

    // ─── Relationship ──────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}