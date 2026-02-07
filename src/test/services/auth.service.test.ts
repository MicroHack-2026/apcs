import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { authService } from "@/services/auth.service";
import { apiClient, tokenManager } from "@/services/apiClient";
import type { Role } from "@/lib/types";

// Mock the apiClient
vi.mock("@/services/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
  tokenManager: {
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    hasValidToken: vi.fn(() => true), // Default to valid for session tests
  },
}));

describe("authService", () => {
  const SESSION_KEY = "port_platform_session";

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(tokenManager.hasValidToken).mockReturnValue(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("login", () => {
    const mockAuthResponse = {
      accessToken: "access-token-123",
      refreshToken: "refresh-token-456",
      tokenType: "Bearer",
      expiresIn: 3600,
      userId: 1,
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      roles: ["ROLE_PORT_ADMIN"],
    };

    it("should login successfully and return user session", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        success: true,
        data: mockAuthResponse,
      });

      const session = await authService.login("testuser", "password123");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/auth/login",
        { username: "testuser", password: "password123" },
        true
      );
      expect(tokenManager.setTokens).toHaveBeenCalledWith(
        "access-token-123",
        "refresh-token-456"
      );
      expect(session.username).toBe("testuser");
      expect(session.role).toBe("ADMIN");
      expect(session.accessToken).toBe("access-token-123");
    });

    it("should map ROLE_PORT_ADMIN to ADMIN", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        success: true,
        data: { ...mockAuthResponse, roles: ["ROLE_PORT_ADMIN"] },
      });

      const session = await authService.login("admin", "password");
      expect(session.role).toBe("ADMIN");
    });

    it("should map ROLE_TERMINAL_OPERATOR to MANAGER", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        success: true,
        data: { ...mockAuthResponse, roles: ["ROLE_TERMINAL_OPERATOR"] },
      });

      const session = await authService.login("operator", "password");
      expect(session.role).toBe("MANAGER");
    });

    it("should map ROLE_CARRIER to ENTERPRISE", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        success: true,
        data: { ...mockAuthResponse, roles: ["ROLE_CARRIER"] },
      });

      const session = await authService.login("carrier", "password");
      expect(session.role).toBe("ENTERPRISE");
    });

    it("should map ROLE_ENTERPRISE_OWNER to ENTERPRISE", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        success: true,
        data: { ...mockAuthResponse, roles: ["ROLE_ENTERPRISE_OWNER"] },
      });

      const session = await authService.login("enterprise", "password");
      expect(session.role).toBe("ENTERPRISE");
    });

    it("should store session in localStorage", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        success: true,
        data: mockAuthResponse,
      });

      await authService.login("testuser", "password123");

      const storedSession = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
      expect(storedSession.username).toBe("testuser");
      expect(storedSession.userId).toBe(1);
    });

    it("should throw error on failed login", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        success: false,
        data: null,
      });

      await expect(authService.login("wrong", "wrong")).rejects.toThrow(
        "Login failed"
      );
    });
  });

  describe("logout", () => {
    it("should clear session and tokens", async () => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ username: "test" }));
      vi.mocked(apiClient.post).mockResolvedValueOnce({ success: true, data: null });

      await authService.logout();

      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
      expect(tokenManager.clearTokens).toHaveBeenCalled();
    });
  });

  describe("getSession", () => {
    it("should return null when no session exists", () => {
      expect(authService.getSession()).toBeNull();
    });

    it("should return the stored session when token is valid", () => {
      const session = {
        role: "ADMIN" as Role,
        username: "testuser",
        userId: 1,
        email: "test@example.com",
        accessToken: "token",
        refreshToken: "refresh",
        expiresIn: 3600,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      vi.mocked(tokenManager.hasValidToken).mockReturnValue(true);

      const result = authService.getSession();
      expect(result).not.toBeNull();
      expect(result?.username).toBe("testuser");
    });

    it("should return null for invalid JSON in storage", () => {
      localStorage.setItem(SESSION_KEY, "invalid-json");
      expect(authService.getSession()).toBeNull();
    });

    it("should return null and logout when token is expired", async () => {
      const session = {
        role: "ADMIN" as Role,
        username: "testuser",
        userId: 1,
        email: "test@example.com",
        accessToken: "token",
        refreshToken: "refresh",
        expiresIn: 3600,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      vi.mocked(tokenManager.hasValidToken).mockReturnValue(false);
      vi.mocked(apiClient.post).mockResolvedValueOnce({ success: true, data: null }); // for logout

      const result = authService.getSession();
      expect(result).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("should return false when token is invalid", () => {
      vi.mocked(tokenManager.hasValidToken).mockReturnValue(false);
      expect(authService.isAuthenticated()).toBe(false);
    });

    it("should return true when token is valid", () => {
      vi.mocked(tokenManager.hasValidToken).mockReturnValue(true);
      expect(authService.isAuthenticated()).toBe(true);
    });
  });
});
