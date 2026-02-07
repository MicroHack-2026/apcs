import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlatformSettings } from "@/lib/types";
import { settingsService } from "@/services/settings.service";
import { toast } from "./use-toast";

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.getSettings(),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<PlatformSettings>) =>
      settingsService.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: "Settings Updated",
        description: "Platform settings have been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });
};
