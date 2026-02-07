import { cn } from "@/lib/utils";

export type StatusFilter = "all" | "arrived" | "not-arrived";

interface StatusFilterTabsProps {
  activeFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
}

export function StatusFilterTabs({ activeFilter, onFilterChange }: StatusFilterTabsProps) {
  const filters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "arrived", label: "Arrived" },
    { value: "not-arrived", label: "Not Arrived" },
  ];

  return (
    <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150",
            activeFilter === filter.value
              ? "bg-accent text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
