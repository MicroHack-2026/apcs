import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContainerItem } from "@/lib/types";
import { containersService } from "@/services/containers.service";
import { toast } from "./use-toast";

export const useContainers = () => {
  return useQuery({
    queryKey: ["containers"],
    queryFn: () => containersService.getContainers(),
  });
};

export const useContainer = (id: string) => {
  return useQuery({
    queryKey: ["containers", id],
    queryFn: () => containersService.getContainerById(id),
    enabled: !!id,
  });
};

export const useUpdateContainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ContainerItem> }) =>
      containersService.updateContainer(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["containers", variables.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update container",
        variant: "destructive",
      });
    },
  });
};
