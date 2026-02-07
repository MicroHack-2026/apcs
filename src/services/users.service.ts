import { User, Role } from "@/lib/types";
import { apiClient } from "./apiClient";
import { USE_MOCK_DATA } from "./config";

const mockUsers: User[] = [
  { id: "USR-001", name: "John Admin", email: "john.admin@port.com", role: "ADMIN", status: "Active", createdAt: "2025-12-01" },
  { id: "USR-002", name: "Sarah Manager", email: "sarah.manager@port.com", role: "MANAGER", status: "Active", createdAt: "2025-12-05" },
  { id: "USR-003", name: "Mike Enterprise", email: "mike@company.com", role: "ENTERPRISE", status: "Active", createdAt: "2025-12-10" },
  { id: "USR-004", name: "Jane Enterprise", email: "jane@logistics.com", role: "ENTERPRISE", status: "Active", createdAt: "2025-12-12" },
  { id: "USR-005", name: "Tom Manager", email: "tom.manager@port.com", role: "MANAGER", status: "Disabled", createdAt: "2025-11-20" },
  { id: "USR-006", name: "Lisa Admin", email: "lisa.admin@port.com", role: "ADMIN", status: "Active", createdAt: "2025-11-15" },
];

let users = [...mockUsers];

export const usersService = {
  getUsers: async (): Promise<User[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return [...users];
    }

    try {
      const response = await apiClient.get<User[]>("/users");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return users.find((u) => u.id === id);
    }

    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  createUser: async (userData: Omit<User, "id" | "createdAt">): Promise<User> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newUser: User = {
        ...userData,
        id: `USR-${String(users.length + 1).padStart(3, "0")}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      users.push(newUser);
      return newUser;
    }

    try {
      const response = await apiClient.post<User>("/users", userData);
      return response.data!;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | undefined> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return undefined;
      users[index] = { ...users[index], ...updates };
      return users[index];
    }

    try {
      const response = await apiClient.put<User>(`/users/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  toggleUserStatus: async (id: string): Promise<User | undefined> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return undefined;
      users[index].status = users[index].status === "Active" ? "Disabled" : "Active";
      return users[index];
    }

    try {
      const response = await apiClient.patch<User>(`/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error("Error toggling user status:", error);
      throw error;
    }
  },

  reset: (): void => {
    users = [...mockUsers];
  },
};
