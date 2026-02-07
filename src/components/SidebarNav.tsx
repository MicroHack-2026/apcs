import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Role } from "@/lib/types";
import dashboardIcon from "@/assets/icons/dashboard.svg";
import userIcon from "@/assets/icons/user.svg";
import enterpriseIcon from "@/assets/icons/enterprise.svg";
import settingsIcon from "@/assets/icons/settings.svg";
import portlyLogo from "@/assets/logo.svg";

interface NavItem {
  label: string;
  to: string;
  icon?: string;
}

const adminNavItems: NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: dashboardIcon },
  { label: "Containers", to: "/admin/containers", icon: enterpriseIcon },
  { label: "Users", to: "/admin/users", icon: userIcon },
  { label: "Enterprise Owners", to: "/admin/enterprise-owners", icon: enterpriseIcon },
  { label: "Settings", to: "/admin/settings", icon: settingsIcon },
];

interface SidebarNavProps {
  role: Role;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarNav({ role, isCollapsed, onToggleCollapse }: SidebarNavProps) {
  const location = useLocation();
  const items = adminNavItems;
  const roleLabel = role === "ADMIN" ? "Admin" : "Manager";

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-white transition-all duration-200",
        "h-screen sticky top-0",
        isCollapsed ? "w-[72px]" : "w-60"
      )}
    >
      <div className={cn(
        "h-16 flex items-center border-b border-border px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <div className={cn(
          "flex items-center gap-2.5 transition-all duration-200",
          isCollapsed && "justify-center"
        )}>
          <img
            src={portlyLogo}
            alt="Portly"
            className={cn(
              "flex-shrink-0",
              isCollapsed ? "w-8 h-8" : "w-7 h-7"
            )}
          />
          {!isCollapsed && (
            <span className="font-semibold text-foreground text-lg">
              Portly
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
          >
            Close
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center py-2 border-b border-border">
          <button
            onClick={onToggleCollapse}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
          >
            Open
          </button>
        </div>
      )}

      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {items.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    "relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    "hover:bg-secondary",
                    isActive && "bg-accent/10 text-accent",
                    !isActive && "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-accent" />
                  )}

                  {item.icon && (
                    <img
                      src={item.icon}
                      alt=""
                      className={cn(
                        "w-5 h-5 flex-shrink-0 opacity-60",
                        isActive && "opacity-100",
                        isCollapsed ? "mx-auto" : "mr-3"
                      )}
                    />
                  )}

                  {!isCollapsed && (
                    <span>{item.label}</span>
                  )}

                  {isCollapsed && (
                    <span
                      className={cn(
                        "absolute left-full ml-3 z-50 px-3 py-1.5 rounded-lg",
                        "bg-foreground text-background text-sm font-medium whitespace-nowrap",
                        "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                        "transition-all duration-150 shadow-lg pointer-events-none"
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
            {roleLabel.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Signed in as</span>
              <span className="text-sm font-medium text-foreground">{roleLabel}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
