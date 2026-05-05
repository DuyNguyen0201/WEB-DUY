import { create } from "zustand";
import type { NotificationLog } from "../types/notification.types";
import { mockNotificationLogs } from "../mocks/notificationLogs.mock";

interface NotificationLogState {
  notificationLogs: NotificationLog[];
  createNotificationLog: (data: Omit<NotificationLog, "id" | "createdAt" | "status"> & { status?: NotificationLog["status"] }) => void;
  getNotificationLogsByUserId: (userId: string) => NotificationLog[];
  getNotificationLogsByApplicationId: (applicationId: string) => NotificationLog[];
  getAllNotificationLogs: () => NotificationLog[];
}

export const useNotificationLogStore = create<NotificationLogState>((set, get) => ({
  notificationLogs: mockNotificationLogs,
  
  createNotificationLog: (data) => {
    const newLog: NotificationLog = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      status: data.status || "sent",
      createdAt: new Date().toISOString()
    };
    
    set((state) => {
      const safeLogs = Array.isArray(state.notificationLogs) ? state.notificationLogs : [];
      return {
        notificationLogs: [newLog, ...safeLogs]
      };
    });
  },
  
  getNotificationLogsByUserId: (userId) => {
    const safeLogs = Array.isArray(get().notificationLogs) ? get().notificationLogs : [];
    return safeLogs.filter(log => log.recipientUserId === userId);
  },
  
  getNotificationLogsByApplicationId: (applicationId) => {
    const safeLogs = Array.isArray(get().notificationLogs) ? get().notificationLogs : [];
    return safeLogs.filter(log => log.applicationId === applicationId);
  },
  
  getAllNotificationLogs: () => {
    const safeLogs = Array.isArray(get().notificationLogs) ? get().notificationLogs : [];
    return safeLogs;
  }
}));
