import { useState } from "react";
import { updateFunds } from "../../services/goalService";

export default function AddFundsModal({
  isOpen,
  onClose,
  goal,
  onSuccess,
}) {

  const [type, setType] =
    useState("increase");

  const [amount, setAmount] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!isOpen || !goal) return null;

  const handleSubmit = async () => {

    try {

      setLoading(true);
      setError("");

      await updateFunds(goal.id, {
        type,
        amount: Number(amount),
      });

      setAmount("");

      onSuccess?.();

      onClose();

    } catch (err) {

      console.error(err);

      setError(
        "Failed to update funds"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
      "
    >

      <div
        className="
          w-full max-w-md
          rounded-3xl
          bg-[#181B20]
          p-6
          border border-white/10
        "
      >

        {/* HEADER */}
        <div className="mb-6">

          <h2
            className="
              text-2xl font-bold
              text-white
            "
          >
            Add Funds
          </h2>

          <p className="text-gray-400 text-sm">
            {goal.goal_name}
          </p>

        </div>

        {/* MODE */}
        <div
          className="
            grid grid-cols-2
            gap-3 mb-6
          "
        >

          <button
            type="button"
            onClick={() =>
              setType("increase")
            }
            className={`
              py-3 rounded-2xl
              font-semibold transition
              ${
                type === "increase"
                  ? "bg-emerald-500 text-white"
                  : "bg-[#252930] text-gray-400"
              }
            `}
          >
            Increase
          </button>

          <button
            type="button"
            onClick={() =>
              setType("decrease")
            }
            className={`
              py-3 rounded-2xl
              font-semibold transition
              ${
                type === "decrease"
                  ? "bg-red-500 text-white"
                  : "bg-[#252930] text-gray-400"
              }
            `}
          >
            Decrease
          </button>

        </div>

        {/* INPUT */}
        <div className="mb-6">

          <label
            className="
              block mb-2
              text-sm text-gray-400
            "
          >
            Amount
          </label>

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            className="
              w-full
              rounded-2xl
              bg-[#252930]
              border border-white/10
              px-4 py-3
              text-white
              outline-none
            "
          />

        </div>

        {/* ERROR */}
        {error && (

          <div
            className="
              mb-4 text-sm
              text-red-400
            "
          >
            {error}
          </div>

        )}

        {/* BUTTONS */}
        <div
          className="
            flex justify-end
            gap-3
          "
        >

          <button
            onClick={onClose}
            className="
              px-5 py-3
              rounded-2xl
              bg-[#252930]
              text-gray-300
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              px-5 py-3
              rounded-2xl
              bg-emerald-500
              text-white
              font-semibold
            "
          >
            {loading
              ? "Saving..."
              : "Save"}
          </button>

        </div>

      </div>

    </div>
  );
}