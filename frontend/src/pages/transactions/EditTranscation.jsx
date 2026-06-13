import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axios";

export default function EditTransaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    description: "",
    transaction_date: "",
    type: "EXPENSE",
    amount: "",
    category_id: "",
    account_id: "",
  });
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, catRes, txRes] = await Promise.all([
          api.get("/accounts"),
          api.get("/categories"),
          api.get(`/transactions/${id}`),
        ]);
        setAccounts(accRes.data.data || accRes.data);
        setCategories(catRes.data.data || catRes.data);
        const tx = txRes.data.data || txRes.data;
        setForm({
          description: tx.description,
          transaction_date: tx.transaction_date.substring(0, 10),
          type: tx.transaction_type,
          amount: Math.round(tx.transaction_amount).toString(),
          category_id: tx.category_id || "",
          account_id: tx.account_id || "",
        });
      } catch (err) {
        setError("Gagal memuat data.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Format input amount (angka saja)
  const handleAmountInput = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, amount: raw }));
    if (fieldErrors.amount) {
      setFieldErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.description.trim()) errors.description = "Deskripsi wajib diisi.";
    if (!form.transaction_date) errors.transaction_date = "Tanggal wajib diisi.";
    if (!form.amount || Number(form.amount.toString().replace(/\D/g, "")) <= 0)
      errors.amount = "Jumlah harus lebih dari 0.";
    if (!form.account_id) errors.account_id = "Akun wajib dipilih.";
    if (!form.category_id) errors.category_id = "Kategori wajib dipilih.";
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const cleanAmount = form.amount.toString().replace(/\D/g, "");
      await api.put(`/transactions/${id}`, {
        ...form,
        amount: cleanAmount,
        transaction_type: form.type,
      });
      navigate("/transactions");
    } catch (err) {
      setError("Gagal memperbarui transaksi.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) => c.category_type === form.type || c.type === form.type,
  );

  return (
    <MainLayout
      isLoading={isLoadingData}
      title="Edit Transaction"
      breadcrumbs={[
        { label: "Transactions", to: "/transactions" },
        { label: "Edit Transaction" },
      ]}
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#2C2F32] border border-[#262b2f] rounded-2xl p-8 shadow-xl">
          {/* Form Fields - Identik dengan Add Page */}
          <div className="mb-5">
            <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2 block">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`w-full bg-[#f4f5f6] text-black px-4 py-3.5 rounded-xl text-sm outline-none border ${fieldErrors.description ? "border-red-500" : "border-transparent focus:border-emerald-500"}`}
            />
            {fieldErrors.description && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2 block">
                Date
              </label>
              <input
                type="date"
                name="transaction_date"
                value={form.transaction_date}
                onChange={handleChange}
                className={`w-full bg-[#f4f5f6] text-black px-4 py-3.5 rounded-xl text-sm border ${fieldErrors.transaction_date ? "border-red-500" : "border-transparent"}`}
              />
              {fieldErrors.transaction_date && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.transaction_date}</p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2 block">
                Account
              </label>
              <select
                name="account_id"
                value={form.account_id}
                onChange={handleChange}
                className={`w-full bg-[#f4f5f6] text-black px-4 py-3.5 rounded-xl text-sm appearance-none cursor-pointer border ${fieldErrors.account_id ? "border-red-500" : "border-transparent"}`}
              >
                <option value="">Pilih Akun</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_name}
                  </option>
                ))}
              </select>
              {fieldErrors.account_id && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.account_id}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2 block">
                Amount (IDR)
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="amount"
                value={form.amount ? Number(form.amount).toLocaleString("id-ID") : ""}
                onChange={handleAmountInput}
                className={`w-full bg-[#f4f5f6] text-black px-4 py-3.5 rounded-xl text-sm border ${fieldErrors.amount ? "border-red-500" : "border-transparent"}`}
              />
              {fieldErrors.amount && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.amount}</p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2 block">
                Category
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className={`w-full bg-[#f4f5f6] text-black px-4 py-3.5 rounded-xl text-sm appearance-none cursor-pointer border ${fieldErrors.category_id ? "border-red-500" : "border-transparent"}`}
              >
                <option value="">Select Category</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              {fieldErrors.category_id && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.category_id}</p>
              )}
            </div>
          </div>

          {/* Type Toggle */}
          <div className="mb-6">
            <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2 block">
              Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["INCOME", "EXPENSE", "TRANSFER"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t, category_id: "" })}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all ${form.type === t ? "bg-[#047857] text-white border-[#047857]" : "bg-[#f4f5f6] text-gray-600 border-transparent hover:border-emerald-500/30"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#3E4246] mb-6" />
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/transactions")}
              className="text-white font-bold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving || Object.values(fieldErrors).some(Boolean)}
              className="bg-[#047857] text-white px-10 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
