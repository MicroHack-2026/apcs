import { PlatformSettings } from "@/lib/types";
import { apiClient } from "./apiClient";
import { USE_MOCK_DATA } from "./config";

let settings: PlatformSettings = {
  platformName: "Port Platform",
  defaultTimeZone: "UTC",
  slotDurationMinutes: 60,
  defaultCapacity: 5,
  notifyOnBooking: true,
  notifyOnArrival: true,
  notifyOnCancellation: false,
  maintenanceMode: false,
};

export const settingsService = {
  getSettings: async (): Promise<PlatformSettings> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return { ...settings };
    }

    try {
      const response = await apiClient.get<PlatformSettings>("/settings");
      return response.data!;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  },

  updateSettings: async (updates: Partial<PlatformSettings>): Promise<PlatformSettings> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      settings = { ...settings, ...updates };
      return { ...settings };
    }

    try {
      const response = await apiClient.put<PlatformSettings>("/settings", updates);
      return response.data!;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  },

  reset: (): void => {
    settings = {
      platformName: "Port Platform",
      defaultTimeZone: "UTC",
      slotDurationMinutes: 60,
      defaultCapacity: 5,
      notifyOnBooking: true,
      notifyOnArrival: true,
      notifyOnCancellation: false,
      maintenanceMode: false,
    };
  },
};
