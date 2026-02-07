import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EnterpriseOwner } from "@/lib/types";
import { enterpriseOwnersService } from "@/services/enterpriseOwners.service";
import { toast } from "./use-toast";

export const useEnterpriseOwners = () => {
  return useQuery({
    queryKey: ["enterpriseOwners"],
    queryFn: () => enterpriseOwnersService.getEnterpriseOwners(),
  });
};

export const useEnterpriseOwner = (id: string) => {
  return useQuery({
    queryKey: ["enterpriseOwners", id],
    queryFn: () => enterpriseOwnersService.getEnterpriseOwnerById(id),
    enabled: !!id,
  });
};

export const useCreateEnterpriseOwner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<EnterpriseOwner, "id" | "createdAt" | "containersCount">) =>
      enterpriseOwnersService.createEnterpriseOwner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterpriseOwners"] });
      toast({
        title: "Enterprise Owner Created",
        description: "Enterprise owner has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create enterprise owner",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEnterpriseOwner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<EnterpriseOwner> }) =>
      enterpriseOwnersService.updateEnterpriseOwner(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enterpriseOwners"] });
      queryClient.invalidateQueries({ queryKey: ["enterpriseOwners", variables.id] });
      toast({
        title: "Enterprise Owner Updated",
        description: "Enterprise owner has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update enterprise owner",
        variant: "destructive",
      });
    },
  });
};
