import api from "../api/axios";

// GET NOTIFICATIONS (paginated, optional type/unread filter)
export const getNotifications = async ({ type, unread, page = 1, perPage = 10 } = {}) => {
  const params = { page, per_page: perPage };
  if (type) params.type = type;
  if (unread) params.unread = true;

  const response = await api.get("/notifications", { params });
  return response.data;
};

// GET UNREAD COUNT
export const getUnreadNotificationCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data.unread_count;
};

// MARK ONE AS READ
export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

// MARK ALL AS READ
export const markAllNotificationsAsRead = async () => {
  const response = await api.put("/notifications/read-all");
  return response.data;
};

// DELETE NOTIFICATION
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};
