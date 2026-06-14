<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

class NotificationController extends Controller
{
    // ─── GET /api/notifications ───────────────────────────────────
    #[OA\Get(
        path: '/notifications',
        operationId: 'getNotifications',
        summary: 'Daftar notifikasi milik pengguna',
        description: 'Mendukung filter `type` (boleh dipisah koma, contoh: `alert,reminder`), filter `unread=true`, dan pagination.',
        tags: ['Notifications'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'type', in: 'query', required: false, schema: new OA\Schema(type: 'string'), example: 'alert,reminder'),
            new OA\Parameter(name: 'unread', in: 'query', required: false, schema: new OA\Schema(type: 'boolean')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 10)),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Daftar notifikasi',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Notification')),
                    new OA\Property(property: 'meta', type: 'object', properties: [
                        new OA\Property(property: 'current_page', type: 'integer', example: 1),
                        new OA\Property(property: 'last_page', type: 'integer', example: 3),
                        new OA\Property(property: 'per_page', type: 'integer', example: 10),
                        new OA\Property(property: 'total', type: 'integer', example: 25),
                        new OA\Property(property: 'unread_count', type: 'integer', example: 4),
                    ]),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(Request $request)
    {
        $query = Notification::where('user_id', Auth::id());

        if ($request->filled('type')) {
            $types = array_filter(array_map('trim', explode(',', $request->query('type'))));
            if (!empty($types)) {
                $query->whereIn('type', $types);
            }
        }

        if ($request->boolean('unread')) {
            $query->where('is_read', false);
        }

        $perPage = (int) $request->query('per_page', 10);
        $perPage = $perPage > 0 ? min($perPage, 100) : 10;

        $notifications = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $unreadCount = Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success' => true,
            'data'    => $notifications->items(),
            'meta'    => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'per_page'     => $notifications->perPage(),
                'total'        => $notifications->total(),
                'unread_count' => $unreadCount,
            ],
        ]);
    }

    // ─── GET /api/notifications/unread-count ──────────────────────
    #[OA\Get(
        path: '/notifications/unread-count',
        operationId: 'getUnreadNotificationCount',
        summary: 'Jumlah notifikasi yang belum dibaca',
        tags: ['Notifications'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Jumlah notifikasi belum dibaca',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'unread_count', type: 'integer', example: 4),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function unreadCount()
    {
        $unreadCount = Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success'      => true,
            'unread_count' => $unreadCount,
        ]);
    }

    // ─── PUT /api/notifications/{id}/read ─────────────────────────
    #[OA\Put(
        path: '/notifications/{id}/read',
        operationId: 'markNotificationAsRead',
        summary: 'Tandai satu notifikasi sebagai sudah dibaca',
        tags: ['Notifications'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Notifikasi ditandai sudah dibaca',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Notification'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Notifikasi tidak ditemukan', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        ]
    )]
    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', Auth::id())->find($id);

        if (!$notification) {
            return response()->json([
                'message' => 'Notifikasi tidak ditemukan.',
            ], 404);
        }

        if (!$notification->is_read) {
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => $notification->fresh(),
        ]);
    }

    // ─── PUT /api/notifications/read-all ──────────────────────────
    #[OA\Put(
        path: '/notifications/read-all',
        operationId: 'markAllNotificationsAsRead',
        summary: 'Tandai semua notifikasi sebagai sudah dibaca',
        tags: ['Notifications'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Semua notifikasi ditandai sudah dibaca',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Semua notifikasi ditandai sudah dibaca.'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi ditandai sudah dibaca.',
        ]);
    }

    // ─── DELETE /api/notifications/{id} ───────────────────────────
    #[OA\Delete(
        path: '/notifications/{id}',
        operationId: 'deleteNotification',
        summary: 'Hapus notifikasi',
        tags: ['Notifications'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Notifikasi berhasil dihapus',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Notifikasi berhasil dihapus.'),
                ])
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Notifikasi tidak ditemukan', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        ]
    )]
    public function destroy($id)
    {
        $notification = Notification::where('user_id', Auth::id())->find($id);

        if (!$notification) {
            return response()->json([
                'message' => 'Notifikasi tidak ditemukan.',
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil dihapus.',
        ]);
    }
}
