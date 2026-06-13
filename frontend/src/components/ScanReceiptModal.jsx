import { useState, useRef } from "react";
import api from "../api/axios";

export default function ScanReceiptModal({ onClose, onSuccess }) {
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
      onSuccess(res.data.data);
      onClose();
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
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer mb-5 overflow-hidden
            ${dragOver
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-white/20 bg-white/5 hover:border-emerald-500/50 hover:bg-white/8"
            }`}
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
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
              >
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center select-none">
              <div className="w-14 h-14 bg-gray-500/20 rounded-2xl flex items-center justify-center mb-4 border border-gray-500/30">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8V6a2 2 0 012-2h2M3 16v2a2 2 0 002 2h2m10-14h2a2 2 0 012 2v2m-2 10h-2a2 2 0 01-2-2v-2M8 12h8m-4-4v8" />
                </svg>
              </div>
              <p className="text-gray-300 font-medium text-sm mb-1">
                Drag & drop atau klik untuk pilih
              </p>
              <p className="text-gray-500 text-xs">JPG, PNG, WEBP — maks. 10 MB</p>
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
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8V6a2 2 0 012-2h2M3 16v2a2 2 0 002 2h2m10-14h2a2 2 0 012 2v2m-2 10h-2a2 2 0 01-2-2v-2" />
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
