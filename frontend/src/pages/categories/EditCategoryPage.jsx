import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axios";

export default function EditCategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    nama: "",
    type: "Income",
    initialBudget: "",
    budgetPeriod: "MONTHLY",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get(`/categories/${id}`);
        const cat = res.data.data;
        setForm({
          nama:          cat.category_name,
          type:          cat.type === "INCOME" ? "Income" : "Expense",
          initialBudget: cat.budget_limit != null ? String(cat.budget_limit) : "",
          budgetPeriod:  cat.budget_period ?? "MONTHLY",
        });
      } catch (err) {
        setError("Kategori tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBudgetInput = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, initialBudget: raw }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const isExpense = form.type === "Expense";
      await api.put(`/categories/${id}`, {
        category_name: form.nama,
        type:          form.type.toUpperCase(),
        budget_limit:  isExpense && form.initialBudget !== "" ? Number(form.initialBudget) : null,
        budget_period: isExpense ? form.budgetPeriod : null,
      });
      navigate("/categories");
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menyimpan perubahan.";
      setError(typeof msg === "object" ? Object.values(msg).flat().join(" ") : msg);
    } finally {
      setSaving(false);
    }
  };

  const isExpense = form.type === "Expense";

  return (
    <MainLayout
      title="Edit Category"
      breadcrumbs={[
        { label: "Categories", to: "/categories" },
        { label: "Edit Category" },
      ]}
    >
      <p className="text-gray-400 text-sm mb-8">
        Perbarui informasi kategori budget kamu.
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 rounded-2xl px-6 py-4 mb-6 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-gray-400 text-center py-16">Memuat data kategori...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="bg-[#2A2C30] rounded-2xl p-8 mb-6 space-y-6">

            {/* Row 1: Nama Kategori + Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Nama kategori"
                  required
                  className="w-full bg-[#F3F4F6] text-gray-800 placeholder-gray-400 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full bg-[#F3F4F6] text-gray-800 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
            </div>

            {/* Expense-only: Initial Budget + Periode Waktu */}
            {isExpense && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Initial Budget
                  </label>
                  <div className="flex items-center bg-[#F3F4F6] rounded-xl px-5 py-4 gap-3">
                    <span className="text-gray-500 font-semibold text-sm">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="initialBudget"
                      value={form.initialBudget ? Number(form.initialBudget).toLocaleString("id-ID") : ""}
                      onChange={handleBudgetInput}
                      placeholder="0"
                      className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Periode Waktu
                  </label>
                  <select
                    name="budgetPeriod"
                    value={form.budgetPeriod}
                    onChange={handleChange}
                    className="w-full bg-[#F3F4F6] text-gray-800 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
                  >
                    <option value="WEEKLY">Mingguan</option>
                    <option value="MONTHLY">Bulanan</option>
                    <option value="YEARLY">Tahunan</option>
                  </select>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => navigate("/categories")}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors px-4 py-2"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm px-8 py-3.5 rounded-xl transition-colors disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </form>
      )}
    </MainLayout>
  );
}
