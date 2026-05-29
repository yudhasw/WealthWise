import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axios";
import SummaryCard from "../../components/SummaryCard";
import TransactionTable from "../../components/TransactionTable";
import Header from "../../components/Header";
import { Link } from "react-router-dom";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const handleEdit = (id) => {
    navigate(`/transactions/edit/${id}`);
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus transaksi ini? Saldo akun akan dihitung ulang secara otomatis.",
    );

    if (isConfirmed) {
      try {
        await api.delete(`/transactions/${id}`);

        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
        setFilteredTransactions((prev) => prev.filter((tx) => tx.id !== id));
      } catch (err) {
        console.error("Gagal menghapus:", err);
        alert("Terjadi kesalahan saat menghapus transaksi.");
      }
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        const [txRes, accRes, catRes] = await Promise.all([
          api.get("/transactions"),
          api.get("/accounts"),
          api.get("/categories"),
        ]);

        const txData = txRes.data.data || txRes.data;

        setTransactions(txData);
        setFilteredTransactions(txData);

        setAccounts(accRes.data.data || accRes.data);
        setCategories(catRes.data.data || catRes.data);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setError("Gagal memuat data transaksi.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleApplyFilter = () => {
    let results = [...transactions];

    if (dateFrom) {
      results = results.filter((tx) => {
        const txDate = tx.transaction_date
          ? tx.transaction_date.substring(0, 10)
          : "";
        return txDate >= dateFrom;
      });
    }

    // 2. Filter Tanggal Akhir (Sampai)
    if (dateTo) {
      results = results.filter((tx) => {
        const txDate = tx.transaction_date
          ? tx.transaction_date.substring(0, 10)
          : "";
        return txDate <= dateTo;
      });
    }

    // 3. Filter Akun (Mendukung tx.account.id ATAU tx.account_id)
    if (selectedAccount !== "") {
      results = results.filter((tx) => {
        const accId = tx.account?.id || tx.account_id;
        return String(accId) === String(selectedAccount);
      });
    }

    // 4. Filter Kategori (Mendukung tx.category.id ATAU tx.category_id)
    if (selectedCategory !== "") {
      results = results.filter((tx) => {
        const catId = tx.category?.id || tx.category_id;
        return String(catId) === String(selectedCategory);
      });
    }

    // Update state tabel dengan data yang sudah disaring
    setFilteredTransactions(results);
  };

  // Helper Format Rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Hitung total dari data yang sudah di-filter
  const totalIncome = filteredTransactions
    .filter((tx) => tx.transaction_type === "INCOME")
    .reduce((sum, tx) => sum + (Number(tx.transaction_amount) || 0), 0);

  const totalExpense = filteredTransactions
    .filter((tx) => tx.transaction_type === "EXPENSE")
    .reduce((sum, tx) => sum + (Number(tx.transaction_amount) || 0), 0);

  return (
    <MainLayout isLoading={isLoading}>
      {/* HEADER */}
      <Header
        title="Transactions"
      />

      {/* FILTER BAR */}
      <div className="bg-white border border-[#1e2124] rounded-2xl p-4 mb-6 flex flex-wrap md:flex-nowrap gap-4 items-end w-full">
        {/* Date From */}
        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Date Range
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-[#E6E8EA] border border-[#262b2f] text-gray-900 px-3 py-2 rounded-[9px] text-sm w-full focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-[#E6E8EA] border border-[#262b2f] text-gray-900 px-3 py-2 rounded-[9px] text-sm w-full focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Account Dropdown */}
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Account
          </label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="bg-[#E6E8EA] border border-[#262b2f] text-black px-3 py-2 rounded-[9px] text-sm w-full focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#E6E8EA] border border-[#262b2f] text-black px-3 py-2 rounded-[9px] text-sm w-full focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Apply & Reset Buttons */}
        <div className="flex shrink-0 mt-2 md:mt-0 gap-2">
          {/* Tombol Apply */}
          <button
            onClick={handleApplyFilter}
            className="flex items-center justify-center gap-2 bg-[#001736] text-white border border-emerald-500/30 px-5 py-2 rounded-[9px] text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all w-full md:w-auto h-[38px]"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Apply
          </button>

          {/* Opsional: Tombol Reset agar pengguna mudah menghapus filter */}
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setSelectedAccount("");
              setSelectedCategory("");
              setFilteredTransactions(transactions); // Kembalikan ke data asli
            }}
            className="flex items-center justify-center bg-gray-200 text-gray-700 px-4 py-2 rounded-[9px] text-sm font-bold hover:bg-gray-300 transition-all h-[38px]"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Kartu Pemasukan */}
        <SummaryCard
          title="Total Income"
          amount={formatRupiah(totalIncome)}
          type="INCOME"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />

        {/* Kartu Pengeluaran */}
        <SummaryCard
          title="Total Expenses"
          amount={formatRupiah(totalExpense)}
          type="EXPENSE"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 17H5m0 0V9m0 8l8-8 4 4 6-6"
              />
            </svg>
          }
        />
      </div>

      {/* DATA TABLE */}
      <TransactionTable
        transactions={filteredTransactions}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </MainLayout>
  );
}
