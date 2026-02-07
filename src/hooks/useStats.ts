import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/stats.service";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: () => statsService.getAdminStats(),
    refetchInterval: 1000 * 60 * 5,
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ["recentActivity"],
    queryFn: () => statsService.getRecentActivity(),
    refetchInterval: 1000 * 60 * 2,
  });
};

export const useUpcomingAppointments = () => {
  return useQuery({
    queryKey: ["upcomingAppointments"],
    queryFn: () => statsService.getUpcomingAppointments(),
    refetchInterval: 1000 * 60 * 5,
  });
};
