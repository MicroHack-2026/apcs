import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  showSearch?: boolean;
  minimal?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
}

export function TopBar({ showSearch = false, minimal = false, searchPlaceholder = "Search...", onSearchChange }: TopBarProps) {
  const navigate = useNavigate();
  const session = authService.getSession();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  if (minimal) {
    return (
      <div className="flex items-center gap-3">
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Help
        </button>
        {session && (
          <button
            onClick={handleLogout}
            className="text-sm text-destructive hover:text-destructive/80 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    );
  }

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-white">
      <div className="w-32" />

      {showSearch && (
        <div className="flex-1 max-w-md mx-auto">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-9 w-full"
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Help
        </button>
        {session && (
          <button
            onClick={handleLogout}
            className="text-sm text-destructive hover:text-destructive/80 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
