import api from "../api/axios";

// GET ALL GOALS
export const getGoals = async () => {
  const response = await api.get("/goals");
  return response.data.data;
};

// CREATE GOAL
export const createGoal = async (payload) => {
  const response = await api.post(
    "/goals",
    payload
  );

  return response.data;
};

// GET SINGLE GOAL
export const getGoalById = async (id) => {
  const response = await api.get(
    `/goals/${id}`
  );

  return response.data.data;
};

// UPDATE GOAL
export const updateGoal = async (
  id,
  payload
) => {

  const response = await api.put(
    `/goals/${id}`,
    payload
  );

  return response.data;
};

// DELETE GOAL
export const deleteGoal = async (id) => {

  const response = await api.delete(
    `/goals/${id}`
  );

  return response.data;
};

// UPDATE FUNDS
export const updateFunds = async (
  id,
  payload
) => {

  const response = await api.put(
    `/goals/${id}/funds`,
    payload
  );

  return response.data;
};