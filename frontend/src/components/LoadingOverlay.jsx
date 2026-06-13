import React from "react";

export default function LoadingOverlay({}) {
  return (
    // fixed inset-0 = mengambil full layar dari ujung ke ujung
    // z-[100] = memastikan posisinya berada di lapisan paling atas menutupi segalanya
    // bg-black/60 backdrop-blur-sm = membuat efek redup dan nge-blur pada layar belakang
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Lingkaran Berputar (Spinner) */}
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
