import { Booking } from "@/lib/types";
import { mockBookings } from "@/lib/mockData";

let bookings = [...mockBookings];

export const bookingsListService = {
  getBookings: async (): Promise<Booking[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUpcomingBookings: async (): Promise<Booking[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return bookings.filter((b) => b.status === "Scheduled").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  getBookingHistory: async (): Promise<Booking[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return bookings.filter((b) => b.status !== "Scheduled").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addBooking: (booking: Booking): void => {
    bookings.push(booking);
  },

  reset: (): void => {
    bookings = [...mockBookings];
  },
};
