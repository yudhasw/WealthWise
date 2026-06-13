import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Settings,
  Target,
  BellRing,
  Loader2,
  CheckCheck,
} from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";

// Mapping tab -> filter tipe notifikasi yang dikirim ke backend
const TAB_TYPE_MAP = {
  All: null,
  Alerts: "alert,reminder",
  Insights: "insight",
  System: "system",
};

// Tampilan (ikon, warna, label) berdasarkan tipe notifikasi
const TYPE_META = {
  alert: {
    iconBg: "bg-[#FCA5A5]/40",
    iconColor: "text-red-600",
    icon: AlertTriangle,
  },
  insight: {
    iconBg: "bg-[#6EE7B7]/60",
    iconColor: "text-[#047857]",
    icon: Sparkles,
  },
  transaction: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: CheckCircle2,
    tag: "TRANSACTION",
  },
  system: {
    iconBg: "bg-gray-300",
    iconColor: "text-gray-600",
    icon: Settings,
  },
  goal: {
    iconBg: "bg-[#6EE7B7]",
    iconColor: "text-[#047857]",
    icon: Target,
  },
  reminder: {
    iconBg: "bg-amber-200",
    iconColor: "text-amber-700",
    icon: BellRing,
    tag: "REMINDER",
  },
};

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NotificationPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, unread_count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Dibungkus microtask agar setState tidak dipanggil secara sinkron saat effect berjalan
  const fetchNotifications = useCallback((page, append) => {
    const setBusy = append ? setIsLoadingMore : setIsLoading;

    return Promise.resolve().then(async () => {
      setBusy(true);
      try {
        const res = await getNotifications({
          type: TAB_TYPE_MAP[activeTab],
          page,
          perPage: 10,
        });
        setNotifications((prev) => (append ? [...prev, ...res.data] : res.data));
        setMeta(res.meta);
        setError(null);
      } catch (err) {
        console.error("Gagal mengambil notifikasi:", err);
        setError("Gagal memuat notifikasi. Pastikan server berjalan dan Anda sudah login.");
      } finally {
        setBusy(false);
      }
    });
  }, [activeTab]);

  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // Fungsi menandai semua sebagai terbaca
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setMeta((prev) => ({ ...prev, unread_count: 0 }));
    } catch (err) {
      console.error("Gagal menandai semua notifikasi sebagai terbaca:", err);
    }
  };

  // Fungsi menandai satu notifikasi sebagai terbaca ketika di-klik
  const markAsRead = async (notif) => {
    if (notif.is_read) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
    );
    setMeta((prev) => ({ ...prev, unread_count: Math.max(0, prev.unread_count - 1) }));

    try {
      await markNotificationAsRead(notif.id);
    } catch (err) {
      console.error("Gagal menandai notifikasi sebagai terbaca:", err);
    }
  };

  const loadMore = () => {
    if (meta.current_page < meta.last_page && !isLoadingMore) {
      fetchNotifications(meta.current_page + 1, true);
    }
  };

  return (
    <MainLayout isLoading={isLoading}>
      {/* Wrapper untuk Dark Mode Content */}
      <div className="bg-[#1A1C20] min-h-[85vh] rounded-[32px] p-8 md:p-10 shadow-2xl">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Notification Center
            </h1>
            {meta.unread_count > 0 && (
              <span className="bg-[#6EE7B7] text-[#047857] text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                {meta.unread_count} NEW
              </span>
            )}
          </div>

          <button
            onClick={markAllAsRead}
            disabled={meta.unread_count === 0}
            className="flex items-center gap-2 text-[#6EE7B7] hover:text-white transition-colors text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-[#6EE7B7]"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        </div>

        {/* TABS */}
        <div className="bg-[#132A24] inline-flex rounded-xl p-1 mb-8">
          {Object.keys(TAB_TYPE_MAP).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm transition-all ${
                activeTab === tab
                  ? "bg-[#6EE7B7] text-[#047857] font-bold shadow-sm"
                  : "text-gray-300 font-medium hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* NOTIFICATION LIST */}
        <div className="flex flex-col gap-4">
          {!isLoading && notifications.length === 0 ? (
            // Placeholder jika filter kosong
            <div className="text-center py-10">
              <p className="text-gray-400 font-medium">Tidak ada notifikasi di kategori ini.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const typeMeta = TYPE_META[notif.type] || TYPE_META.system;
              const Icon = typeMeta.icon;

              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif)}
                  className={`flex flex-col sm:flex-row gap-5 p-6 rounded-[20px] cursor-pointer transition-all ${
                    notif.is_read
                      ? "bg-[#D1D5DB] hover:bg-[#c4c8ce]"
                      : "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:bg-gray-50"
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${typeMeta.iconBg} ${typeMeta.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-lg font-bold ${notif.is_read ? "text-gray-700" : "text-[#111827]"}`}>
                        {notif.title}
                      </h3>
                      {/* Green dot for unread */}
                      {!notif.is_read && (
                        <span className="w-2.5 h-2.5 bg-[#10B981] rounded-full shrink-0"></span>
                      )}
                    </div>

                    <p className={`text-sm leading-relaxed mb-3 pr-4 ${notif.is_read ? "text-gray-600" : "text-[#4B5563]"}`}>
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3">
                      <span className="text-[#6B7280] text-xs font-medium">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                      {typeMeta.tag && (
                        <span className="bg-[#E5E7EB] text-[#4B5563] text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">
                          {typeMeta.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* LOAD MORE BUTTON */}
        {meta.current_page < meta.last_page && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="bg-[#E5E7EB] hover:bg-[#D1D5DB] transition-colors text-[#111827] font-semibold py-3 px-6 rounded-full text-sm flex items-center gap-2 disabled:opacity-60"
            >
              {isLoadingMore ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              )}
              Load previous notifications
            </button>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
