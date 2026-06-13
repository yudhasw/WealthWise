<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Buat satu kategori default sistem (user_id = null)
        Category::create([
            'category_name' => 'Makanan & Minuman',
            'type' => 'EXPENSE',
            'user_id' => null
        ]);
    }

    public function test_user_can_get_categories_including_defaults()
    {
        $user = User::factory()->create();
        
        // Buat kategori custom milik user ini
        Category::create([
            'category_name' => 'Gaji Freelance',
            'type' => 'INCOME',
            'user_id' => $user->id
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/categories');

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data'); // 1 Default + 1 Custom
    }

    public function test_user_can_create_custom_category()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/categories', [
            'category_name' => 'Investasi Saham',
            'type' => 'EXPENSE' // Anggap pengeluaran untuk beli aset
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.category_name', 'Investasi Saham')
                 ->assertJsonPath('data.user_id', $user->id);

        $this->assertDatabaseHas('categories', [
            'category_name' => 'Investasi Saham',
            'user_id' => $user->id
        ]);
    }

    public function test_user_cannot_update_default_system_category()
    {
        $user = User::factory()->create();
        $defaultCategory = Category::whereNull('user_id')->first();

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/categories/{$defaultCategory->id}", [
            'category_name' => 'Makanan Mewah'
        ]);

        // Harus gagal karena bukan miliknya
        $response->assertStatus(403); 
    }

    public function test_user_can_delete_their_own_category()
    {
        $user = User::factory()->create();
        $customCategory = Category::create([
            'category_name' => 'Langganan Netflix',
            'type' => 'EXPENSE',
            'user_id' => $user->id
        ]);

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/categories/{$customCategory->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('categories', [
            'id' => $customCategory->id
        ]);
    }
}