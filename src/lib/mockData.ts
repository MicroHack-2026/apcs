import { ContainerItem, SlotAvailability, Booking, ScanEvent, ChartDataPoint } from "./types";
import { addDays, format, subDays } from "date-fns";

export const mockContainers: ContainerItem[] = [
  { id: "CNTR-001", date: "2026-02-05", time: "08:30", arrived: true, enterprise: "Global Logistics Inc", port: "Port of Rotterdam", terminal: "Terminal A", lat: 51.9496, lng: 4.1453 },
  { id: "CNTR-002", date: "2026-02-05", time: "09:15", arrived: false, enterprise: "Pacific Shipping Co", port: "Port of Shanghai", terminal: "Terminal C", lat: 31.3655, lng: 121.6128 },
  { id: "CNTR-003", date: "2026-02-06", time: "10:00", arrived: true, enterprise: "Continental Freight", port: "Port of Singapore", terminal: "Terminal B", lat: 1.2644, lng: 103.8198 },
  { id: "CNTR-004", date: "2026-02-06", time: "11:45", arrived: false, enterprise: "Maritime Solutions", port: "Port of Los Angeles", terminal: "Terminal D", lat: 33.7361, lng: -118.2626 },
  { id: "CNTR-005", date: "2026-02-07", time: "07:00", arrived: true, enterprise: "Express Cargo Ltd", port: "Port of Hamburg", terminal: "Terminal A", lat: 53.5327, lng: 9.9332 },
  { id: "CNTR-006", date: "2026-02-07", time: "14:30", arrived: false, enterprise: "Global Logistics Inc", port: "Port of Busan", terminal: "Terminal E", lat: 35.0796, lng: 129.0558 },
  { id: "CNTR-007", date: "2026-02-08", time: "16:00", arrived: true, enterprise: "Pacific Shipping Co", port: "Port of Antwerp", terminal: "Terminal B", lat: 51.2944, lng: 4.3045 },
  { id: "CNTR-008", date: "2026-02-09", time: "13:15", arrived: true, enterprise: "Continental Freight", port: "Port of Dubai", terminal: "Terminal C", lat: 25.2697, lng: 55.3095 },
  { id: "CNTR-009", date: "2026-02-09", time: "06:45", arrived: true, scheduled: true, appointmentDate: "2026-02-12", appointmentHour: "09:00", enterprise: "Express Cargo Ltd", port: "Port of Tokyo", terminal: "Terminal A", lat: 35.6520, lng: 139.7963 },
  { id: "CNTR-010", date: "2026-02-10", time: "11:00", arrived: false, enterprise: "Maritime Solutions", port: "Port of Santos", terminal: "Terminal D", lat: -23.9590, lng: -46.3340 },
  { id: "CNTR-011", date: "2026-02-10", time: "15:30", arrived: true, enterprise: "Global Logistics Inc", port: "Port of Algeciras", terminal: "Terminal B", lat: 36.1277, lng: -5.4427 },
  { id: "CNTR-012", date: "2026-02-11", time: "08:00", arrived: false, enterprise: "Pacific Shipping Co", port: "Port of Colombo", terminal: "Terminal C", lat: 6.9435, lng: 79.8482 },
];

export const mockBookings: Booking[] = [
  { bookingId: "BK-10001", containerId: "CNTR-009", date: "2026-02-12", time: "09:00", status: "Scheduled", enterprise: "Express Cargo Ltd", createdAt: "2026-02-07T10:30:00Z" },
  { bookingId: "BK-10002", containerId: "CNTR-001", date: "2026-02-11", time: "10:30", status: "Completed", enterprise: "Global Logistics Inc", createdAt: "2026-02-05T14:00:00Z", scannedAt: "2026-02-11T10:25:00Z" },
  { bookingId: "BK-10003", containerId: "CNTR-003", date: "2026-02-10", time: "14:00", status: "Completed", enterprise: "Continental Freight", createdAt: "2026-02-06T09:15:00Z", scannedAt: "2026-02-10T13:55:00Z" },
  { bookingId: "BK-10004", containerId: "CNTR-007", date: "2026-02-13", time: "11:00", status: "Scheduled", enterprise: "Pacific Shipping Co", createdAt: "2026-02-08T16:45:00Z" },
  { bookingId: "BK-10005", containerId: "CNTR-005", date: "2026-02-09", time: "08:00", status: "Cancelled", enterprise: "Express Cargo Ltd", createdAt: "2026-02-07T08:00:00Z" },
];

export const mockScanEvents: ScanEvent[] = [
  { id: "SC-001", bookingId: "BK-10002", containerId: "CNTR-001", timestamp: "2026-02-11T10:25:00Z", decodedPayload: '{"bookingId":"BK-10002","containerId":"CNTR-001","date":"2026-02-11","time":"10:30"}', confirmed: true },
  { id: "SC-002", bookingId: "BK-10003", containerId: "CNTR-003", timestamp: "2026-02-10T13:55:00Z", decodedPayload: '{"bookingId":"BK-10003","containerId":"CNTR-003","date":"2026-02-10","time":"14:00"}', confirmed: true },
];

const generateAvailability = (): SlotAvailability[] => {
  const availability: SlotAvailability[] = [];
  const today = new Date();

  for (let i = 1; i <= 14; i++) {
    const date = addDays(today, i);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const allHours = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
    const availableCount = Math.floor(Math.random() * 6) + 5;
    const shuffled = [...allHours].sort(() => 0.5 - Math.random());
    const hours = shuffled.slice(0, availableCount).sort();

    availability.push({
      date: format(date, "yyyy-MM-dd"),
      hours,
    });
  }

  return availability;
};

export const mockAvailability: SlotAvailability[] = generateAvailability();

export const getAvailableDates = (): string[] => {
  return mockAvailability.map((slot) => slot.date);
};

export const getAvailableHours = (date: string): string[] => {
  const slot = mockAvailability.find((s) => s.date === date);
  return slot?.hours || [];
};

export const generateChartData = (days: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    data.push({
      date: format(date, "MMM dd"),
      appointments: Math.floor(Math.random() * 20) + 5,
      arrived: Math.floor(Math.random() * 30) + 10,
      notArrived: Math.floor(Math.random() * 15) + 3,
    });
  }

  return data;
};
