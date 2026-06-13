import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import api from "../../api/axios";
import MainLayout from "../../layouts/MainLayout";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

function calculateAvailablePlans(targetAmount, startDate, targetDate) {
  if (!targetAmount || !startDate || !targetDate) return [];
  const start = new Date(startDate);
  const end = new Date(targetDate);
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return [];

  const plans = [];

  if (diffDays >= 1) {
    plans.push({
      plan: "DAILY",
      label: "Daily",
      amount: Math.ceil(targetAmount / diffDays),
    });
  }
  if (diffDays >= 7) {
    const weeks = Math.max(1, Math.floor(diffDays / 7));
    plans.push({
      plan: "WEEKLY",
      label: "Weekly",
      amount: Math.ceil(targetAmount / weeks),
    });
  }
  if (diffDays >= 30) {
    const s = new Date(startDate),
      e = new Date(targetDate);
    const months = Math.max(
      1,
      (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()),
    );
    plans.push({
      plan: "MONTHLY",
      label: "Monthly",
      amount: Math.ceil(targetAmount / months),
    });
  }
  return plans;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const AddNewGoalPage = () => {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  // Default target date = 6 bulan dari sekarang
  const defaultTarget = new Date(new Date().setMonth(new Date().getMonth() + 6))
    .toISOString()
    .split("T")[0];

  const [form, setForm] = useState({
    goal_name: "",
    target_amount: "",
    start_date: today,
    target_date: defaultTarget,
    filling_plan: "",
    icon: "🎯",
    color_theme: "#067A55",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Derived Plans ──
  const availablePlans = useMemo(() => {
    const amount = parseFloat(form.target_amount);
    if (!amount || amount < 1000) return [];
    return calculateAvailablePlans(amount, form.start_date, form.target_date);
  }, [form.target_amount, form.start_date, form.target_date]);

  // Auto-select best plan
  useEffect(() => {
    if (availablePlans.length === 0) {
      setForm((f) => ({ ...f, filling_plan: "" }));
      return;
    }
    const stillValid = availablePlans.find((p) => p.plan === form.filling_plan);
    if (!stillValid) {
      for (const pref of ["MONTHLY", "WEEKLY", "DAILY"]) {
        const found = availablePlans.find((p) => p.plan === pref);
        if (found) {
          setForm((f) => ({ ...f, filling_plan: found.plan }));
          break;
        }
      }
    }
  }, [availablePlans]);

  const selectedPlan = useMemo(
    () => availablePlans.find((p) => p.plan === form.filling_plan) || null,
    [availablePlans, form.filling_plan],
  );

  // ── Handlers ──
  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setApiError("");
  };

  // Format input amount (angka saja)
  const handleAmountInput = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    handleChange("target_amount", raw);
  };

  const validate = () => {
    const e = {};
    if (!form.goal_name.trim()) e.goal_name = "Goal name wajib diisi.";
    if (!form.target_amount || parseFloat(form.target_amount) < 1000)
      e.target_amount = "Minimum Rp 1.000.";
    if (!form.start_date) e.start_date = "Wajib diisi.";
    if (!form.target_date) e.target_date = "Wajib diisi.";
    if (
      form.target_date &&
      form.start_date &&
      form.target_date <= form.start_date
    )
      e.target_date = "Harus setelah start date.";
    if (!form.filling_plan) e.filling_plan = "Pilih plan tabungan.";
    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      await api.post("/goals", {
        goal_name: form.goal_name.trim(),
        target_amount: parseFloat(form.target_amount),
        start_date: form.start_date,
        target_date: form.target_date,
        filling_plan: form.filling_plan,
        icon: form.icon,
        color_theme: form.color_theme,
      });
      setSuccess(true);
      setTimeout(() => navigate("/smart-planning"), 1200);
    } catch (err) {
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors || {};
        const mapped = {};
        for (const [k, msgs] of Object.entries(serverErrors)) {
          mapped[k] = Array.isArray(msgs) ? msgs[0] : msgs;
        }
        setErrors(mapped);
        setApiError(err.response.data.message || "Validasi gagal.");
      } else {
        setApiError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ICON & COLOR CONFIG
  // ─────────────────────────────────────────────────────────────────────────

  const ICONS = ["🎯", "🏠", "✈️", "🚗", "💍", "🎓", "💻", "📱", "🏋️", "🎸"];

  const COLORS = [
    { label: "Indigo", value: "#6366f1" },
    { label: "Green", value: "#067A55" },
    { label: "Rose", value: "#f43f5e" },
    { label: "Amber", value: "#f59e0b" },
    { label: "Sky", value: "#0ea5e9" },
    { label: "Violet", value: "#8b5cf6" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <MainLayout
      title="Add New Goal"
      breadcrumbs={[
        { label: "Smart Planning", to: "/smart-planning" },
        { label: "Add New Goal" },
      ]}
    >
      {/* Success Overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1A1E24] rounded-2xl p-8 flex flex-col items-center gap-3">
            <CheckCircle2 size={48} className="text-[#067A55]" />
            <p className="font-black text-lg text-white">
              Goal Berhasil Dibuat!
            </p>
            <p className="text-gray-400 text-sm">
              Mengarahkan ke dashboard...
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <p className="text-gray-400 text-sm mb-8">
          Isi detail di bawah untuk membuat target tabungan baru.
        </p>

        {/* Form Card — sama persis style gambar 1 */}
        <div className="bg-[#1A1E24] rounded-2xl border border-white/5 p-8 space-y-6">
        {/* API Error */}
            {apiError && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle
                  size={15}
                  className="text-red-400 shrink-0 mt-0.5"
                />
                <p className="text-red-300 text-sm">{apiError}</p>
              </div>
            )}

            {/* ── Row: Goal Name + Goal Amount ── */}
            <div className="grid grid-cols-2 gap-4">
              {/* Goal Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={form.goal_name}
                  onChange={(e) => handleChange("goal_name", e.target.value)}
                  placeholder=""
                  className={`w-full bg-[#252930] border rounded-xl px-4 py-3 text-white text-sm
                    outline-none transition placeholder-gray-600
                    ${
                      errors.goal_name
                        ? "border-red-500/60"
                        : "border-white/8 focus:border-[#067A55]/50"
                    }`}
                />
                {errors.goal_name && (
                  <p className="text-red-400 text-[11px]">{errors.goal_name}</p>
                )}
              </div>

              {/* Goal Amount */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Goal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      form.target_amount
                        ? Number(form.target_amount).toLocaleString("id-ID")
                        : ""
                    }
                    onChange={handleAmountInput}
                    placeholder="0"
                    className={`w-full bg-[#252930] border rounded-xl pl-10 pr-4 py-3 text-white text-sm
                      outline-none transition placeholder-gray-600
                      ${
                        errors.target_amount
                          ? "border-red-500/60"
                          : "border-white/8 focus:border-[#067A55]/50"
                      }`}
                  />
                </div>
                {errors.target_amount && (
                  <p className="text-red-400 text-[11px]">
                    {errors.target_amount}
                  </p>
                )}
              </div>
            </div>

            {/* ── Filling Plan ── */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Filling Plan (Menabung Per)
              </label>

              {/* Hint jika belum ada plan */}
              {availablePlans.length === 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {/* Placeholder buttons — disabled, mirip gambar 1 */}
                  {["DAILY", "MONTHLY", "YEARLY"].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      disabled
                      className="py-3 rounded-xl text-sm font-bold text-gray-500
                        bg-[#252930] border border-white/8 cursor-not-allowed opacity-40"
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className={`grid gap-3 ${availablePlans.length === 1 ? "grid-cols-1" : availablePlans.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
                >
                  {availablePlans.map((plan) => (
                    <button
                      key={plan.plan}
                      type="button"
                      onClick={() => handleChange("filling_plan", plan.plan)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all border
                        ${
                          form.filling_plan === plan.plan
                            ? "bg-[#067A55] border-[#067A55] text-white"
                            : "bg-[#252930] border-white/8 text-gray-300 hover:border-white/20"
                        }`}
                    >
                      {plan.label}
                    </button>
                  ))}
                </div>
              )}

              {errors.filling_plan && (
                <p className="text-red-400 text-[11px]">
                  {errors.filling_plan}
                </p>
              )}

              {/* Info jika belum isi amount */}
              {availablePlans.length === 0 && (
                <p className="text-gray-600 text-[11px]">
                  Isi Goal Amount untuk melihat pilihan plan yang tersedia.
                </p>
              )}
            </div>

            {/* ── Start & End Date — compact, tersembunyi tapi tetap ada ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className={`w-full bg-[#252930] border rounded-xl px-4 py-3 text-white text-sm
                    outline-none transition [color-scheme:dark]
                    ${
                      errors.start_date
                        ? "border-red-500/60"
                        : "border-white/8 focus:border-[#067A55]/50"
                    }`}
                />
                {errors.start_date && (
                  <p className="text-red-400 text-[11px]">
                    {errors.start_date}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.target_date}
                  onChange={(e) => handleChange("target_date", e.target.value)}
                  min={form.start_date}
                  className={`w-full bg-[#252930] border rounded-xl px-4 py-3 text-white text-sm
                    outline-none transition [color-scheme:dark]
                    ${
                      errors.target_date
                        ? "border-red-500/60"
                        : "border-white/8 focus:border-[#067A55]/50"
                    }`}
                />
                {errors.target_date && (
                  <p className="text-red-400 text-[11px]">
                    {errors.target_date}
                  </p>
                )}
              </div>
            </div>

            {/* ── Amount to Save Per Period (read-only) ── */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Amount to Save Per Period
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                  Rp
                </span>
                <div
                  className="w-full bg-[#252930] border border-white/8 rounded-xl pl-10 pr-4 py-3
                    text-white text-sm font-bold"
                >
                  {selectedPlan ? (
                    Number(selectedPlan.amount).toLocaleString("id-ID")
                  ) : (
                    <span className="text-gray-600 font-normal">0</span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-[11px]">
                *Sistem akan otomatis menghitung kapan target ini tercapai
                berdasarkan rencana di atas.
              </p>
            </div>

            {/* ── Smart Prediction (muncul hanya jika plan dipilih) ── */}
            {selectedPlan && form.target_amount && (
              <div
                className="flex items-start gap-2.5 bg-[#067A55]/10 border border-[#067A55]/20
                rounded-xl px-4 py-3"
              >
                <Sparkles
                  size={14}
                  className="text-[#067A55] shrink-0 mt-0.5"
                />
                <p className="text-[#4ade80] text-sm">
                  Tabung{" "}
                  <span className="font-black">
                    {formatRupiah(selectedPlan.amount)} /{" "}
                    {selectedPlan.label.toLowerCase()}
                  </span>{" "}
                  → target{" "}
                  <span className="font-black">
                    {formatRupiah(parseFloat(form.target_amount))}
                  </span>
                  {form.target_date && (
                    <>
                      {" "}
                      tercapai pada{" "}
                      <span className="font-black">
                        {new Date(form.target_date).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => navigate("/smart-planning")}
                className="text-gray-400 hover:text-white text-sm font-semibold transition px-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-white hover:bg-gray-100 active:scale-95 text-[#121417] font-black
                  text-sm px-8 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Menyimpan..." : "Save Goal"}
              </button>
            </div>
          </div>
        </div>
    </MainLayout>
  );
};

export default AddNewGoalPage;
