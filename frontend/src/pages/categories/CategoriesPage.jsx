import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const NOW = new Date();
const MIN_YEAR = 2020;
const MAX_YEAR = NOW.getFullYear() + 1;

function getBarColor(pct) {
  if (pct >= 85) return "bg-red-500";
  if (pct >= 50) return "bg-blue-900";
  return "bg-emerald-500";
}

function getBadgeStyle(pct) {
  if (pct >= 85) return "bg-red-100 text-red-500";
  if (pct >= 50) return "bg-indigo-100 text-indigo-500";
  return "bg-emerald-100 text-emerald-600";
}

function CircularProgress({ percentage }) {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const dashOffset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        className="-rotate-90"
      >
        <circle
          cx="80"
          cy="80"
          r={normalizedRadius}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx="80"
          cy="80"
          r={normalizedRadius}
          fill="none"
          stroke="white"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[10px] font-semibold text-white/70 uppercase tracking-widest">
          Spent
        </span>
        <span className="text-3xl font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}

function PeriodPicker({ period, setPeriod, month, setMonth, year, setYear }) {
  const canPrev =
    period === "yearly" ? year > MIN_YEAR : !(month === 1 && year <= MIN_YEAR);
  const canNext =
    period === "yearly" ? year < MAX_YEAR : !(month === 12 && year >= MAX_YEAR);

  const handlePrev = () => {
    if (period === "yearly") {
      setYear((y) => Math.max(y - 1, MIN_YEAR));
    } else {
      if (month === 1) {
        setMonth(12);
        setYear((y) => y - 1);
      } else setMonth((m) => m - 1);
    }
  };

  const handleNext = () => {
    if (period === "yearly") {
      setYear((y) => Math.min(y + 1, MAX_YEAR));
    } else {
      if (month === 12) {
        setMonth(1);
        setYear((y) => y + 1);
      } else setMonth((m) => m + 1);
    }
  };

  const label =
    period === "monthly" ? `${MONTHS[month - 1]} ${year}` : `${year}`;

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Toggle Monthly / Yearly */}
      <div className="flex rounded-xl overflow-hidden border border-white/10 bg-white/5">
        <button
          onClick={() => setPeriod("monthly")}
          className={`px-5 py-2 text-sm font-semibold transition-colors ${period === "monthly" ? "bg-emerald-500/30 text-white" : "text-white/50 hover:text-white"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setPeriod("yearly")}
          className={`px-5 py-2 text-sm font-semibold transition-colors ${period === "yearly" ? "bg-emerald-500/30 text-white" : "text-white/50 hover:text-white"}`}
        >
          Yearly
        </button>
      </div>

      {/* Month / Year navigator */}
      <div className="flex items-center gap-1 bg-white/10 rounded-xl px-3 py-1.5">
        <button
          onClick={handlePrev}
          disabled={!canPrev}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <span className="text-white font-semibold text-sm min-w-[110px] text-center">
          {label}
        </span>
        <button
          onClick={handleNext}
          disabled={!canNext}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function DeleteModal({ category, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </div>
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Konfirmasi Hapus
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          Apakah kamu yakin ingin menghapus kategori ini?
        </p>
        <div className="bg-gray-50 rounded-2xl px-5 py-4 mb-7">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Category
          </p>
          <p className="text-gray-900 font-bold text-base">
            {category.category_name}
          </p>
          {category.type === "EXPENSE" && category.budget_limit != null && (
            <p className="text-gray-500 text-sm mt-0.5">
              Budget: Rp {Number(category.budget_limit).toLocaleString("id-ID")}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(category.id)}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 rounded-2xl text-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ThreeDotMenu({ id, openMenuId, setOpenMenuId, onEdit, onDelete }) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpenMenuId(openMenuId === id ? null : id)}
        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {openMenuId === id && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10 w-36">
          <button
            onClick={onEdit}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function AddCategoryButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
    >
      <svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Add Category
    </button>
  );
}

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("monthly");
  const [selectedMonth, setMonth] = useState(NOW.getMonth() + 1);
  const [selectedYear, setYear] = useState(NOW.getFullYear());
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/categories", {
        params: { period, month: selectedMonth, year: selectedYear },
      });
      setCategories(res.data.data);
    } catch {
      setError("Gagal memuat kategori.");
    } finally {
      setLoading(false);
    }
  }, [period, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const expenseCategories = categories
    .filter((c) => c.type === "EXPENSE")
    .slice()
    .sort((a, b) => Number(b.spent ?? 0) - Number(a.spent ?? 0));
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  const totalBudget = expenseCategories.reduce(
    (sum, c) => sum + Number(c.budget_limit ?? 0),
    0,
  );
  const totalSpent = expenseCategories.reduce(
    (sum, c) => sum + Number(c.spent ?? 0),
    0,
  );
  const remaining = totalBudget - totalSpent;
  const spentPct =
    totalBudget > 0
      ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100)
      : 0;

  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleDeleteConfirm = async (id) => {
    try {
      setDeleteLoading(true);
      await api.delete(`/categories/${id}`);
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      alert("Gagal menghapus kategori.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const periodLabel =
    period === "monthly"
      ? `${MONTHS[selectedMonth - 1]} ${selectedYear}`
      : `Tahun ${selectedYear}`;

  return (
    <MainLayout isLoading={loading} title="Categories">
      {deleteTarget && (
        <DeleteModal
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}

      {/* BUDGET OVERVIEW CARD */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0E7958] via-[#0a5c42] to-[#0f2027] p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0">
            <CircularProgress percentage={spentPct} />
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-wrap gap-12 mb-4 items-start">
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-widest font-semibold mb-1">
                  Total Budget
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatRupiah(totalBudget)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-widest font-semibold mb-1">
                  Remaining
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatRupiah(Math.max(remaining, 0))}
                </p>
              </div>
              <div className="ml-auto">
                <PeriodPicker
                  period={period}
                  setPeriod={setPeriod}
                  month={selectedMonth}
                  setMonth={setMonth}
                  year={selectedYear}
                  setYear={setYear}
                />
              </div>
            </div>
            <p className="text-sm text-white/60">
              Pengeluaran{" "}
              <span className="text-emerald-300 font-medium">
                {periodLabel}
              </span>
              {": "}
              <span className="text-emerald-300 font-medium">
                {formatRupiah(totalSpent)}
              </span>
              {totalBudget > 0 && (
                <>
                  {" "}
                  dari budget{" "}
                  <span className="text-emerald-300 font-medium">
                    {formatRupiah(totalBudget)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 rounded-2xl px-6 py-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-center py-16">
          Memuat kategori...
        </div>
      ) : (
        <>
          {/* EXPENSE CATEGORIES */}
          <div className="bg-white rounded-3xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 text-lg font-bold">
                Expense Categories (Budgeting)
              </h3>
              <AddCategoryButton onClick={() => navigate("/categories/add")} />
            </div>
            {expenseCategories.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Belum ada kategori pengeluaran.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {expenseCategories.map((cat) => {
                  const limit = Number(cat.budget_limit ?? 0);
                  const spent = Number(cat.spent ?? 0);
                  const pct =
                    limit > 0
                      ? Math.min(Math.round((spent / limit) * 100), 100)
                      : 0;
                  return (
                    <div
                      key={cat.id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-800 text-base">
                            {cat.category_name}
                          </p>
                          {cat.budget_period && (
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                              {
                                {
                                  WEEKLY: "Mingguan",
                                  MONTHLY: "Bulanan",
                                  YEARLY: "Tahunan",
                                }[cat.budget_period]
                              }
                            </span>
                          )}
                        </div>
                        <ThreeDotMenu
                          id={cat.id}
                          openMenuId={openMenuId}
                          setOpenMenuId={setOpenMenuId}
                          onEdit={() => {
                            navigate(`/categories/edit/${cat.id}`);
                            setOpenMenuId(null);
                          }}
                          onDelete={() => {
                            setDeleteTarget(cat);
                            setOpenMenuId(null);
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-800 font-bold text-lg">
                          {formatRupiah(spent)}{" "}
                          <span className="text-gray-400 font-normal text-sm">
                            / {formatRupiah(limit)}
                          </span>
                        </p>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${getBadgeStyle(pct)}`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getBarColor(pct)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* INCOME CATEGORIES */}
          <div className="bg-white rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 text-lg font-bold">
                Income Categories
              </h3>
              <AddCategoryButton onClick={() => navigate("/categories/add")} />
            </div>
            {incomeCategories.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Belum ada kategori pemasukan.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {incomeCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-bold text-gray-800 text-base">
                        {cat.category_name}
                      </p>
                      <ThreeDotMenu
                        id={cat.id}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        onEdit={() => {
                          navigate(`/categories/edit/${cat.id}`);
                          setOpenMenuId(null);
                        }}
                        onDelete={() => {
                          setDeleteTarget(cat);
                          setOpenMenuId(null);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </MainLayout>
  );
}
