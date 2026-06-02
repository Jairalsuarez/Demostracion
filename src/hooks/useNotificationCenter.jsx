import { createNotice } from "../services/normalizers.js";

export default function useNotificationCenter(commit) {
  const notify = (message, actor = "Fizzia", type = "info") => {
    commit((current) => ({
      ...current,
      notifications: [createNotice(message, actor, type), ...(current.notifications || [])].slice(0, 60),
    }));
  };

  const markNotificationRead = (id) => {
    commit((current) => ({
      ...current,
      notifications: current.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
    }));
  };

  const markAllNotificationsRead = () => {
    commit((current) => ({
      ...current,
      notifications: current.notifications.map((item) => ({ ...item, read: true })),
    }));
  };

  return { notify, markNotificationRead, markAllNotificationsRead };
}
