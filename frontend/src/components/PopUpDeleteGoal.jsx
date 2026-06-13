import React from "react";
import { X, Trash2 } from "lucide-react";

const PopUpDeleteGoal = ({ isOpen, onClose, onDelete, goalName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay Gelap dengan Blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card (Tema Gelap) */}
      <div className="relative bg-[#1E2125] border border-[#262b2f] rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Ikon Trash dengan background merah transparan */}
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <Trash2 size={24} />
          </div>

          <h2 className="text-white text-xl font-black mb-2 tracking-tight">Konfirmasi Hapus</h2>
          <p className="text-gray-400 text-xs mb-6 px-2 leading-relaxed">
            Apakah kamu yakin ingin menghapus goal ini? Tindakan ini tidak dapat dibatalkan.
          </p>

          {/* Kotak Nama Goal */}
          <div className="w-full bg-[#121417] border border-[#262b2f] rounded-xl py-3.5 px-4 mb-8 font-bold text-sm text-gray-200 shadow-inner">
            {goalName || "Unknown Goal"}
          </div>

          {/* Tombol Aksi */}
          <div className="flex w-full gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 py-3.5 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl font-bold text-sm transition-all"
            >
              Batal
            </button>
            <button 
              onClick={onDelete} 
              className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-[0_4px_12px_rgba(239,68,68,0.3)] transition-all active:scale-95"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopUpDeleteGoal;