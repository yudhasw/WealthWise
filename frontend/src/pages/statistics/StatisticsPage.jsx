import { useEffect, useState } from "react";
import api from "../../api/axios";
import MainLayout from "../../layouts/MainLayout";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

export default function StatisticsPage() {
  const [mode, setMode] = useState("outcome");
  const [period, setPeriod] = useState("month");
  const [statistics, setStatistics] = useState(null);

  const pieData =
    statistics?.top_categories?.map((item) => ({
      name: item.category_name,
      value: item.percentage,
      total: item.total,
    })) || [];

  const PIE_COLORS =
    mode === "income"
      ? ["#10B981", "#0E7490", "#1D4ED8", "#86EFAC"]
      : ["#10B981", "#0F172A", "#64748B", "#86EFAC"];

  useEffect(() => {
    fetchStatistics();
  }, [mode, period]);

  const fetchStatistics = async () => {
    try {
      const response = await api.get(
        `/statistics?type=${mode}&period=${period}`,
      );
      setStatistics(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const barData =
    statistics?.weekly_chart?.map((item) => ({
      day: item.day,
      value: Number(item.total),
    })) || [];

  if (!statistics) {
    return <div className="text-white p-6">Loading statistics...</div>;
  }

  return (
    <MainLayout>
      <div className="w-full text-white p-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold">Stats</h1>

          <div className="flex flex-wrap gap-3">
            {/* Income / Outcome */}
            <div className="bg-[#1C1F23] rounded-xl p-1 flex">
              <button
                onClick={() => setMode("income")}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  mode === "income"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-400"
                }`}
              >
                Income
              </button>

              <button
                onClick={() => setMode("outcome")}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  mode === "outcome"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-400"
                }`}
              >
                Outcome
              </button>
            </div>

            {/* FILTER */}
            <div className="bg-[#1C1F23] rounded-xl p-1 flex">
              {["month", "3months", "year"].map((item) => (
                <button
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                    period === item
                      ? "bg-emerald-600 text-white"
                      : "text-gray-400"
                  }`}
                >
                  {item === "month"
                    ? "This Month"
                    : item === "3months"
                      ? "Last 3 Months"
                      : "This Year"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* CARD 1 */}
          <div className="bg-[#F4F4F5] rounded-3xl p-6 text-black">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">
                {mode === "income" ? "Total Income" : "Total Expenses"}
              </span>

              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                +12.4%
              </span>
            </div>

            <h2 className="text-4xl font-bold mb-6">
              Rp{" "}
              {Number(
                mode === "income"
                  ? statistics?.total_income || 0
                  : statistics?.total_expense || 0,
              ).toLocaleString()}
            </h2>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-emerald-500 rounded-full"></div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="bg-[#F4F4F5] rounded-3xl p-6 text-black">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">
                {mode === "income" ? "Investment Capacity" : "Net Savings"}
              </span>

              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                +8.2%
              </span>
            </div>

            <h2 className="text-4xl font-bold mb-6">
              Rp{" "}
              {Number(
                mode === "income"
                  ? (statistics?.total_income || 0) * 0.3
                  : statistics?.net_savings || 0,
              ).toLocaleString()}
            </h2>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-[#0F172A] rounded-full"></div>
            </div>
          </div>

          {/* SIDE CARD */}
          <div className="bg-gradient-to-br from-[#003B8B] to-[#012B63] rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-6">
              {mode === "income" ? "Income Sources" : "Top Categories"}
            </h3>

            <div className="space-y-4">
              {pieData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300">0{index + 1}</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/20 mt-6 pt-6">
              <p className="text-sm text-gray-300">Monthly Insight</p>
              <p className="mt-2 text-sm leading-relaxed">
                {mode === "income"
                  ? "Your income streams remain stable this month."
                  : "Your spending trend remains healthy this month."}
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* PIE CHART */}
          <div className="lg:col-span-2 bg-[#F4F4F5] rounded-3xl p-6 text-black">
            <h2 className="text-2xl font-bold mb-2">
              {mode === "income" ? "Income Composition" : "Expense Composition"}
            </h2>

            <p className="text-sm text-gray-500 mb-8">
              Detailed financial distribution overview.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="w-full h-[300px] min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={pieData.length > 1 ? 4 : 0}
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-6">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className="w-4 h-4 rounded-full mt-1 shrink-0"
                      style={{
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                      }}
                    ></div>
                    <div>
                      <h4 className="font-semibold text-lg">{item.name}</h4>
                      <p className="text-2xl font-bold">{item.value}%</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Financial distribution insight.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BAR CHART */}
          <div className="bg-[#F4F4F5] rounded-3xl p-6 text-black">
            <h2 className="text-xl font-bold mb-2">
              {mode === "income" ? "Income Rhythm" : "Velocity & Rhythm"}
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              Weekly activity overview
            </p>

            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="day" />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    fill={mode === "income" ? "#10B981" : "#0F172A"}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BOTTOM CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(statistics?.top_categories || []).map((item, index) => (
            <div
              key={index}
              className="bg-[#F4F4F5] rounded-2xl p-5 text-black"
            >
              <p className="text-sm text-gray-500 mb-2">{item.category_name}</p>
              <h3 className="text-2xl font-bold">
                Rp {Number(item.total).toLocaleString()}
              </h3>
              <p className="text-sm font-semibold text-emerald-600 mt-1">
                {pieData[index]?.value ?? 0}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
