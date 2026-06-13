import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  Wallet,
  TrendingUp,
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number || 0);
};

const hexToRgba = (hex, opacity) => {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const GoalCard = ({ goal, onDelete, onAddFunds, onEdit, index = 0 }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const title = goal.goal_name;
  const saved = Number(goal.current_amount || 0);
  const target = Number(goal.target_amount || 0);
  const progress = Math.min(Number(goal.progress_percentage || 0), 100);
  const amountPerPeriod = Number(goal.amount_per_period || 0);
  const accentColor = goal.color_theme || "#067A55";
  const timeRemaining = goal.time_remaining_human || "Target berjalan";

  const statusConfig =
    progress >= 100
      ? { label: "Achieved", bg: "#2563eb", icon: <CheckCircle2 size={10} /> }
      : progress >= 50
        ? { label: "On Track", bg: "#067A55", icon: <TrendingUp size={10} /> }
        : { label: "Steady", bg: "#d97706", icon: <Zap size={10} /> };

  return (
    <div
      className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden
        transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* ACCENT STRIP */}
      <div className="h-1.5 w-full" style={{ background: accentColor }} />

      <div className="p-5 flex flex-col gap-4">
        {/* HEADER: status + title on left, menu on right */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5 min-w-0">
            <span
              className="flex items-center gap-1 text-[10px] font-bold text-white px-2.5 py-1 rounded-full w-fit"
              style={{ background: statusConfig.bg }}
            >
              {statusConfig.icon}
              {statusConfig.label}
            </span>

            <h4 className="font-black text-2xl leading-tight text-[#001D3D] truncate">
              {title}
            </h4>
          </div>

          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1.5 rounded-xl hover:bg-gray-100 transition"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-9 bg-white border border-gray-100
                  rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[160px]"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit();
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700
                    hover:bg-gray-50 flex items-center gap-2"
                >
                  <Pencil size={14} />
                  Edit Goal
                </button>

                <div className="mx-3 border-t border-gray-100" />

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="w-full px-4 py-3 text-left text-sm
                    text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Hapus Goal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PREDICTION BADGE */}
        {/* <div
          className="flex items-center gap-1.5 text-[10px]
          font-semibold px-3 py-1.5 rounded-xl
          w-fit border"
          style={{
            background: hexToRgba(accentColor, 0.08),
            borderColor: hexToRgba(accentColor, 0.2),
            color: accentColor,
          }}
        >
          <Sparkles size={10} />
          {timeRemaining.toUpperCase()}
        </div> */}

        {/* SAVINGS INFO BOX */}
        <div
          className="rounded-2xl p-4 flex items-stretch gap-3"
          style={{ background: hexToRgba(accentColor, 0.07) }}
        >
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">Terkumpul</p>
            <p className="text-xl font-black text-[#001D3D] leading-none">
              {formatRupiah(saved)}
            </p>
          </div>

          <div className="w-px self-stretch bg-gray-200 rounded-full" />

          <div className="flex-1">
            <p
              className="text-xs font-bold mb-1"
              style={{ color: accentColor }}
            >
              Target
            </p>
            <p
              className="text-xl font-black leading-none"
              style={{ color: accentColor }}
            >
              {formatRupiah(target)}
            </p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400">Progress</span>
            <span
              className="text-sm font-black"
              style={{ color: accentColor }}
            >
              {progress}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, background: accentColor }}
            />
          </div>
        </div>

        {/* TABUNGAN PER PERIODE */}
        <p className="text-gray-400 text-sm">
          Tabung{" "}
          <span className="font-bold" style={{ color: accentColor }}>
            {formatRupiah(amountPerPeriod)}
          </span>{" "}
          / {goal.filling_plan}
        </p>

        {/* FOOTER: DATE RANGE */}
        <div className="flex items-center text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>
              {new Date(goal.start_date).toLocaleDateString("id-ID", {
                month: "short",
                year: "numeric",
              })}{" "}
              →{" "}
              {new Date(goal.target_date).toLocaleDateString("id-ID", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* ADD FUNDS */}
        <button
          onClick={onAddFunds}
          className="w-full text-white py-3 rounded-2xl font-bold
            transition-all duration-200 flex items-center justify-center gap-2
            hover:opacity-90 active:scale-[0.98]"
          style={{ background: accentColor }}
        >
          <Wallet size={16} />
          Add Funds
        </button>
      </div>
    </div>
  );
};

export default GoalCard;
