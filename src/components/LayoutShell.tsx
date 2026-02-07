import { ReactNode } from "react";
import { DockNav } from "./DockNav";
import { TopBar } from "./TopBar";
import { Role } from "@/lib/types";

interface LayoutShellProps {
  children: ReactNode;
  title?: string;
  showSidebar?: boolean;
  role?: Role;
}

export function LayoutShell({ children, title, showSidebar = true, role = "ADMIN" }: LayoutShellProps) {
  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center justify-end px-6 h-14 border-b border-border">
          <TopBar showSearch={false} minimal />
        </div>
        <main className="flex-1 p-6">
          {title && (
            <h1 className="text-2xl font-semibold mb-6">{title}</h1>
          )}
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-foreground text-lg tracking-tight">
            Portly
          </span>
          <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-secondary">
            {role === "ADMIN" ? "Admin" : role === "MANAGER" ? "Manager" : "Enterprise"}
          </span>
        </div>
        <TopBar showSearch={true} minimal />
      </div>

      {/* Main content with bottom padding for dock */}
      <main className="flex-1 p-6 pb-24 overflow-auto bg-secondary/30">
        {children}
      </main>

      {/* Bottom Dock Navigation */}
      <DockNav role={role} />
    </div>
  );
}
