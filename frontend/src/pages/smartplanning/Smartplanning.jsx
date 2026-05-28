import React, { useState, useEffect, useCallback } from "react";
import {
  Laptop,
  Plane,
  PlusCircle,
  Trash2,
  Sparkles,
  Calendar,
  Target,
  ShieldCheck,
  Car,
  Home,
  Pencil,
  Wallet,
  TrendingUp,
  ChevronRight,
  X,
  Minus,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import Header from "../../components/Header";
import GoalCard from "../../components/smartplanning/GoalCard";
import PopUpDeleteGoal from "../../components/PopUpDeleteGoal";
import api from "../../api/axios";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const renderIcon = (iconName, size = 18, className = "text-gray-500") => {
  const icons = {
    Laptop: <Laptop size={size} className={className} />,
    Plane: <Plane size={size} className={className} />,
    Target: <Target size={size} className={className} />,
    ShieldCheck: <ShieldCheck size={size} className={className} />,
    Car: <Car size={size} className={className} />,
    Home: <Home size={size} className={className} />,
  };
  return icons[iconName] || <Target size={size} className={className} />;
};

// Hex to rgba helper untuk overlay semi-transparan
const hexToRgba = (hex, alpha = 0.12) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(6,122,85,${alpha})`;
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${alpha})`;
};

// ─────────────────────────────────────────────────────────────────────────────
// ADD FUNDS MODAL
// ─────────────────────────────────────────────────────────────────────────────

