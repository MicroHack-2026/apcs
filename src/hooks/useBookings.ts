import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingRequest } from "@/lib/types";
import { bookingService } from "@/services/booking.service";
import { containersService } from "@/services/containers.service";
import { toast } from "./use-toast";

export const usePickupAvailability = (containerId: string) => {
  return useQuery({
    queryKey: ["pickupAvailability", containerId],
    queryFn: () => bookingService.getPickupAvailability(containerId),
    enabled: !!containerId,
  });
};

export const useAvailableDates = () => {
  return useQuery({
    queryKey: ["availableDates"],
    queryFn: () => bookingService.getAvailableDates(),
  });
};

export const useAvailableHours = (date: string) => {
  return useQuery({
    queryKey: ["availableHours", date],
    queryFn: () => bookingService.getAvailableHours(date),
    enabled: !!date,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BookingRequest) => bookingService.createBooking(request),
    onSuccess: (result, request) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["containers", request.containerId] });
      queryClient.invalidateQueries({ queryKey: ["pickupAvailability", request.containerId] });
      queryClient.invalidateQueries({ queryKey: ["availableDates"] });
      queryClient.invalidateQueries({ queryKey: ["availableHours"] });
      toast({
        title: "Booking Created",
        description: result.message || "Appointment scheduled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    },
  });
};
