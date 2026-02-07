import { ContainerItem } from "@/lib/types";
import { StatusText } from "./StatusText";
import { cn } from "@/lib/utils";

interface ContainerListItemProps {
  container: ContainerItem;
  onClick: (container: ContainerItem) => void;
  isSelected?: boolean;
}

export function ContainerListItem({ container, onClick, isSelected }: ContainerListItemProps) {
  const isClickable = container.arrived;

  return (
    <div
      onClick={() => onClick(container)}
      className={cn(
        "flex items-center justify-between py-4 px-5 transition-all duration-150 rounded-xl mx-2 my-0.5 list-item-animate",
        "hover:bg-secondary/60",
        isClickable ? "cursor-pointer" : "cursor-default opacity-80",
        isSelected && "bg-accent/5 border border-accent/20"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-semibold text-foreground">{container.id}</span>
          {container.enterprise && (
            <span className="text-xs text-muted-foreground">{container.enterprise}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{container.date} at {container.time}</span>
          {container.port && (
            <>
              <span className="text-border">--</span>
              <span>{container.port}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <StatusText
          arrived={container.arrived}
          scheduled={container.scheduled}
        />
        {container.arrived && !container.scheduled && (
          <span className="text-sm text-accent font-medium">Schedule pickup</span>
        )}
      </div>
    </div>
  );
}
