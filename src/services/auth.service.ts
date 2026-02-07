import { Role, UserSession } from "@/lib/types";
import { apiClient, setAuthToken, removeAuthToken } from "./apiClient";
import { USE_MOCK_DATA } from "./config";

const SESSION_KEY = "port_platform_session";

export const authService = {
  /**
   * Login user and get authentication token
   * Uses real API if VITE_USE_MOCK_DATA=false, otherwise uses mock data
   */
  login: async (username: string, password: string, role: Role): Promise<UserSession> => {
    if (USE_MOCK_DATA) {
      // Mock login - simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const session: UserSession = {
        role,
        username,
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    }

    // Real API call
    try {
      const response = await apiClient.post<{
        token: string;
        user: {
          id: string;
          username: string;
          role: Role;
          email: string;
        };
      }>("/auth/login", {
        username,
        password,
        role,
      });

      // Store token
      if (response.data?.token) {
        setAuthToken(response.data.token);
      }

      // Store session
      const session: UserSession = {
        role: response.data?.user?.role || role,
        username: response.data?.user?.username || username,
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  logout: (): void => {
    removeAuthToken();
    localStorage.removeItem(SESSION_KEY);
  },
  
  getSession: (): UserSession | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored) as UserSession;
    } catch {
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    return authService.getSession() !== null;
  },
};
