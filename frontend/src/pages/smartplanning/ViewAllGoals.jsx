import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../layouts/Sidebar";
import GoalCard from "../../components/smartplanning/GoalCard";

import api from "../../api/axios";

const ViewAllGoals = () => {
  const navigate = useNavigate();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      const response = await api.get("/goals");

      setGoals(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil goals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1118] flex text-white">
      <Sidebar />

      <main className="flex-1 px-8 py-7 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#067A55] text-sm font-semibold">
            Smart Planning
          </p>

          <h1 className="text-3xl font-black mt-2">
            All Active Goals
          </h1>

          <p className="text-gray-400 mt-2">
            Kelola semua target tabunganmu.
          </p>
        </div>

        {/* Goals Grid */}
        {loading ? (
          <p className="text-gray-400">Loading goals...</p>
        ) : goals.length === 0 ? (
          <div
            className="bg-white/5 border border-white/10
            rounded-3xl p-10 text-center"
          >
            <p className="text-gray-300 font-semibold">
              Belum ada goal.
            </p>

            <button
              onClick={() =>
                navigate("/smart-planning/add-goal")
              }
              className="mt-5 bg-[#067A55]
              hover:bg-[#056647]
              px-6 py-3 rounded-2xl
              font-bold transition"
            >
              Add New Goal
            </button>
          </div>
        ) : (
          <div
            className="grid grid-cols-1
            md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {goals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={index}
                onAddFunds={() => {}}
                onEdit={() =>
                  navigate(
                    `/smart-planning/edit-goal/${goal.id}`
                  )
                }
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewAllGoals;