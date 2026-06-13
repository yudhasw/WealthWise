import React, { useState } from "react";

export default function TransactionTable({
  transactions = [],
  isLoading,
  error,
  isRecent = false,
  onEdit,
  onDelete,
}) {
  // --- STATE UNTUK PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- LOGIKA PEMOTONGAN DATA (SLICE) ---
  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Menentukan index awal dan akhir data untuk halaman saat ini
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Jika di mode "isRecent", kita paksa hanya tampil 10 teratas dari halaman 1
  // Jika tidak, tampilkan data sesuai halaman saat ini
  const currentTransactions = isRecent
    ? transactions.slice(0, itemsPerPage)
    : transactions.slice(startIndex, endIndex);

  // --- FUNGSI FORMAT RUPIAH ---
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const columns = isRecent
    ? ["DATE", "NAME", "CATEGORY", "TYPE", "AMOUNT", "ACCOUNT"]
    : ["DATE", "NAME", "CATEGORY", "TYPE", "AMOUNT", "ACCOUNT", "ACTIONS"];

  const colSpanCount = columns.length;

  // --- HANDLER PAGINATION ---
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleGoToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-[#0e1012] border border-[#1e2124] rounded-2xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#131619] border-b border-[#1e2124]">
              {columns.map((col) => (
                <th
                  key={col}
                  className={`py-3.5 px-5 text-[10px] font-bold text-gray-500 tracking-widest uppercase ${
                    col === "AMOUNT"
                      ? "text-right"
                      : col === "ACTIONS"
                        ? "text-center"
                        : ""
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1d20]">
            {isLoading ? (
              <tr>
                <td colSpan={colSpanCount} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium text-sm">
                      Loading transactions...
                    </p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={colSpanCount}
                  className="py-20 text-center text-red-500 text-sm"
                >
                  {error}
                </td>
              </tr>
            ) : currentTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpanCount}
                  className="py-20 text-center text-gray-600"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              // MAPPING DARI currentTransactions, BUKAN transactions LAGI
              currentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-[#1a1d20] transition-colors group text-sm"
                >
                  {/* Date */}
                  <td className="py-4 px-5 text-gray-500 font-medium whitespace-nowrap">
                    {new Date(tx.transaction_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Name */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                        {tx.description}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-5 text-gray-500 whitespace-nowrap">
                    {tx.category?.name || "Uncategorized"}
                  </td>

                  {/* Type Badge */}
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        tx.transaction_type === "INCOME"
                          ? "bg-[#0d2718] text-emerald-400"
                          : "bg-[#2a1a0e] text-orange-400"
                      }`}
                    >
                      {tx.transaction_type === "INCOME" ? "Income" : "Expense"}
                    </span>
                  </td>

                  {/* Amount */}
                  <td
                    className={`py-4 px-5 text-right font-extrabold whitespace-nowrap ${
                      tx.transaction_type === "INCOME"
                        ? "text-emerald-400"
                        : "text-gray-200 group-hover:text-white transition-colors"
                    }`}
                  >
                    {tx.transaction_type === "INCOME" ? "+" : "-"}
                    {formatRupiah(tx.transaction_amount)}
                  </td>

                  {/* Account */}
                  <td className="py-4 px-5 text-gray-500 text-xs whitespace-nowrap">
                    {tx.account?.name || "N/A"}
                  </td>

                  {/* Actions */}
                  {!isRecent && (
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(tx.id)}
                          className="w-8 h-8 rounded-lg border border-[#262b2f] bg-[#0e1012] flex items-center justify-center text-gray-600 hover:border-emerald-500/30 hover:bg-[#0d2718] hover:text-emerald-400 transition-all"
                        >
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(tx.id)}
                          className="w-8 h-8 rounded-lg border border-[#262b2f] bg-[#0e1012] flex items-center justify-center text-gray-600 hover:border-red-500/30 hover:bg-[#2a1010] hover:text-red-400 transition-all"
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      {!isRecent && totalItems > 0 && (
        <div className="bg-[#131619] px-5 py-3.5 flex justify-between items-center border-t border-[#1e2124]">
          <p className="text-xs text-gray-600">
            Showing{" "}
            <span className="font-bold text-gray-400">{startIndex + 1}</span> to{" "}
            <span className="font-bold text-gray-400">
              {Math.min(endIndex, totalItems)}
            </span>{" "}
            of <span className="font-bold text-gray-400">{totalItems}</span>{" "}
            entries
          </p>

          <div className="flex gap-1.5">
            {/* Tombol Previous */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-[#262b2f] bg-[#161a1d] text-gray-500 text-sm flex items-center justify-center hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-[#0d2718] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ‹
            </button>

            {/* Loop Nomor Halaman Dinamis */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handleGoToPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                  currentPage === page
                    ? "bg-emerald-500 text-white" // Warna aktif
                    : "border border-[#262b2f] bg-[#161a1d] text-gray-500 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-[#0d2718]" // Warna inaktif
                }`}
              >
                {page}
              </button>
            ))}

            {/* Tombol Next */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-[#262b2f] bg-[#161a1d] text-gray-500 text-sm flex items-center justify-center hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-[#0d2718] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
