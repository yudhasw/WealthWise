import { useState, useEffect, useRef } from "react";
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
            transaction_date:
              prefilled.transaction_date ?? prev.transaction_date,
            type: prefilled.type ?? prev.type,
            amount:
              prefilled.amount != null ? String(prefilled.amount) : prev.amount,
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
  const [mode, setMode] = useState("manual");
  const [scanFile, setScanFile] = useState(null);
  const [scanPreview, setScanPreview] = useState(null);
  const [scanDragOver, setScanDragOver] = useState(false);
  const [scanScanning, setScanScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const scanInputRef = useRef(null);

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

  // Format input amount (angka saja)
  const handleAmountInput = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, amount: raw }));
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

  const handleScanFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { setScanError("File harus berupa gambar (JPG, PNG, WEBP)."); return; }
    setScanError(null);
    setScanFile(f);
    setScanPreview(URL.createObjectURL(f));
  };

  const handleScan = async () => {
    if (!scanFile) return;
    setScanScanning(true);
    setScanError(null);
    try {
      const formData = new FormData();
      formData.append("receipt", scanFile);
      const res = await api.post("/receipt/scan", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const prefilled = res.data.data;
      setForm((prev) => ({
        ...prev,
        description: prefilled.description ?? prev.description,
        transaction_date: prefilled.transaction_date ?? prev.transaction_date,
        type: prefilled.type ?? prev.type,
        amount: prefilled.amount != null ? String(prefilled.amount) : prev.amount,
        category_id: prefilled.category_id ?? prev.category_id,
      }));
      setScanFile(null);
      setScanPreview(null);
      setMode("manual");
    } catch (err) {
      setScanError(err.response?.data?.message || "Gagal memindai struk. Pastikan gambar jelas dan coba lagi.");
    } finally {
      setScanScanning(false);
    }
  };

  // FILTER KATEGORI
  const filteredCategories = categories.filter(
    (cat) => cat.category_type === form.type || cat.type === form.type,
  );

  return (
    <MainLayout
      isLoading={isLoadingData}
      title="Add Transaction"
      breadcrumbs={[
        { label: "Transactions", to: "/transactions" },
        { label: "Add Transaction" },
      ]}
    >
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-gray-400 mb-7">
          Adjust the details of your transaction to maintain an accurate ledger.
        </p>

        {/* FORM CARD */}
        <div className="bg-[#2C2F32] border border-[#262b2f] rounded-2xl p-8">
          {/* Mode Toggle */}
          <div className="flex bg-[#1e2124] rounded-xl p-1 mb-7 gap-1">
            {[{ key: "manual", label: "Manual" }, { key: "scan", label: "Scan Receipt" }].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === key
                    ? "bg-[#2C2F32] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "scan" ? (
            <>
              {/* Inline Scan Area */}
              <div
                onClick={() => !scanPreview && scanInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setScanDragOver(true); }}
                onDragLeave={() => setScanDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setScanDragOver(false); handleScanFile(e.dataTransfer.files[0]); }}
                className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer mb-5 overflow-hidden ${
                  scanDragOver
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5"
                }`}
                style={{ minHeight: "220px" }}
              >
                {scanPreview ? (
                  <>
                    <img src={scanPreview} alt="Receipt preview" className="w-full object-contain max-h-64" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setScanFile(null); setScanPreview(null); }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                    >
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-14 px-6 text-center select-none">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8V6a2 2 0 012-2h2M3 16v2a2 2 0 002 2h2m10-14h2a2 2 0 012 2v2m-2 10h-2a2 2 0 01-2-2v-2M8 12h8m-4-4v8" />
                      </svg>
                    </div>
                    <p className="text-gray-300 font-medium text-sm mb-1">Drag & drop atau klik untuk pilih</p>
                    <p className="text-gray-500 text-xs">JPG, PNG, WEBP — maks. 10 MB</p>
                  </div>
                )}
              </div>
              <input ref={scanInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleScanFile(e.target.files[0])} />
              {scanError && (
                <p className="text-red-400 text-sm mb-5 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{scanError}</p>
              )}
              {/* Scan Actions */}
              <div className="flex justify-between items-center">
                <button type="button" onClick={() => navigate("/transactions")} className="text-white hover:text-gray-300 text-sm font-bold px-2 py-3.5 rounded-xl transition-colors">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleScan}
                  disabled={!scanFile || scanScanning}
                  className="bg-[#047857] hover:bg-[#036549] disabled:opacity-50 text-white px-8 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  {scanScanning ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Memindai...</>
                  ) : (
                    "Scan & Isi Form"
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
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
                  inputMode="numeric"
                  name="amount"
                  value={form.amount ? Number(form.amount).toLocaleString("id-ID") : ""}
                  onChange={handleAmountInput}
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
                    <option value="">Select Category</option>
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
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
