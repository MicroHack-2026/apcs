import { ContainerItem } from "@/lib/types";
import { mockContainers } from "@/lib/mockData";
import { apiClient } from "./apiClient";
import { USE_MOCK_DATA } from "./config";

let containers = [...mockContainers];

export const containersService = {
  getContainers: async (): Promise<ContainerItem[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...containers];
    }

    try {
      const response = await apiClient.get<ContainerItem[]>("/containers");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching containers:", error);
      throw error;
    }
  },
  
  getContainerById: async (id: string): Promise<ContainerItem | undefined> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return containers.find((c) => c.id === id);
    }

    try {
      const response = await apiClient.get<ContainerItem>(`/containers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching container:", error);
      throw error;
    }
  },
  
  updateContainer: async (id: string, updates: Partial<ContainerItem>): Promise<ContainerItem | undefined> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const index = containers.findIndex((c) => c.id === id);
      if (index === -1) return undefined;
      
      containers[index] = { ...containers[index], ...updates };
      return containers[index];
    }

    try {
      const response = await apiClient.put<ContainerItem>(`/containers/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating container:", error);
      throw error;
    }
  },
  
  reset: (): void => {
    containers = [...mockContainers];
  },
};
