<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'WealthWise API Documentation',
    description: 'Dokumentasi REST API untuk aplikasi manajemen keuangan pribadi WealthWise.'
)]
#[OA\Server(
    url: L5_SWAGGER_CONST_HOST . '/api',
    description: 'API Server'
)]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'Token',
    description: 'Masukkan access token yang didapat dari endpoint /login.'
)]
#[OA\Tag(name: 'Auth', description: 'Registrasi, login, logout, dan verifikasi email')]
#[OA\Tag(name: 'Accounts', description: 'Manajemen akun/dompet keuangan')]
#[OA\Tag(name: 'Transactions', description: 'Manajemen transaksi keuangan')]
#[OA\Tag(name: 'Categories', description: 'Manajemen kategori transaksi')]
#[OA\Tag(name: 'Goals', description: 'Manajemen target keuangan')]
#[OA\Tag(name: 'Dashboard', description: 'Ringkasan dashboard')]
#[OA\Tag(name: 'Statistics', description: 'Statistik & laporan keuangan')]
#[OA\Tag(name: 'Financial Health', description: 'Skor kesehatan finansial & chatbot AI')]
#[OA\Tag(name: 'Profile', description: 'Manajemen profil pengguna')]
abstract class Controller
{
    //
}
