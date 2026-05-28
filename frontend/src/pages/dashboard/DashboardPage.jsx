import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Bell, User } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import Header from "../../components/Header";
import api from "../../api/axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import TransactionTable from "../../components/TransactionTable";

function ScanReceiptModal({ onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("receipt", file);
      const res = await api.post("/receipt/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const prefilled = res.data.data;
      onClose();
      navigate("/transactions/add", { state: { prefilled } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal memindai struk. Pastikan gambar jelas dan coba lagi.",
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#1e2124] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
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

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">Scan Receipt</h2>
          <p className="text-gray-400 text-sm">
            Upload foto struk untuk mengisi transaksi secara otomatis.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => !preview && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer mb-5 overflow-hidden
            ${dragOver ? "border-emerald-500 bg-emerald-500/10" : "border-white/20 bg-white/5 hover:border-emerald-500/50 hover:bg-white/8"}`}
          style={{ minHeight: "200px" }}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full object-contain max-h-64"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center select-none">
              <div className="w-14 h-14 bg-gray-500/20 rounded-2xl flex items-center justify-center mb-4 border border-gray-500/30">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8V6a2 2 0 012-2h2M3 16v2a2 2 0 002 2h2m10-14h2a2 2 0 012 2v2m-2 10h-2a2 2 0 01-2-2v-2M8 12h8m-4-4v8"
                  />
                </svg>
              </div>
              <p className="text-gray-300 font-medium text-sm mb-1">
                Drag & drop atau klik untuk pilih
              </p>
              <p className="text-gray-500 text-xs">
                JPG, PNG, WEBP — maks. 10 MB
              </p>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {error && (
          <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/8 hover:bg-white/12 text-gray-300 font-semibold py-3.5 rounded-2xl text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleScan}
            disabled={!file || scanning}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {scanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memindai...
              </>
            ) : (
              <>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8V6a2 2 0 012-2h2M3 16v2a2 2 0 002 2h2m10-14h2a2 2 0 012 2v2m-2 10h-2a2 2 0 01-2-2v-2"
                  />
                </svg>
                Scan & Isi Form
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate(); // 2. Inisialisasi navigate

  const [summary, setSummary] = useState({
    net_balance: 0,
    total_income: 0,
    total_expense: 0,
    top_category: "Belum ada data",
  });

  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScanModal, setShowScanModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/dashboard");
        const dashboardData = response.data.data || response.data;

        if (dashboardData.summary) {
          setSummary(dashboardData.summary);
          if (dashboardData.summary.chart) {
            const formattedChart = Object.keys(dashboardData.summary.chart).map(
              (key) => ({
                name: key,
                value: Number(dashboardData.summary.chart[key]),
              }),
            );
            setChartData(formattedChart);
          }
        }
        setTransactions(dashboardData.recent_transactions || []);
      } catch (err) {
        console.error("Gagal mengambil data dashboard:", err);
        setError(
          "Gagal memuat data. Pastikan server berjalan dan Anda sudah login.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

  return (
    <MainLayout isLoading={isLoading}>
      {showScanModal && (
        <ScanReceiptModal onClose={() => setShowScanModal(false)} />
      )}

      {/* HEADER */}
      <Header
        title="Dashboard"
        rightSection={
          <div className="flex items-center gap-5">
            <Link
              to="/notifications"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Bell size={18} />
            </Link>

            <Link
              to="/profile"
              className="w-10 h-10 rounded-full bg-[#1F2937] border border-white/10 flex items-center justify-center hover:bg-[#374151] transition"
            >
              <User size={18} className="text-[#F4B183]" />
            </Link>
          </div>
        }
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* TOP CARDS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Net Worth Card & Grafik */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#065f46] to-[#0f172a] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-lg border border-emerald-900/30">
          <div className="z-10 w-full mb-6 md:mb-0">
            <p className="text-xs font-bold text-emerald-100/70 mb-2 uppercase tracking-widest">
              TOTAL NET WORTH
            </p>
            <h3 className="text-5xl font-extrabold text-white mb-3">
              {formatRupiah(summary.net_balance)}
            </h3>
            <span className="inline-block bg-emerald-800/60 text-emerald-100 text-xs px-2.5 py-1 rounded-md font-medium mb-8">
              ALL TIME
            </span>

            <div className="flex flex-wrap gap-8 border-b border-emerald-800/50 pb-6 mb-6">
              <div>
                <p className="text-xs text-emerald-200/60 mb-1">Total Income</p>
                <p className="text-lg font-bold text-white">
                  {formatRupiah(summary.total_income)}
                </p>
              </div>
              <div>
                <p className="text-xs text-emerald-200/60 mb-1">
                  Total Expenses
                </p>
                <p className="text-lg font-bold text-white">
                  {formatRupiah(summary.total_expense)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-emerald-200/60 mb-1">
                Top Category Expense
              </p>
              <p className="text-sm font-semibold text-orange-300">
                {summary.top_category}
              </p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="z-10 w-80 h-72 shrink-0 flex flex-col items-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={70}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                    cornerRadius={6}
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-all cursor-pointer outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      borderRadius: "12px",
                      color: "#fff",
                      padding: "10px",
                    }}
                    itemStyle={{ color: "#fff", fontSize: "12px" }}
                    formatter={(value, name) => [formatRupiah(value), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-48 h-48 rounded-full border-2 border-dashed border-emerald-500/20 flex flex-col items-center justify-center bg-emerald-500/5">
                <span className="text-emerald-500/40 text-xs font-medium">
                  No Data Yet
                </span>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {chartData.slice(0, 3).map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-[10px] text-emerald-100/60 uppercase tracking-tighter">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 flex flex-col">
          <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-4 px-1">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-4 h-full">
            {/* Scan Receipt Button */}
            <button
              onClick={() => setShowScanModal(true)}
              className="flex-1 bg-[#333538] rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-[#3f4144] transition-all shadow-md group"
            >
              <div className="bg-gray-500/20 p-4 rounded-full mb-3 border border-gray-500/30 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-all">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-gray-300 group-hover:text-emerald-400 transition-colors"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8V6a2 2 0 012-2h2M3 16v2a2 2 0 002 2h2m10-14h2a2 2 0 012 2v2m-2 10h-2a2 2 0 01-2-2v-2M8 12h8m-4-4v8"
                  />
                </svg>
              </div>
              <span className="text-gray-200 font-medium text-sm text-center group-hover:text-emerald-300 transition-colors">
                Scan
                <br />
                Receipt
              </span>
            </button>

            <button className="flex-1 bg-[#102A20] border border-emerald-500/20 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-[#15382a] transition-all shadow-md">
              <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-emerald-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-emerald-500 font-medium text-sm">
                Ask AI Finance Planner
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      {/* isRecent={true} memastikan tombol edit/delete disembunyikan di tabel ini */}
      <TransactionTable
        transactions={transactions?.slice(0, 5) || []}
        isLoading={isLoading}
        error={error}
        isRecent={true}
      />
    </MainLayout>
  );
}
