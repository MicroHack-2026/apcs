import { cn } from "@/lib/utils";

interface StatusTextProps {
  arrived: boolean;
  scheduled?: boolean;
  className?: string;
}

export function StatusText({ arrived, scheduled, className }: StatusTextProps) {
  if (scheduled) {
    return (
      <span className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        "bg-accent/10 text-accent border border-accent/20",
        className
      )}>
        Scheduled
      </span>
    );
  }

  if (arrived) {
    return (
      <span className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        "bg-status-arrived text-status-arrived border border-status-arrived/20",
        className
      )}>
        Arrived
      </span>
    );
  }

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
      "bg-status-not-arrived text-status-not-arrived border border-status-not-arrived/20",
      className
    )}>
      Not Arrived
    </span>
  );
}

interface StatusPillProps {
  status: "Active" | "Disabled";
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
      status === "Active"
        ? "bg-status-arrived text-status-arrived border border-status-arrived/20"
        : "bg-status-not-arrived text-status-not-arrived border border-status-not-arrived/20",
      className
    )}>
      {status}
    </span>
  );
}
