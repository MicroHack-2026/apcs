import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScanEvent } from "@/lib/types";
import { scansService } from "@/services/scans.service";
import { toast } from "./use-toast";

export const useRecentScans = () => {
  return useQuery({
    queryKey: ["scanEvents"],
    queryFn: () => scansService.getScanEvents(),
    refetchInterval: 1000 * 30,
  });
};

export const useRecordScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event: Omit<ScanEvent, "id">) => scansService.addScanEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scanEvents"] });
      toast({
        title: "Scan Recorded",
        description: "Appointment confirmed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record scan event",
        variant: "destructive",
      });
    },
  });
};