const AddFundsModal = ({ goal, onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [operation, setOperation] = useState("add");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Format display angka yang diketik
  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setAmount(raw);
    setError("");
  };

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Masukkan nominal yang valid.");
      return;
    }
    if (operation === "subtract" && parsed > Number(goal.current_amount)) {
      setError("Jumlah melebihi saldo yang tersimpan.");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/goals/${goal.id}/funds`, {
        amount: parsed,
        type: operation === "add" ? "increase" : "decrease",
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui dana.");
    } finally {
      setLoading(false);
    }
  };

  const accentColor = goal.color_theme || "#067A55";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      {/* Backdrop klik untuk close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-[#1A1E24] w-full max-w-md rounded-t-3xl p-6 pb-8 space-y-5 border-t border-white/10">
        {/* Handle bar */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-2" />

        {/* Current Balance Info */}
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between"
          style={{
            background: hexToRgba(accentColor, 0.12),
            borderLeft: `3px solid ${accentColor}`,
          }}
        >
          <span className="text-gray-400 text-xs">Saldo Tersimpan</span>
          <span className="font-black text-white">
            {formatRupiah(goal.current_amount)}
          </span>
        </div>

        {/* Operation Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl">
          {[
            { op: "add", label: "➕ Tambah Dana", color: "#067A55" },
            { op: "subtract", label: "➖ Tarik Dana", color: "#ef4444" },
          ].map(({ op, label, color }) => (
            <button
              key={op}
              onClick={() => setOperation(op)}
              className="py-2.5 rounded-lg text-xs font-bold transition-all duration-200"
              style={{
                background: operation === op ? color : "transparent",
                color: operation === op ? "#fff" : "#9ca3af",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div className="space-y-1">
          <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Nominal
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={amount ? Number(amount).toLocaleString("id-ID") : ""}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 focus:border-white/30 rounded-xl text-white text-base font-bold outline-none transition placeholder-gray-600"
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !amount}
          className="w-full py-4 rounded-xl font-black text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background:
              loading || !amount
                ? "#374151"
                : operation === "add"
                  ? accentColor
                  : "#ef4444",
          }}
        >
          {loading
            ? "Menyimpan..."
            : `Konfirmasi ${operation === "add" ? "Penambahan" : "Penarikan"}`}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────────────────────

const GoalCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 space-y-3 animate-pulse">
    <div className="flex justify-between">
      <div className="w-9 h-9 bg-gray-200 rounded-xl" />
      <div className="w-16 h-5 bg-gray-200 rounded-full" />
    </div>
    <div className="w-24 h-5 bg-gray-100 rounded-lg" />
    <div className="w-3/4 h-6 bg-gray-200 rounded" />
    <div className="w-1/2 h-4 bg-gray-100 rounded" />
    <div className="w-full h-2 bg-gray-100 rounded-full" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const Smartplanning = () => {
  const navigate = useNavigate();

  // ── State ──
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Modal: Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  // Modal: Add Funds
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [goalForFunds, setGoalForFunds] = useState(null);

  // ── Fetch Goals ──
  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setFetchError(false);
    try {
      const res = await api.get("/goals");
      setGoals(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data goals:", err);
      setFetchError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // ── Delete Logic ──
  const handleOpenDelete = (goal) => {
    setGoalToDelete(goal);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!goalToDelete) return;
    try {
      await api.delete(`/goals/${goalToDelete.id}`);
      setGoals((prev) => prev.filter((g) => g.id !== goalToDelete.id));
      setIsDeleteModalOpen(false);
      setGoalToDelete(null);
    } catch {
      alert("Gagal menghapus goal. Silakan coba lagi.");
    }
  };

  // ── Add Funds Logic ──
  const handleOpenAddFunds = (goal) => {
    setGoalForFunds(goal);
    setIsAddFundsOpen(true);
  };

  // ── Edit Logic ──
  const handleEdit = (goal) => {
    navigate(`/smart-planning/edit/${goal.id}`);
  };

  // ── Aggregated Overview Numbers ──
  const totalTarget = goals.reduce((a, g) => a + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((a, g) => a + Number(g.current_amount), 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const overallProgress =
    totalTarget > 0
      ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100)
      : 0;

  // Total monthly contribution dari semua goal yg pakai plan monthly
  const totalMonthlyContrib = goals
    .filter((g) => g.filling_plan === "monthly")
    .reduce((a, g) => a + Number(g.amount_per_period), 0);

  // ── Bar Chart: 6 bulan placeholder (bisa diganti real data nanti) ──
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];
  const BAR_HEIGHTS = [45, 60, 55, 75, 62, 88];

  // ── Donut SVG values ──
  const RADIUS = 45;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 282.74
  const dashOffset = CIRCUMFERENCE - (CIRCUMFERENCE * overallProgress) / 100;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <MainLayout isLoading={isLoading}>
      <Header title="Smart Planning" />

      <div className="grid grid-cols-12 gap-5 mt-6">
        {/* ════════════════════════════════════════════
              LEFT COLUMN — Overview & Chart
          ════════════════════════════════════════════ */}
        <div className="col-span-12 lg:col-span-7 space-y-5">
          {/* ── Overall Progress Card ── */}
          <div className="bg-white rounded-2xl p-6 text-[#001D3D] flex items-center gap-6 shadow-sm">
            {/* Donut SVG */}
            <div className="relative shrink-0 w-[110px] h-[110px]">
              <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
                <circle
                  cx="55"
                  cy="55"
                  r={RADIUS}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="10"
                />
                <circle
                  cx="55"
                  cy="55"
                  r={RADIUS}
                  fill="none"
                  stroke="#067A55"
                  strokeWidth="10"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-[#001D3D]">
                  {overallProgress}%
                </span>
                <span className="text-[9px] font-semibold text-gray-400 tracking-wider uppercase">
                  Progress
                </span>
              </div>
            </div>

            {/* Teks Summary */}
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-xl text-[#001D3D] mb-1 leading-tight">
                {overallProgress >= 100
                  ? "All Goals Achieved! 🎉"
                  : overallProgress >= 50
                    ? "Great progress! 💪"
                    : "Let's keep saving! 🚀"}
              </h2>
              <p className="text-gray-500 text-sm leading-snug mb-4">
                {goals.length === 0
                  ? "Belum ada goal aktif. Yuk buat goal pertamamu!"
                  : `Kamu sudah menabung ${formatRupiah(totalSaved)} dari total target ${formatRupiah(totalTarget)}.`}
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#001D3D]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#067A55] shrink-0" />
                  Tersimpan: {formatRupiah(totalSaved)}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200 shrink-0" />
                  Tersisa: {formatRupiah(totalRemaining)}
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats Row ── */}
          {goals.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Active Goals",
                  value: goals.length,
                  suffix: "",
                  icon: <Target size={14} />,
                  color: "#6366f1",
                },
                {
                  label: "Monthly Commit",
                  value: formatRupiah(totalMonthlyContrib),
                  suffix: "/mo",
                  icon: <Clock size={14} />,
                  color: "#067A55",
                },
                {
                  label: "Avg. Progress",
                  value: overallProgress,
                  suffix: "%",
                  icon: <TrendingUp size={14} />,
                  color: "#f59e0b",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/5 border border-white/10 rounded-xl p-3.5"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                    style={{
                      background: hexToRgba(stat.color, 0.15),
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <p className="text-white font-black text-base leading-none">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-xs text-gray-400 font-normal ml-0.5">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500 text-[10px] mt-1 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Monthly Velocity Chart ── */}
          <div className="bg-white rounded-2xl p-6 text-[#001D3D] shadow-sm">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="font-black text-base text-[#001D3D]">
                  Monthly Velocity
                </h3>
                <p className="text-gray-400 text-xs">
                  Estimasi kontribusi per bulan
                </p>
              </div>
              <span className="text-[#067A55] font-black text-sm bg-[#F0FBF6] px-2.5 py-1 rounded-lg">
                {formatRupiah(totalMonthlyContrib)} /mo
              </span>
            </div>

            {/* Bar Chart */}
            <div className="mt-6 flex items-end gap-3 h-36">
              {MONTHS.map((month, i) => (
                <div
                  key={month}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full flex items-end justify-center h-28">
                    <div
                      className="w-full rounded-t-lg transition-all duration-700"
                      style={{
                        height: `${BAR_HEIGHTS[i]}%`,
                        background:
                          i === MONTHS.length - 1
                            ? "#067A55"
                            : `linear-gradient(to top, #C2EDD9, #E0F2EC)`,
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-semibold tracking-widest"
                    style={{
                      color: i === MONTHS.length - 1 ? "#067A55" : "#9ca3af",
                    }}
                  >
                    {month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
              RIGHT COLUMN — Goals List
          ════════════════════════════════════════════ */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black tracking-tight uppercase text-white">
              Active Goals{" "}
              <span className="text-gray-500 font-semibold">
                ({goals.length})
              </span>
            </h3>
            {goals.length > 0 && (
              <button
                onClick={() => navigate("/smart-planning/active-goals")}
                className="text-[#067A55] text-xs font-semibold
                  hover:underline flex items-center gap-0.5"
              >
                View All <ChevronRight size={12} />
              </button>
            )}
          </div>

          {/* ── Loading State ── */}
          {isLoading && (
            <>
              <GoalCardSkeleton />
              <GoalCardSkeleton />
            </>
          )}

          {/* ── Error State ── */}
          {!isLoading && fetchError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center space-y-2">
              <AlertCircle className="text-red-400 mx-auto" size={24} />
              <p className="text-red-300 text-sm font-semibold">
                Gagal memuat data.
              </p>
              <button
                onClick={fetchGoals}
                className="text-xs text-red-400 underline hover:text-red-300"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* ── Empty State ── */}
          {!isLoading && !fetchError && goals.length === 0 && (
            <div className="bg-white/5 border border-dashed border-gray-700 rounded-2xl p-8 text-center space-y-3">
              <div className="text-4xl">🎯</div>
              <p className="text-gray-300 text-sm font-semibold">
                Belum ada target impian.
              </p>
              <p className="text-gray-600 text-xs">
                Buat goal pertamamu dan mulai perjalanan menabungmu!
              </p>
            </div>
          )}

          {/* ── Goals List ── */}
          {!isLoading &&
            !fetchError &&
            goals.length > 0 &&
            goals.map((goal, i) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={i}
                onDelete={() => handleOpenDelete(goal)}
                onAddFunds={() => handleOpenAddFunds(goal)}
                onEdit={() => handleEdit(goal)}
              />
            ))}

          {/* ── Add New Goal Button ── */}
          <button
            onClick={() => navigate("/smart-planning/add-goal")}
            className="w-full bg-[#067A55] hover:bg-[#055f42] active:scale-95 transition-all
                py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs
                uppercase tracking-widest mt-1 shadow-lg shadow-[#067A55]/20"
          >
            <PlusCircle size={15} />
            Add New Goal
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════ */}

      {/* Delete Confirmation Modal */}
      <PopUpDeleteGoal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setGoalToDelete(null);
        }}
        onDelete={executeDelete}
        goalName={goalToDelete?.goal_name}
      />

      {/* Add Funds Modal */}
      {isAddFundsOpen && goalForFunds && (
        <AddFundsModal
          goal={goalForFunds}
          onClose={() => {
            setIsAddFundsOpen(false);
            setGoalForFunds(null);
          }}
          onSuccess={() => {
            fetchGoals(); // Re-fetch semua data agar progress, accessor ikut refresh
          }}
        />
      )}
    </MainLayout>
  );
};

export default Smartplanning;
