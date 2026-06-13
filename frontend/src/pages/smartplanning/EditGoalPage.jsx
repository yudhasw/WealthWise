import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../../layouts/Sidebar";

import {
  Calendar,
  Target,
  Wallet,
  ArrowLeft,
} from "lucide-react";

import api from "../../api/axios";

const EditGoalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    goal_name: "",
    target_amount: "",
    filling_plan: "DAILY",
    amount_per_period: "",
    start_date: "",
    target_date: "",
  });

  // =========================
  // Fetch Goal Detail
  // =========================
  useEffect(() => {
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/goals/${id}`);

      const goal = response.data.data;

      setForm({
        goal_name: goal.goal_name || "",
        target_amount: goal.target_amount || "",
        filling_plan: goal.filling_plan || "DAILY",
        amount_per_period: goal.amount_per_period || "",
        start_date: goal.start_date || "",
        target_date: goal.target_date || "",
      });
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data goal.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Handle Input
  // =========================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Format input nominal (angka saja, tampil dengan pemisah titik)
  const handleAmountInput = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, [e.target.name]: raw }));
  };

  // =========================
  // Handle Submit
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.put(`/goals/${id}`, {
        goal_name: form.goal_name,
        target_amount: Number(form.target_amount),
        filling_plan: form.filling_plan,
        amount_per_period: Number(form.amount_per_period),
        start_date: form.start_date,
        target_date: form.target_date,
      });

      navigate("/smart-planning");
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Gagal mengupdate goal."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Loading UI
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col">

        <div className="p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
            <span>Smart Planning</span>
            <span>/</span>
            <span className="text-emerald-400">
              Edit Goal
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-black text-emerald-400">
              Edit Goal
            </h1>

            <p className="text-gray-400 mt-2">
              Perbarui target tabunganmu.
            </p>
          </div>

          {/* Card */}
          <div
            className="
              max-w-3xl
              bg-[#111827]
              border border-white/10
              rounded-3xl
              p-8
              shadow-2xl
            "
          >
            {/* Error */}
            {error && (
              <div
                className="
                  mb-6
                  bg-red-500/10
                  border border-red-500/30
                  text-red-300
                  rounded-xl
                  p-4
                  text-sm
                "
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Goal Name */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">
                  Goal Name
                </label>

                <div className="relative">
                  <Target
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="text"
                    name="goal_name"
                    value={form.goal_name}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      bg-[#1F2937]
                      border border-white/10
                      rounded-2xl
                      py-4
                      pl-12
                      pr-4
                      text-white
                      outline-none
                      focus:border-emerald-500
                    "
                    placeholder="Contoh: Beli Laptop"
                  />
                </div>
              </div>

              {/* Target Amount */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">
                  Goal Amount
                </label>

                <div className="relative">
                  <Wallet
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    name="target_amount"
                    value={form.target_amount ? Number(form.target_amount).toLocaleString("id-ID") : ""}
                    onChange={handleAmountInput}
                    required
                    className="
                      w-full
                      bg-[#1F2937]
                      border border-white/10
                      rounded-2xl
                      py-4
                      pl-12
                      pr-4
                      text-white
                      outline-none
                      focus:border-emerald-500
                    "
                    placeholder="20.000.000"
                  />
                </div>
              </div>

              {/* Filling Plan */}
              <div>
                <label className="text-sm text-gray-300 mb-3 block">
                  Filling Plan
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {["DAILY", "WEEKLY", "MONTHLY"].map(
                    (plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            filling_plan: plan,
                          })
                        }
                        className={`
                          py-4
                          rounded-2xl
                          font-bold
                          transition-all
                          ${
                            form.filling_plan === plan
                              ? "bg-emerald-600 text-white"
                              : "bg-[#1F2937] text-gray-400"
                          }
                        `}
                      >
                        {plan}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Amount Per Period */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">
                  Amount Per Period
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  name="amount_per_period"
                  value={form.amount_per_period ? Number(form.amount_per_period).toLocaleString("id-ID") : ""}
                  onChange={handleAmountInput}
                  required
                  className="
                    w-full
                    bg-[#1F2937]
                    border border-white/10
                    rounded-2xl
                    py-4
                    px-4
                    text-white
                    outline-none
                    focus:border-emerald-500
                  "
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Start Date
                  </label>

                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      required
                      className="
                        w-full
                        bg-[#1F2937]
                        border border-white/10
                        rounded-2xl
                        py-4
                        pl-12
                        pr-4
                        text-white
                        outline-none
                        focus:border-emerald-500
                      "
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    End Date
                  </label>

                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type="date"
                      name="target_date"
                      value={form.target_date}
                      onChange={handleChange}
                      required
                      className="
                        w-full
                        bg-[#1F2937]
                        border border-white/10
                        rounded-2xl
                        py-4
                        pl-12
                        pr-4
                        text-white
                        outline-none
                        focus:border-emerald-500
                      "
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/smart-planning")
                  }
                  className="
                    flex items-center gap-2
                    text-gray-400
                    hover:text-white
                    transition
                  "
                >
                  <ArrowLeft size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    bg-emerald-600
                    hover:bg-emerald-500
                    text-white
                    font-bold
                    px-8
                    py-4
                    rounded-2xl
                    transition-all
                    disabled:opacity-50
                  "
                >
                  {saving
                    ? "Updating..."
                    : "Update Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGoalPage;