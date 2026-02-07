import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import EnterprisePage from "@/pages/EnterprisePage";
import AppointmentPage from "@/pages/enterprise/AppointmentPage";
import BookingsPage from "@/pages/enterprise/BookingsPage";
import HistoryPage from "@/pages/enterprise/HistoryPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminContainersPage from "@/pages/admin/AdminContainersPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminEnterpriseOwnersPage from "@/pages/admin/AdminEnterpriseOwnersPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import ManagerScanPage from "@/pages/manager/ManagerScanPage";
import { authService } from "@/services/auth.service";
import { queryClient } from "@/lib/queryClient";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const session = authService.getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    switch (session.role) {
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "ENTERPRISE":
        return <Navigate to="/enterprise" replace />;
      case "MANAGER":
        return <Navigate to="/manager/scan" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Enterprise Routes */}
          <Route
            path="/enterprise"
            element={
              <ProtectedRoute allowedRoles={["ENTERPRISE"]}>
                <EnterprisePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enterprise/appointments/:containerId"
            element={
              <ProtectedRoute allowedRoles={["ENTERPRISE"]}>
                <AppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enterprise/bookings"
            element={
              <ProtectedRoute allowedRoles={["ENTERPRISE"]}>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enterprise/history"
            element={
              <ProtectedRoute allowedRoles={["ENTERPRISE"]}>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/containers"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminContainersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enterprise-owners"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminEnterpriseOwnersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route path="/manager" element={<Navigate to="/manager/scan" replace />} />
          <Route
            path="/manager/scan"
            element={
              <ProtectedRoute allowedRoles={["MANAGER"]}>
                <ManagerScanPage />
              </ProtectedRoute>
            }
          />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
