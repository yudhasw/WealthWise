<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FinancialStatsController;
use App\Http\Controllers\Api\DashboardController;

use App\Http\Controllers\Api\StatisticsController;
use App\Http\Controllers\Api\ReceiptScanController;
use App\Http\Controllers\Api\FinancialHealthController;
use App\Http\Controllers\Api\FinancialGoalController;
use App\Http\Controllers\Api\ProfileController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/accounts', [AccountController::class, 'index']);
    Route::post('/accounts', [AccountController::class, 'store']);
    Route::get('/accounts/total', [AccountController::class, 'totalBalance']);

    Route::get('/accounts/{id}', [AccountController::class, 'show']);    // Untuk ambil 1 data saat Edit
    Route::put('/accounts/{id}', [AccountController::class, 'update']);  // Untuk simpan perubahan Edit
    Route::delete('/accounts/{id}', [AccountController::class, 'destroy']); // Untuk hapus akun
    
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions/add', [TransactionController::class, 'store']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    Route::put('/transactions/{id}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);
    Route::post('/transactions/receipt/scan', [ReceiptScanController::class, 'scan']);


    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories/add', [CategoryController::class, 'store']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    Route::get('/stats/summary', [FinancialStatsController::class, 'index']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/statistics', [StatisticsController::class, 'index']);

    Route::post('/receipt/scan', [ReceiptScanController::class, 'scan']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::get('/financial-health', [FinancialHealthController::class, 'index']);
    Route::post('/financial-health/chat', [FinancialHealthController::class, 'chat']);

    Route::get('/goals', [FinancialGoalController::class, 'index']);
    Route::post('/goals', [FinancialGoalController::class, 'store']);
    Route::get('/goals/{id}', [FinancialGoalController::class, 'show']);
    Route::put('/goals/{id}', [FinancialGoalController::class, 'update']);
    Route::delete('/goals/{id}', [FinancialGoalController::class, 'destroy']);
    Route::put('/goals/{id}/funds',[FinancialGoalController::class, 'updateFunds']);
});



Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
    ->middleware(['signed'])
    ->name('verification.verify');

Route::get('/test', function() {
    return response()->json(['status' => 'ok', 'message' => 'API works!']);
});