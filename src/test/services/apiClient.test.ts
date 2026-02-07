import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { tokenManager } from "@/services/apiClient";

describe("tokenManager", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getAccessToken", () => {
    it("should return null when no token is stored", () => {
      expect(tokenManager.getAccessToken()).toBeNull();
    });

    it("should return the stored access token", () => {
      localStorage.setItem("apcs_access_token", "test-token");
      expect(tokenManager.getAccessToken()).toBe("test-token");
    });
  });

  describe("getRefreshToken", () => {
    it("should return null when no refresh token is stored", () => {
      expect(tokenManager.getRefreshToken()).toBeNull();
    });

    it("should return the stored refresh token", () => {
      localStorage.setItem("apcs_refresh_token", "refresh-token");
      expect(tokenManager.getRefreshToken()).toBe("refresh-token");
    });
  });

  describe("setTokens", () => {
    it("should store both access and refresh tokens", () => {
      tokenManager.setTokens("access-123", "refresh-456");

      expect(localStorage.getItem("apcs_access_token")).toBe("access-123");
      expect(localStorage.getItem("apcs_refresh_token")).toBe("refresh-456");
    });
  });

  describe("clearTokens", () => {
    it("should remove both tokens from storage", () => {
      localStorage.setItem("apcs_access_token", "access-123");
      localStorage.setItem("apcs_refresh_token", "refresh-456");

      tokenManager.clearTokens();

      expect(localStorage.getItem("apcs_access_token")).toBeNull();
      expect(localStorage.getItem("apcs_refresh_token")).toBeNull();
    });
  });

  describe("hasValidToken", () => {
    it("should return false when no token exists", () => {
      expect(tokenManager.hasValidToken()).toBe(false);
    });

    it("should return false for an invalid token format", () => {
      localStorage.setItem("apcs_access_token", "invalid-token");
      expect(tokenManager.hasValidToken()).toBe(false);
    });

    it("should return true for a valid non-expired token", () => {
      // Create a JWT with expiry 1 hour from now
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = btoa(JSON.stringify({ exp: futureTime }));
      const token = `header.${payload}.signature`;

      localStorage.setItem("apcs_access_token", token);
      expect(tokenManager.hasValidToken()).toBe(true);
    });

    it("should return false for an expired token", () => {
      // Create a JWT that expired 1 hour ago
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      const payload = btoa(JSON.stringify({ exp: pastTime }));
      const token = `header.${payload}.signature`;

      localStorage.setItem("apcs_access_token", token);
      expect(tokenManager.hasValidToken()).toBe(false);
    });
  });
});
