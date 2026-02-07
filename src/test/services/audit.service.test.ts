import { describe, it, expect, vi, beforeEach } from "vitest";
import { auditService } from "@/services/audit.service";
import type { AuditEvent, AuditStatistics, AuditEventSummary } from "@/services/audit.service";
import { apiClient } from "@/services/apiClient";

// Mock the apiClient
vi.mock("@/services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("auditService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAuditEvent: AuditEvent = {
    id: 1,
    eventType: "BOOKING_CREATED",
    eventTypeDisplay: "Booking Created",
    eventTypeDescription: "A new booking was created",
    timestamp: "2026-02-07T10:30:00Z",
    sourceService: "booking-service",
    userId: 100,
    username: "testuser",
    entityType: "Booking",
    entityId: "BK-20260207-0001",
    description: "Created booking for container CONT123",
    payload: null,
    previousState: null,
    newState: null,
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    traceId: "trace-123",
    result: "SUCCESS",
    errorMessage: null,
    metadata: null,
    createdAt: "2026-02-07T10:30:00Z",
  };

  const mockAuditSummary: AuditEventSummary = {
    id: 1,
    eventType: "BOOKING_CREATED",
    eventTypeDisplay: "Booking Created",
    timestamp: "2026-02-07T10:30:00Z",
    sourceService: "booking-service",
    userId: 100,
    username: "testuser",
    entityType: "Booking",
    entityId: "BK-20260207-0001",
    description: "Created booking for container CONT123",
    result: "SUCCESS",
  };

  const mockStatistics: AuditStatistics = {
    totalEvents: 100,
    eventsByType: {
      BOOKING_CREATED: 40,
      AUTH_LOGIN_SUCCESS: 30,
    },
    eventsByService: {
      "booking-service": 50,
      "auth-service": 30,
    },
    recentFailures: 5,
  };

  const mockPagedResponse = {
    content: [mockAuditSummary],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true,
  };

  describe("searchEvents", () => {
    it("should search events with pagination", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockPagedResponse,
      });

      const result = await auditService.searchEvents({ page: 0, size: 20 });

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/audit/events/search?")
      );
      expect(result.content).toHaveLength(1);
      expect(result.content[0].eventType).toBe("BOOKING_CREATED");
    });

    it("should search events with filters", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockPagedResponse,
      });

      await auditService.searchEvents({
        eventType: "BOOKING_CREATED",
        sourceService: "booking-service",
        page: 0,
        size: 20,
      });

      const calledUrl = vi.mocked(apiClient.get).mock.calls[0][0];
      expect(calledUrl).toContain("eventType=BOOKING_CREATED");
      expect(calledUrl).toContain("sourceService=booking-service");
    });
  });

  describe("getEventById", () => {
    it("should fetch event by ID", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockAuditEvent,
      });

      const result = await auditService.getEventById(1);

      expect(apiClient.get).toHaveBeenCalledWith("/api/audit/events/1");
      expect(result.id).toBe(1);
      expect(result.eventType).toBe("BOOKING_CREATED");
    });
  });

  describe("getEventsByType", () => {
    it("should fetch events by type with pagination", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockPagedResponse,
      });

      const result = await auditService.getEventsByType("BOOKING_CREATED", 0, 20);

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/audit/events/type/BOOKING_CREATED?page=0&size=20"
      );
      expect(result.content).toHaveLength(1);
    });
  });

  describe("getEventsByService", () => {
    it("should fetch events by service", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockPagedResponse,
      });

      const result = await auditService.getEventsByService("booking-service", 0, 20);

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/audit/events/service/booking-service?page=0&size=20"
      );
      expect(result.content).toHaveLength(1);
    });
  });

  describe("getUserActivity", () => {
    it("should fetch user activity", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockPagedResponse,
      });

      const result = await auditService.getUserActivity(100, 0, 20);

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/audit/events/user/100?page=0&size=20"
      );
      expect(result.content).toHaveLength(1);
    });
  });

  describe("getEntityHistory", () => {
    it("should fetch entity history", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockPagedResponse,
      });

      const result = await auditService.getEntityHistory("Booking", "BK-20260207-0001");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/audit/events/entity/Booking/BK-20260207-0001?page=0&size=20"
      );
      expect(result.content).toHaveLength(1);
    });
  });

  describe("getStatistics", () => {
    it("should fetch statistics", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockStatistics,
      });

      const result = await auditService.getStatistics();

      expect(apiClient.get).toHaveBeenCalledWith("/api/audit/statistics");
      expect(result.totalEvents).toBe(100);
      expect(result.recentFailures).toBe(5);
    });
  });

  describe("getRecentFailures", () => {
    it("should fetch recent failures", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockPagedResponse,
      });

      const result = await auditService.getRecentFailures(24, 0, 20);

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/audit/events/failures?hours=24&page=0&size=20"
      );
      expect(result.content).toHaveLength(1);
    });
  });

  describe("getEventTypes", () => {
    it("should fetch all event types", async () => {
      const eventTypes = [
        { name: "BOOKING_CREATED", displayName: "Booking Created", description: "A booking was created" },
        { name: "AUTH_LOGIN_SUCCESS", displayName: "Login Success", description: "User logged in" },
      ];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: eventTypes,
      });

      const result = await auditService.getEventTypes();

      expect(apiClient.get).toHaveBeenCalledWith("/api/audit/event-types");
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("BOOKING_CREATED");
    });
  });
});
