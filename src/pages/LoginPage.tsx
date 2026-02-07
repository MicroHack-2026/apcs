import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "@/lib/types";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoginBackground } from "@/components/LoginBackground";
import portlyLogo from "@/assets/logo.svg";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password || !role) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await authService.login(username, password, role as Role);

      switch (role) {
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        case "ENTERPRISE":
          navigate("/enterprise");
          break;
        case "MANAGER":
          navigate("/manager/scan");
          break;
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex relative">
      <LoginBackground />

      <div className="flex-1 flex flex-col justify-center px-12 lg:px-20 relative z-10">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <img src={portlyLogo} alt="Portly" className="w-12 h-12" />
            <h1 className="text-4xl font-bold text-foreground">
              Portly
            </h1>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Modern port operations platform for managing container arrivals, pickup appointments, and real-time terminal coordination.
          </p>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              <span>Real-time container arrival tracking</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              <span>30-minute slot appointment scheduling</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              <span>QR code gate access verification</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              <span>Global container visibility dashboard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-border rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Sign in
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your credentials to access the platform
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-status-not-arrived bg-status-not-arrived rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: Role) => setRole(value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
