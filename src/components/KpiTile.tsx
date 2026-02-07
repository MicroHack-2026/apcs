import { cn } from "@/lib/utils";

interface KpiTileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  valueClassName?: string;
  onClick?: () => void;
}

export function KpiTile({ title, value, subtitle, valueClassName, onClick }: KpiTileProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white border border-border rounded-xl p-5 shadow-card transition-all duration-150",
        onClick && "cursor-pointer hover:shadow-card-hover"
      )}
    >
      <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
      <p className={cn("text-3xl font-semibold text-foreground tabular-nums", valueClassName)}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
