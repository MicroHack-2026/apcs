import { useState, useMemo } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { StatusText } from "@/components/StatusText";
import { StatusFilterTabs, StatusFilter } from "@/components/StatusFilterTabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useContainers } from "@/hooks/useContainers";
import { ContainerItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AdminContainersPage() {
  const { data: containers = [], isLoading } = useContainers();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContainer, setSelectedContainer] = useState<ContainerItem | null>(null);

  const filtered = useMemo(() => {
    return containers.filter((c) => {
      if (statusFilter === "arrived" && !c.arrived) return false;
      if (statusFilter === "not-arrived" && c.arrived) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.id.toLowerCase().includes(q) ||
               (c.enterprise?.toLowerCase().includes(q) ?? false) ||
               (c.port?.toLowerCase().includes(q) ?? false);
      }
      return true;
    });
  }, [containers, statusFilter, searchQuery]);

  return (
    <LayoutShell showSidebar={true} role="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Containers</h1>
            <p className="text-muted-foreground">View and manage all containers across the platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Input
            type="text"
            placeholder="Search containers, enterprise, port..."
            className="max-w-sm h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <StatusFilterTabs activeFilter={statusFilter} onFilterChange={setStatusFilter} />
        </div>

        <div className="flex gap-6">
          <div className={cn("flex-1", selectedContainer && "lg:max-w-[60%]")}>
            <div className="bg-white border border-border rounded-xl shadow-card overflow-hidden">
              {isLoading ? (
                <div className="py-16 text-center text-muted-foreground">Loading containers...</div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-muted-foreground text-lg mb-1">No containers found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Container</th>
                      <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Enterprise</th>
                      <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Port / Terminal</th>
                      <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Arrival</th>
                      <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr
                        key={c.id}
                        className={cn(
                          "border-b border-border last:border-0 hover:bg-secondary/40 transition-colors cursor-pointer",
                          selectedContainer?.id === c.id && "bg-accent/5"
                        )}
                        onClick={() => setSelectedContainer(c)}
                      >
                        <td className="px-5 py-4 font-semibold text-sm">{c.id}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{c.enterprise || "--"}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{c.port || "--"}{c.terminal ? ` / ${c.terminal}` : ""}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{c.date} {c.time}</td>
                        <td className="px-5 py-4">
                          <StatusText arrived={c.arrived} scheduled={c.scheduled} />
                        </td>
                        <td className="px-5 py-4">
                          <button className="text-sm text-accent font-medium hover:underline">
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {selectedContainer && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white border border-border rounded-xl p-6 shadow-card sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{selectedContainer.id}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedContainer(null)}>
                    Close
                  </Button>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <div className="mt-1">
                      <StatusText arrived={selectedContainer.arrived} scheduled={selectedContainer.scheduled} />
                    </div>
                  </div>
                  {selectedContainer.enterprise && (
                    <div>
                      <span className="text-muted-foreground">Enterprise</span>
                      <p className="font-medium mt-0.5">{selectedContainer.enterprise}</p>
                    </div>
                  )}
                  {selectedContainer.port && (
                    <div>
                      <span className="text-muted-foreground">Port</span>
                      <p className="font-medium mt-0.5">{selectedContainer.port}</p>
                    </div>
                  )}
                  {selectedContainer.terminal && (
                    <div>
                      <span className="text-muted-foreground">Terminal</span>
                      <p className="font-medium mt-0.5">{selectedContainer.terminal}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Arrival Time</span>
                    <p className="font-medium mt-0.5">{selectedContainer.date} at {selectedContainer.time}</p>
                  </div>
                  {selectedContainer.scheduled && (
                    <div className="pt-3 border-t border-border">
                      <span className="text-muted-foreground">Appointment</span>
                      <p className="font-medium mt-0.5">
                        {selectedContainer.appointmentDate} at {selectedContainer.appointmentHour}
                      </p>
                    </div>
                  )}
                  {selectedContainer.lat && selectedContainer.lng && (
                    <div>
                      <span className="text-muted-foreground">Coordinates</span>
                      <p className="font-medium mt-0.5 text-xs">
                        {selectedContainer.lat.toFixed(4)}, {selectedContainer.lng.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
