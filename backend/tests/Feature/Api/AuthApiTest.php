<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Notifications\VerifyEmailCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_valid_data()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
                 ->assertJson([
                     'requires_verification' => true,
                     'email' => 'budi@example.com',
                 ])
                 ->assertJsonStructure(['message', 'requires_verification', 'email']);

        $this->assertDatabaseHas('users', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
        ]);

        $user = User::where('email', 'budi@example.com')->first();
        $this->assertTrue(Hash::check('password123', $user->password));
        $this->assertNull($user->email_verified_at);
    }

    public function test_register_sends_verification_code_notification()
    {
        Notification::fake();

        $response = $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'budi@example.com')->first();

        Notification::assertSentTo($user, VerifyEmailCode::class);

        $this->assertNotNull($user->verification_code);
        $this->assertNotNull($user->verification_code_expires_at);
    }

    public function test_verification_code_has_six_digits()
    {
        Notification::fake();

        $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $user = User::where('email', 'budi@example.com')->first();

        $this->assertMatchesRegularExpression('/^\d{6}$/', $user->verification_code);
    }

    public function test_registration_fails_with_missing_fields()
    {
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422)
                 ->assertJsonStructure(['name', 'email', 'password', 'password_confirmation']);
    }

    public function test_registration_fails_with_short_password()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
                 ->assertJsonStructure(['password']);
    }

    public function test_registration_fails_with_duplicate_email()
    {
        User::factory()->create(['email' => 'budi@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonStructure(['email']);
    }

    public function test_user_can_verify_email_with_correct_code()
    {
        $user = User::factory()->unverified()->create();
        $code = $user->generateVerificationCode();

        $response = $this->postJson('/api/email/verify-code', [
            'email' => $user->email,
            'code' => $code,
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['message']);

        $user->refresh();

        $this->assertNotNull($user->email_verified_at);
        $this->assertNull($user->verification_code);
        $this->assertNull($user->verification_code_expires_at);
    }

    public function test_verify_email_fails_with_wrong_code()
    {
        $user = User::factory()->unverified()->create();
        $user->generateVerificationCode();

        $response = $this->postJson('/api/email/verify-code', [
            'email' => $user->email,
            'code' => '000000',
        ]);

        $response->assertStatus(422);

        $user->refresh();
        $this->assertNull($user->email_verified_at);
    }

    public function test_verify_email_fails_with_expired_code()
    {
        $user = User::factory()->unverified()->create();
        $code = $user->generateVerificationCode();

        $user->forceFill([
            'verification_code_expires_at' => now()->subMinute(),
        ])->save();

        $response = $this->postJson('/api/email/verify-code', [
            'email' => $user->email,
            'code' => $code,
        ]);

        $response->assertStatus(422);

        $user->refresh();
        $this->assertNull($user->email_verified_at);
    }

    public function test_verify_email_fails_with_unknown_email()
    {
        $response = $this->postJson('/api/email/verify-code', [
            'email' => 'tidak-ada@example.com',
            'code' => '123456',
        ]);

        $response->assertStatus(404);
    }

    public function test_verify_email_fails_when_already_verified()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/email/verify-code', [
            'email' => $user->email,
            'code' => '123456',
        ]);

        $response->assertStatus(400);
    }

    public function test_resend_code_sends_new_notification_for_unverified_user()
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        $response = $this->postJson('/api/email/resend-code', [
            'email' => $user->email,
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['message']);

        Notification::assertSentTo($user, VerifyEmailCode::class);
    }

    public function test_resend_code_fails_with_unknown_email()
    {
        $response = $this->postJson('/api/email/resend-code', [
            'email' => 'tidak-ada@example.com',
        ]);

        $response->assertStatus(404);
    }

    public function test_resend_code_fails_when_already_verified()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/email/resend-code', [
            'email' => $user->email,
        ]);

        $response->assertStatus(400);
    }
}
