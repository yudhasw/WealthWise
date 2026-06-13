export default function SummaryCard({ title, amount, type, icon }) {
  const isIncome = type === "INCOME";
  const textColor = isIncome ? "text-[#7BD8B1]" : "text-[#001736]";
  const bgColor = isIncome ? "bg-[#30473E]" : "bg-[#E6E8EA]";
  const borderColor = isIncome ? "border-[#4B7B65]" : "border-[#1e2124]";
  const iconBgColor = isIncome ? "bg-[#1a3d26]" : "bg-[#1e2124]";

  return (
    <div className={`${bgColor} border ${borderColor} rounded-2xl p-3`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            {title}
          </p>
          <p className={`text-2xl font-extrabold tracking-tight ${textColor}`}>
            {isIncome ? "+" : "-"}
            {amount}
          </p>
        </div>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgColor} ${isIncome ? "text-emerald-400" : "text-gray-500"}`}
        >
          {icon} {/* Menampilkan SVG atau ikon yang dikirim */}
        </div>
      </div>
    </div>
  );
}
