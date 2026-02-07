import { describe, it, expect, vi, beforeEach } from "vitest";
import { bookingService } from "@/services/booking.service";
import { apiClient } from "@/services/apiClient";
import type { BookingResponse, CreateBookingRequest } from "@/lib/types";

// Mock the apiClient
vi.mock("@/services/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock authService for schedulePickup tests
vi.mock("@/services/auth.service", () => ({
  authService: {
    getSession: vi.fn(() => ({
      userId: 100,
      firstName: "Test",
      lastName: "User",
    })),
  },
}));

describe("bookingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBookingResponse: BookingResponse = {
    id: 1,
    referenceNumber: "BK-20260207-0001",
    userId: 100,
    userEmail: "test@example.com",
    terminalId: 1,
    terminalName: "Terminal 1",
    gateId: 1,
    gateName: "Gate A",
    slotId: 1,
    containerNumber: "CONT123456",
    driverName: "John Driver",
    truckPlateNumber: "ABC-1234",
    visitPurpose: "PICKUP",
    bookingDate: "2026-02-08",
    startTime: "09:00",
    endTime: "10:00",
    status: "CONFIRMED",
    createdAt: "2026-02-07T10:00:00Z",
    updatedAt: "2026-02-07T10:30:00Z",
    checkInTime: undefined,
    checkOutTime: undefined,
    cancellationReason: undefined,
  };

  describe("createBooking", () => {
    it("should create a booking successfully", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        success: true,
        data: mockBookingResponse,
      });

      const request: CreateBookingRequest = {
        containerNumber: "CONT123456",
        bookingDate: "2026-02-08",
        preferredStartTime: "09:00",
        terminalId: 1,
        gateId: 1,
        driverName: "John Driver",
        truckPlateNumber: "ABC-1234",
        visitPurpose: "PICKUP",
      };

      const result = await bookingService.createBooking(request);

      expect(apiClient.post).toHaveBeenCalledWith("/api/bookings", request);
      expect(result.referenceNumber).toBe("BK-20260207-0001");
      expect(result.status).toBe("CONFIRMED");
    });
  });

  describe("getBookingById", () => {
    it("should fetch a booking by ID", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockBookingResponse,
      });

      const result = await bookingService.getBookingById(1);

      expect(apiClient.get).toHaveBeenCalledWith("/api/bookings/1");
      expect(result.id).toBe(1);
    });
  });

  describe("getBookingByReference", () => {
    it("should fetch a booking by reference number", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockBookingResponse,
      });

      const result = await bookingService.getBookingByReference("BK-20260207-0001");

      expect(apiClient.get).toHaveBeenCalledWith("/api/bookings/ref/BK-20260207-0001");
      expect(result.referenceNumber).toBe("BK-20260207-0001");
    });
  });

  describe("getUserBookings", () => {
    it("should fetch bookings for a user", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: [mockBookingResponse],
      });

      const result = await bookingService.getUserBookings(100);

      expect(apiClient.get).toHaveBeenCalledWith("/api/bookings/user/100");
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(100);
    });
  });

  describe("confirmBooking", () => {
    it("should confirm a booking", async () => {
      const confirmedBooking = { ...mockBookingResponse, status: "CONFIRMED" as const };
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        success: true,
        data: confirmedBooking,
      });

      const result = await bookingService.confirmBooking(1);

      expect(apiClient.post).toHaveBeenCalledWith("/api/bookings/1/confirm");
      expect(result.status).toBe("CONFIRMED");
    });
  });

  describe("cancelBooking", () => {
    it("should cancel a booking", async () => {
      const cancelledBooking = { 
        ...mockBookingResponse, 
        status: "CANCELLED" as const,
        cancellationReason: "User requested",
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        success: true,
        data: cancelledBooking,
      });

      const result = await bookingService.cancelBooking(1, "User requested");

      expect(apiClient.post).toHaveBeenCalledWith("/api/bookings/1/cancel", {
        reason: "User requested",
      });
      expect(result.status).toBe("CANCELLED");
    });
  });

  describe("getTerminalBookings", () => {
    it("should fetch bookings for a terminal and date", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: [mockBookingResponse],
      });

      const result = await bookingService.getTerminalBookings(1, "2026-02-08");

      expect(apiClient.get).toHaveBeenCalledWith("/api/bookings/terminal/1?date=2026-02-08");
      expect(result).toHaveLength(1);
    });
  });

  describe("updateBooking", () => {
    it("should update a booking", async () => {
      const updatedBooking = {
        ...mockBookingResponse,
        bookingDate: "2026-02-09",
      };
      vi.mocked(apiClient.put).mockResolvedValueOnce({
        success: true,
        data: updatedBooking,
      });

      const result = await bookingService.updateBooking(1, {
        bookingDate: "2026-02-09",
      });

      expect(apiClient.put).toHaveBeenCalledWith("/api/bookings/1", {
        bookingDate: "2026-02-09",
      });
      expect(result.bookingDate).toBe("2026-02-09");
    });
  });

  describe("getUserBookingsPaged", () => {
    it("should fetch paginated bookings for a user", async () => {
      const pagedResponse = {
        content: [mockBookingResponse],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: pagedResponse,
      });

      const result = await bookingService.getUserBookingsPaged(100, 0, 10);

      expect(apiClient.get).toHaveBeenCalledWith("/api/bookings/user/100/paged?page=0&size=10");
      expect(result.content).toHaveLength(1);
      expect(result.totalElements).toBe(1);
    });
  });
});
