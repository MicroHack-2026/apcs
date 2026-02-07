import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import { authService } from "@/services/auth.service";

// Mock the auth service
vi.mock("@/services/auth.service", () => ({
  authService: {
    login: vi.fn(),
    getSession: vi.fn(),
    isAuthenticated: vi.fn(() => false),
  },
}));

// Mock the logo import
vi.mock("@/assets/logo.svg", () => ({
  default: "mocked-logo.svg",
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render the login form", () => {
      renderLoginPage();
      
      expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render the Portly branding", () => {
      renderLoginPage();
      
      expect(screen.getByText("Portly")).toBeInTheDocument();
      expect(screen.getByText(/modern port operations platform/i)).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("should show error when submitting empty form", async () => {
      renderLoginPage();
      
      const submitButton = screen.getByRole("button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter username and password/i)).toBeInTheDocument();
      });
    });

    it("should show error when only username is provided", async () => {
      renderLoginPage();
      
      const usernameInput = screen.getByLabelText(/username/i);
      fireEvent.change(usernameInput, { target: { value: "testuser" } });
      
      const submitButton = screen.getByRole("button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter username and password/i)).toBeInTheDocument();
      });
    });

    it("should show error when only password is provided", async () => {
      renderLoginPage();
      
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      
      const submitButton = screen.getByRole("button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter username and password/i)).toBeInTheDocument();
      });
    });
  });

  describe("successful login", () => {
    it("should navigate to admin dashboard for ADMIN role", async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        role: "ADMIN",
        username: "admin",
        userId: 1,
        email: "admin@example.com",
        accessToken: "token",
        refreshToken: "refresh",
        expiresIn: 3600,
      });

      renderLoginPage();
      
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(usernameInput, { target: { value: "admin" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      
      const submitButton = screen.getByRole("button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith("admin", "password");
        expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
      });
    });

    it("should navigate to enterprise page for ENTERPRISE role", async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        role: "ENTERPRISE",
        username: "enterprise",
        userId: 2,
        email: "enterprise@example.com",
        accessToken: "token",
        refreshToken: "refresh",
        expiresIn: 3600,
      });

      renderLoginPage();
      
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(usernameInput, { target: { value: "enterprise" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      
      const submitButton = screen.getByRole("button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/enterprise");
      });
    });

    it("should navigate to manager scan page for MANAGER role", async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        role: "MANAGER",
        username: "manager",
        userId: 3,
        email: "manager@example.com",
        accessToken: "token",
        refreshToken: "refresh",
        expiresIn: 3600,
      });

      renderLoginPage();
      
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(usernameInput, { target: { value: "manager" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      
      const submitButton = screen.getByRole("button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/manager/scan");
      });
    });
  });

  describe("failed login", () => {
    it("should show error message on login failure", async () => {
      vi.mocked(authService.login).mockRejectedValueOnce(new Error("Invalid credentials"));

      renderLoginPage();
      
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(usernameInput, { target: { value: "wrong" } });
      fireEvent.change(passwordInput, { target: { value: "wrong" } });
      
      const submitButton = screen.getByRole("button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });
    });
  });
});
