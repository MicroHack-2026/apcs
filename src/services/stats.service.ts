import { apiClient } from "./apiClient";
import { USE_MOCK_DATA } from "./config";

export interface AdminStats {
  totalEnterprises: number;
  totalManagers: number;
  totalContainers: number;
  appointmentsScheduled: number;
  arrivedCount: number;
  notArrivedCount: number;
}

export interface RecentActivity {
  id: string;
  message: string;
  timestamp: string;
}

export const statsService = {
  getAdminStats: async (): Promise<AdminStats> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        totalEnterprises: 47,
        totalManagers: 12,
        totalContainers: 352,
        appointmentsScheduled: 89,
        arrivedCount: 156,
        notArrivedCount: 196,
      };
    }

    try {
      const response = await apiClient.get<AdminStats>("/stats/admin");
      return response.data!;
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw error;
    }
  },

  getRecentActivity: async (): Promise<RecentActivity[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return [
        { id: "1", message: "Global Logistics Inc scheduled appointment for container CNTR-089", timestamp: "10 minutes ago" },
        { id: "2", message: "Pacific Shipping Co container CNTR-045 marked as arrived", timestamp: "25 minutes ago" },
        { id: "3", message: "New enterprise owner Maritime Solutions registered", timestamp: "1 hour ago" },
        { id: "4", message: "Continental Freight scheduled appointment for container CNTR-112", timestamp: "2 hours ago" },
        { id: "5", message: "Express Cargo Ltd container CNTR-078 marked as arrived", timestamp: "3 hours ago" },
      ];
    }

    try {
      const response = await apiClient.get<RecentActivity[]>("/stats/recent-activity");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw error;
    }
  },

  getUpcomingAppointments: async (): Promise<{ id: string; container: string; company: string; time: string; date: string }[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return [
        { id: "1", container: "CNTR-089", company: "Global Logistics Inc", time: "09:00", date: "Today" },
        { id: "2", container: "CNTR-112", company: "Continental Freight", time: "10:00", date: "Today" },
        { id: "3", container: "CNTR-156", company: "Pacific Shipping Co", time: "14:00", date: "Today" },
        { id: "4", container: "CNTR-203", company: "Express Cargo Ltd", time: "08:00", date: "Tomorrow" },
        { id: "5", container: "CNTR-245", company: "Global Logistics Inc", time: "11:00", date: "Tomorrow" },
      ];
    }

    return [];
  },
};
