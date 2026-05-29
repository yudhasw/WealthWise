import { useState, useEffect, useRef } from "react";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axios";
import Header from "../../components/Header";
import { Link } from "react-router-dom";

// ── Gauge Chart ────────────────────────────────────────────────────
function GaugeChart({ score }) {
  const r = 90;
  const cx = 160;
  const cy = 150;
  const startAngle = -200;
  const endAngle = 20;
  const totalAngle = endAngle - startAngle;
  const valueAngle = startAngle + (score / 100) * totalAngle;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcPath = (from, to, radius) => {
    const x1 = cx + radius * Math.cos(toRad(from));
    const y1 = cy + radius * Math.sin(toRad(from));
    const x2 = cx + radius * Math.cos(toRad(to));
    const y2 = cy + radius * Math.sin(toRad(to));
    const large = to - from > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  const { label, color } =
    score >= 80
      ? { label: "Kondisi Prima", color: "#10b981" }
      : score >= 60
        ? { label: "Cukup Sehat", color: "#f59e0b" }
        : score >= 40
          ? { label: "Perlu Perhatian", color: "#f97316" }
          : { label: "Kritis", color: "#ef4444" };

  return (
    <svg viewBox="0 0 320 200" className="w-full max-w-xs mx-auto">
      <path
        d={arcPath(startAngle, endAngle, r)}
        fill="none"
        stroke="#1f2937"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d={arcPath(startAngle, valueAngle, r)}
        fill="none"
        stroke={color}
        strokeWidth="16"
        strokeLinecap="round"
      />
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fill="white"
        fontSize="48"
        fontWeight="800"
      >
        {score}
      </text>
      <rect
        x={cx - 58}
        y={cy + 28}
        width="116"
        height="26"
        rx="13"
        fill={`${color}25`}
      />
      <circle cx={cx - 40} cy={cy + 41} r="4" fill={color} />
      <text x={cx - 30} y={cy + 46} fill={color} fontSize="12" fontWeight="600">
        {label}
      </text>
    </svg>
  );
}

// ── Metric Card ───────────────────────────────────────────────────
function MetricCard({ title, value, sub, subColor = "#6b7280", icon }) {
  return (
    <div className="bg-[#1a1d21] rounded-2xl p-5 flex flex-col gap-2 border border-white/5 hover:border-white/10 hover:bg-[#1e2126] transition-all duration-200">
      <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">
        {title}
      </p>
      <p className="text-[26px] font-bold text-white leading-none">{value}</p>
      <p
        className="text-xs font-medium flex items-center gap-1"
        style={{ color: subColor }}
      >
        <span>{icon}</span>
        <span>{sub}</span>
      </p>
    </div>
  );
}

// ── Insight Card ──────────────────────────────────────────────────
function InsightCard({ emoji, title, desc, actionLabel, actionHref, urgent }) {
  return (
    <div
      className={`relative bg-[#1a1d21] rounded-2xl p-5 border overflow-hidden transition-all duration-200 hover:bg-[#1e2126] group ${
        urgent
          ? "border-orange-500/40 hover:border-orange-500/60"
          : "border-white/5 hover:border-white/15"
      }`}
    >
      {urgent && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-orange-600" />
      )}

      <div className="flex gap-4 items-start">
        <div
          className={`flex-shrink-0 text-xl w-11 h-11 flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${
            urgent
              ? "bg-orange-500/15 ring-1 ring-orange-500/30"
              : "bg-emerald-500/10 ring-1 ring-emerald-500/20"
          }`}
        >
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h4 className="text-white font-semibold text-sm">{title}</h4>
            {urgent && (
              <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 whitespace-nowrap">
                Perlu Tindakan
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function FinancialHealth() {
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Halo! Saya asisten finansial Anda. Melihat dari data rasio pengeluaran Anda, apakah ada kategori khusus yang ingin Anda optimalkan bulan ini?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/financial-health");
        const { summary, insights } = res.data.data;
        setSummary(summary);
        setInsights(insights);
      } catch (err) {
        console.error("Gagal mengambil data financial health:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      notation: amount >= 1_000_000_000 ? "compact" : "standard",
    }).format(amount || 0);

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || isChatLoading) return;
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", text }];
    setChatMessages(newMessages);
    setIsChatLoading(true);
    try {
      const res = await api.post("/financial-health/chat", {
        messages: newMessages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.text,
        })),
      });
      const reply =
        res.data.reply || "Maaf, saya tidak dapat menjawab saat ini.";
      setChatMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      console.error("Error chat:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Maaf, terjadi kesalahan di server. Coba lagi nanti.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const expenseRatio = summary?.expenseRatio;

  const metrics = [
    {
      title: "Net Worth",
      value: summary ? formatRupiah(summary.netWorth) : "—",
      sub: "+2%",
      subColor: "#10b981",
      icon: "↗",
    },
    {
      title: "Saving Ratio",
      value: summary ? `${summary.savingRatio}%` : "—",
      sub: "Target 20%",
      subColor: "#6b7280",
      icon: "🎯",
    },
    {
      title: "Expense Ratio",
      value: summary ? `${summary.expenseRatio}%` : "—",
      sub: summary?.expenseRatio <= 70 ? "Aman" : "Tinggi",
      subColor: summary?.expenseRatio <= 70 ? "#10b981" : "#ef4444",
      icon: summary?.expenseRatio <= 70 ? "✅" : "⚠️",
    },
    {
      title: "Emergency Fund",
      value: summary ? `${summary.emergencyMonths} mo` : "—",
      sub: "Target 6m",
      subColor: summary?.emergencyMonths >= 6 ? "#10b981" : "#f97316",
      icon: summary?.emergencyMonths >= 6 ? "✅" : "⚠️",
    },
  ];

  return (
    <MainLayout isLoading={isLoading}>
      {/* HEADER */}
      <Header
        title="Financial Health"
      />

      {/* WEALTHWISE INDEX */}
      <div className="relative bg-[#1a1d21] rounded-3xl p-8 mb-6 border border-white/5 flex flex-col items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        <p className="text-[11px] font-bold text-gray-400 tracking-[0.2em] mb-2 uppercase z-10">
          WEALTHWISE INDEX
        </p>
        <GaugeChart score={summary?.score ?? 0} />
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      {/* INSIGHTS + AI CHAT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Insights */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Insights</h3>
            {insights.length > 0 && (
              <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                {insights.length} rekomendasi
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {insights.length > 0 ? (
              insights.map((insight, i) => <InsightCard key={i} {...insight} />)
            ) : (
              <div className="bg-[#1a1d21] rounded-2xl p-10 text-center border border-white/5">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-white text-sm font-semibold mb-1">
                  Belum ada insights
                </p>
                <p className="text-gray-500 text-xs">
                  Tambahkan transaksi untuk mendapatkan rekomendasi.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AI Planner Chat */}
        <div
          className="lg:col-span-2 bg-[#1a1d21] rounded-3xl p-5 flex flex-col border border-white/5"
          style={{ minHeight: "460px" }}
        >
          {/* Chat Header */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-lg flex-shrink-0">
              🤖
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                WealthWise AI Planner
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Online & Ready</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1"
            style={{ maxHeight: "300px" }}
          >
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] text-xs px-4 py-2.5 rounded-2xl leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-sm"
                      : "bg-[#262930] text-gray-300 rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-[#262930] text-gray-400 text-xs px-4 py-2.5 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  <span className="animate-bounce">●</span>
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  >
                    ●
                  </span>
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  >
                    ●
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="mb-3">
            <p className="text-[10px] font-bold text-gray-600 tracking-widest uppercase mb-2">
              QUICK ACTIONS
            </p>
            <div className="flex gap-2 flex-wrap">
              {["Analisis pengeluaran kopi", "Buatkan rencana hemat"].map(
                (q) => (
                  <button
                    key={q}
                    onClick={() => setChatInput(q)}
                    className="text-xs border border-white/10 text-gray-400 hover:text-white hover:border-emerald-500/50 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Tanya tentang portofolio Anda..."
              className="flex-1 bg-[#262930] text-white text-xs placeholder-gray-500 px-4 py-3 rounded-xl border border-white/5 outline-none focus:border-emerald-500/50 transition-colors"
            />
            <button
              onClick={sendChat}
              disabled={isChatLoading || !chatInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
