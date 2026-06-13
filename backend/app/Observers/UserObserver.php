<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        $categories = [
            ['category_name' => 'Food & Drinks', 'type' => 'EXPENSE'],
            ['category_name' => 'Transport',     'type' => 'EXPENSE'],
            ['category_name' => 'Shopping',      'type' => 'EXPENSE'],
            ['category_name' => 'Health',        'type' => 'EXPENSE'],
            ['category_name' => 'Entertainment', 'type' => 'EXPENSE'],
            ['category_name' => 'Salary',        'type' => 'INCOME'],
            ['category_name' => 'Freelance',     'type' => 'INCOME'],
        ];

        foreach ($categories as $category) {
            $user->categories()->create($category);
        }

        $accounts = [
            ['account_name' => 'Cash',     'account_type' => 'CASH',     'balance' => 0],
            ['account_name' => 'Bank',     'account_type' => 'BANK',     'balance' => 0],
            ['account_name' => 'E-Wallet', 'account_type' => 'E_WALLET', 'balance' => 0],
        ];

        foreach ($accounts as $account) {
            $user->accounts()->create($account);
        }
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        //
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }
}