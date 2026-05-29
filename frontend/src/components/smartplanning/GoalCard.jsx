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

const renderIcon = (icon, size = 16, className = "") => {
  return (
    <div
      className={`flex items-center justify-center font-black ${className}`}
      style={{ fontSize: size }}
    >
      {icon || "🎯"}
    </div>
  );
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
      ? {
          label: "Achieved",
          bg: "#2563eb",
          icon: <CheckCircle2 size={10} />,
        }
      : progress >= 50
        ? {
            label: "On Track",
            bg: "#067A55",
            icon: <TrendingUp size={10} />,
          }
        : {
            label: "Steady",
            bg: "#d97706",
            icon: <Zap size={10} />,
          };

  return (
    <div
      className="bg-white rounded-[28px] p-5 shadow-sm
      border border-gray-100 flex flex-col gap-4
      transition-all duration-300 hover:shadow-lg relative"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between">
        {/* LEFT */}
        <div
          className="p-3 rounded-2xl border"
          style={{
            background: hexToRgba(accentColor, 0.08),
            borderColor: hexToRgba(accentColor, 0.18),
            color: accentColor,
          }}
        >
          {renderIcon(goal.icon, 16)}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {/* STATUS */}
          <span
            className="flex items-center gap-1 text-[10px]
            font-bold text-white px-2.5 py-1 rounded-full"
            style={{
              background: statusConfig.bg,
            }}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </span>

          {/* MENU */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1 rounded-lg hover:bg-gray-100 transition"
            >
              <MoreVertical size={18} className="text-gray-500" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-8 bg-white
                border border-gray-200 rounded-2xl
                shadow-xl overflow-hidden z-50
                min-w-[170px]"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit();
                  }}
                  className="w-full px-4 py-3 text-left text-sm
                  hover:bg-gray-50 flex items-center gap-2"
                >
                  <Pencil size={14} />
                  Edit Goal
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="w-full px-4 py-3 text-left text-sm
                  text-red-500 hover:bg-red-50
                  flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Hapus Goal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PREDICTION BADGE */}
      <div
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
      </div>

      {/* GOAL INFO */}
      <div>
        <h4
          className="font-black text-[30px]
          leading-tight text-[#001D3D]"
        >
          {title}
        </h4>

        <p className="text-gray-400 text-sm mt-1">
          Tabung{" "}
          <span className="font-bold" style={{ color: accentColor }}>
            {formatRupiah(amountPerPeriod)}
          </span>{" "}
          / {goal.filling_plan}
        </p>
      </div>

      {/* AMOUNT */}
      <div className="flex items-end justify-between">
        <div>
          <p
            className="text-[40px] font-black
            leading-none text-[#001D3D]"
          >
            {formatRupiah(saved)}
          </p>

          <p className="text-gray-400 text-sm mt-1">
            dari {formatRupiah(target)}
          </p>
        </div>

        <span
          className="text-[40px] font-black leading-none"
          style={{ color: accentColor }}
        >
          {progress}%
        </span>
      </div>

      {/* PROGRESS */}
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${progress}%`,
            background: accentColor,
          }}
        />
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between text-xs text-gray-400">
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
        className="w-full bg-[#067A55]
        hover:bg-[#056647]
        text-white py-3 rounded-2xl
        font-bold transition-all duration-200
        flex items-center justify-center gap-2"
      >
        <Wallet size={16} />
        Add Funds
      </button>
    </div>
  );
};

export default GoalCard;
