interface MapPanelProps {
  className?: string;
}

export function MapPanel({ className }: MapPanelProps) {
  return (
    <div className={className}>
      <div className="border border-border rounded-lg p-8 bg-secondary/20 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground text-center">
          Map visualization will be available here.
          <br />
          <span className="text-sm">MapCN integration pending.</span>
        </p>
      </div>
    </div>
  );
}
