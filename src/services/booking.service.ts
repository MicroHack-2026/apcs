import { BookingRequest, BookingResult } from "@/lib/types";
import { containersService } from "./containers.service";
import { generateBookingId } from "@/lib/id";
import { apiClient } from "./apiClient";
import { USE_MOCK_DATA } from "./config";

interface PickupAvailability {
  availableDates: string[];
  timesByDate: Record<string, string[]>;
}

const generatePickupAvailability = (): PickupAvailability => {
  const availableDates: string[] = [];
  const timesByDate: Record<string, string[]> = {};
  const today = new Date();

  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = date.toISOString().split("T")[0];
    availableDates.push(dateStr);

    const allSlots = [
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
      "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
      "17:00", "17:30"
    ];

    const availableSlots = allSlots.filter(() => Math.random() > 0.3);
    timesByDate[dateStr] = availableSlots.length > 0 ? availableSlots : allSlots.slice(0, 4);
  }

  return { availableDates, timesByDate };
};

let pickupAvailability = generatePickupAvailability();

export interface BookingConfirmation {
  bookingId: string;
  containerId: string;
  date: string;
  time: string;
}

export const bookingService = {
  getPickupAvailability: async (containerId: string): Promise<PickupAvailability> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return pickupAvailability;
    }

    try {
      const response = await apiClient.get<PickupAvailability>(`/bookings/availability/${containerId}`);
      return response.data!;
    } catch (error) {
      console.error("Error fetching pickup availability:", error);
      throw error;
    }
  },

  getAvailableDates: async (): Promise<string[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return pickupAvailability.availableDates;
    }

    try {
      const availability = await bookingService.getPickupAvailability("");
      return availability.availableDates;
    } catch (error) {
      console.error("Error fetching available dates:", error);
      throw error;
    }
  },

  getAvailableHours: async (date: string): Promise<string[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return pickupAvailability.timesByDate[date] || [];
    }

    try {
      const availability = await bookingService.getPickupAvailability("");
      return availability.timesByDate[date] || [];
    } catch (error) {
      console.error("Error fetching available hours:", error);
      throw error;
    }
  },

  createBooking: async (request: BookingRequest): Promise<BookingResult & { bookingId?: string }> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const bookingId = generateBookingId();

      await containersService.updateContainer(request.containerId, {
        scheduled: true,
        appointmentDate: request.date,
        appointmentHour: request.hour,
      });

      return {
        success: true,
        message: `Appointment scheduled for ${request.date} at ${request.hour}`,
        bookingId,
      };
    }

    try {
      const response = await apiClient.post<{
        bookingId: string;
        containerId: string;
        date: string;
        time: string;
        status: string;
      }>("/bookings", {
        containerId: request.containerId,
        date: request.date,
        hour: request.hour,
      });

      return {
        success: true,
        message: response.message || `Appointment scheduled for ${request.date} at ${request.hour}`,
        bookingId: response.data?.bookingId,
      };
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },

  generateQrPayload: (booking: BookingConfirmation): string => {
    return JSON.stringify({
      bookingId: booking.bookingId,
      containerId: booking.containerId,
      date: booking.date,
      time: booking.time,
    });
  },

  reset: (): void => {
    pickupAvailability = generatePickupAvailability();
  },
};
