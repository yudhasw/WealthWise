import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axios";

export default function AddTransaction() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilled = location.state?.prefilled;

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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [accResponse, catResponse] = await Promise.all([
          api.get("/accounts"),
          api.get("/categories"),
        ]);

        setAccounts(accResponse.data.data || accResponse.data);
        setCategories(catResponse.data.data || catResponse.data);

        // Set default account jika ada
        const accountData = accResponse.data.data || accResponse.data;
        const defaultAccountId =
          accountData && accountData.length > 0 ? accountData[0].id : "";

        if (prefilled) {
          setForm((prev) => ({
            ...prev,
            account_id: defaultAccountId,
            description: prefilled.description ?? prev.description,
            transaction_date: prefilled.transaction_date ?? prev.transaction_date,
            type: prefilled.type ?? prev.type,
            amount: prefilled.amount != null ? String(prefilled.amount) : prev.amount,
          }));
        } else if (defaultAccountId) {
          setForm((prev) => ({ ...prev, account_id: defaultAccountId }));
        }
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchInitialData();
  }, [prefilled]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };

      if (name === "type") {
        newForm.category_id = "";
      }
      return newForm;
    });
  };

  // Handler khusus untuk tombol Type agar mereset kategori
  const handleTypeChange = (newType) => {
    setForm((prev) => ({
      ...prev,
      type: newType,
      category_id: "", // Reset kategori saat pindah tipe
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    if (!isFormValid(form)) {
      alert("Harap isi semua data yang wajib!");
      setIsLoading(false);
      return;
    }

    try {
      const cleanAmount = form.amount.replace(/\D/g, "");

      await api.post("/transactions/add", {
        ...form,
        amount: cleanAmount,
      });

      navigate("/transactions");
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan transaksi. Periksa kembali data Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  // VALIDASI
  const isFormValid = (form) => {
    const isDescriptionValid = form.description.trim() !== "";
    const isDateValid = form.transaction_date !== "";
    const isAmountValid =
      form.amount !== "" && Number(form.amount.replace(/\D/g, "")) > 0;
    const isAccountValid = form.account_id !== "";
    const isCategoryValid =
      form.type === "TRANSFER" ? true : form.category_id !== "";

    return (
      isDescriptionValid &&
      isDateValid &&
      isAmountValid &&
      isAccountValid &&
      isCategoryValid
    );
  };

  // FILTER KATEGORI
  const filteredCategories = categories.filter(
    (cat) => cat.category_type === form.type || cat.type === form.type,
  );

  return (
    <MainLayout isLoading={isLoadingData}>
      <div className="max-w-2xl mx-auto">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span
            className="cursor-pointer hover:text-gray-300 transition-colors"
            onClick={() => navigate("/transactions")}
          >
            Transactions
          </span>
          <span className="text-gray-700">›</span>
          <span className="text-emerald-400 font-semibold">
            Add Transaction
          </span>
        </div>

        {/* PAGE HEADER */}
        <h1 className="text-3xl font-extrabold text-emerald-400 tracking-tight mb-1.5">
          Add Transaction
        </h1>
        <p className="text-sm text-gray-500 mb-7">
          Adjust the details of your transaction to maintain an accurate ledger.
        </p>

        {/* FORM CARD */}
        <div className="bg-[#2C2F32] border border-[#262b2f] rounded-2xl p-8">
          {/* Transaction Name */}
          <div className="mb-5">
            <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">
              Transaction Name
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Apple Store MacBook Pro"
              className="w-full bg-[#f4f5f6] border border-[#262b2f] text-black placeholder-gray-400 px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors font-medium"
              required
            />
          </div>

          {/* Date & Account */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="transaction_date"
                  value={form.transaction_date}
                  onChange={handleChange}
                  className="w-full bg-[#f4f5f6] border border-[#262b2f] text-black px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors font-medium text-gray-600"
                  required
                />
              </div>
            </div>

            {/* Account (Dropdown) */}
            <div>
              <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">
                Account
              </label>
              <div className="relative">
                {isLoadingData ? (
                  <div className="w-full bg-[#f4f5f6] border border-[#262b2f] text-gray-400 px-4 py-3.5 rounded-xl text-sm animate-pulse">
                    Loading accounts...
                  </div>
                ) : (
                  <select
                    name="account_id"
                    value={form.account_id}
                    onChange={handleChange}
                    className="w-full appearance-none bg-[#f4f5f6] border border-[#262b2f] text-black px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer font-medium text-gray-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_name}
                      </option>
                    ))}
                  </select>
                )}
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">
                  IDR
                </span>
                <input
                  type="text"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="24.999.000"
                  className="w-full bg-[#f4f5f6] border border-[#262b2f] text-black placeholder-gray-400 pl-12 pr-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors font-medium text-gray-600"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2 italic">
                Enter amount without currency symbols.
              </p>
            </div>

            {/* Category */}
            {form.type !== "TRANSFER" ? (
              <div>
                <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    className="w-full appearance-none bg-[#f4f5f6] border border-[#262b2f] text-black px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer font-medium text-gray-500"
                  >
                    <option value="">Electronics</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            ) : (
              <div className="opacity-50">
                <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">
                  Category
                </label>
                <div className="w-full bg-gray-200 border border-[#262b2f] text-gray-500 px-4 py-3.5 rounded-xl text-sm flex items-center cursor-not-allowed">
                  No category for transfer
                </div>
              </div>
            )}
          </div>

          {/* TYPE TOGGLE (Block Buttons) */}
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">
              Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["INCOME", "EXPENSE", "TRANSFER"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`py-3.5 rounded-xl text-sm font-bold border transition-all ${
                    form.type === t
                      ? "bg-[#047857] text-white border-[#047857]"
                      : "bg-[#f4f5f6] border-transparent text-[#2C2F32] hover:border-emerald-500/30"
                  }`}
                >
                  {t === "INCOME"
                    ? "Income"
                    : t === "EXPENSE"
                      ? "Expense"
                      : "Transfer"}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#3E4246] mb-6" />

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/transactions")}
              className="text-white hover:text-gray-300 text-sm font-bold px-2 py-3.5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid(form)}
              className="bg-[#047857] hover:bg-[#036549] disabled:opacity-60 text-white px-8 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
