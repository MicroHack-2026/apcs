import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ContainerItem } from "@/lib/types";
import { LayoutShell } from "@/components/LayoutShell";
import { ContainersList } from "@/components/ContainersList";
import { StatusFilterTabs, StatusFilter } from "@/components/StatusFilterTabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useContainers } from "@/hooks/useContainers";

export default function EnterprisePage() {
  const navigate = useNavigate();
  const { data: containers = [], isLoading } = useContainers();
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"arrival" | "id" | "status">("arrival");

  const filteredContainers = useMemo(() => {
    let filtered = containers.filter((container) => {
      if (statusFilter === "arrived" && !container.arrived) return false;
      if (statusFilter === "not-arrived" && container.arrived) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return container.id.toLowerCase().includes(query) ||
               (container.enterprise?.toLowerCase().includes(query) ?? false);
      }

      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "id":
          return a.id.localeCompare(b.id);
        case "status":
          return (b.arrived ? 1 : 0) - (a.arrived ? 1 : 0);
        case "arrival":
        default:
          return new Date(b.date + "T" + b.time).getTime() - new Date(a.date + "T" + a.time).getTime();
      }
    });

    return filtered;
  }, [containers, statusFilter, searchQuery, sortBy]);

  const handleContainerClick = (container: ContainerItem) => {
    if (!container.arrived) {
      toast({
        title: "Not Available",
        description: "This container has not arrived yet.",
      });
      return;
    }

    setSelectedContainerId(container.id);

    if (container.scheduled) {
      toast({
        title: "Already Scheduled",
        description: `Appointment scheduled for ${container.appointmentDate} at ${container.appointmentHour}`,
      });
      return;
    }

    navigate(`/enterprise/appointments/${container.id}`);
  };

  const arrivedCount = containers.filter(c => c.arrived).length;
  const notArrivedCount = containers.filter(c => !c.arrived).length;

  return (
    <LayoutShell showSidebar={false}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Containers</h1>
              <p className="text-muted-foreground mt-1">
                Track container arrivals and schedule pickup appointments
              </p>
            </div>
            <Button onClick={() => navigate("/enterprise/bookings")}>
              My Bookings
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{containers.length}</span> total
              <span className="mx-2 text-border">--</span>
              <span className="text-status-arrived font-medium">{arrivedCount}</span> arrived
              <span className="mx-2 text-border">--</span>
              <span className="text-status-not-arrived font-medium">{notArrivedCount}</span> not arrived
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Input
              type="text"
              placeholder="Search by container ID or enterprise..."
              className="max-w-xs h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <StatusFilterTabs
              activeFilter={statusFilter}
              onFilterChange={setStatusFilter}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-9 px-3 text-sm border border-border rounded-lg bg-white text-foreground"
            >
              <option value="arrival">Sort: Arrival time</option>
              <option value="id">Sort: Container ID</option>
              <option value="status">Sort: Status</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-card overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">
              Loading containers...
            </div>
          ) : filteredContainers.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground text-lg mb-1">No containers found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <ContainersList
              containers={filteredContainers}
              onContainerClick={handleContainerClick}
              selectedContainerId={selectedContainerId}
            />
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
