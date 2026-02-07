export type Role = "ADMIN" | "ENTERPRISE" | "MANAGER";

export interface ContainerItem {
  id: string;
  date: string;
  time: string;
  arrived: boolean;
  scheduled?: boolean;
  appointmentDate?: string;
  appointmentHour?: string;
  enterprise?: string;
  port?: string;
  terminal?: string;
  lat?: number;
  lng?: number;
}

export interface SlotAvailability {
  date: string;
  hours: string[];
}

export interface BookingRequest {
  containerId: string;
  date: string;
  hour: string;
}

export interface BookingResult {
  success: boolean;
  message: string;
}

export interface Booking {
  bookingId: string;
  containerId: string;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  enterprise: string;
  createdAt: string;
  scannedAt?: string;
}

export interface ScanEvent {
  id: string;
  bookingId: string;
  containerId: string;
  timestamp: string;
  decodedPayload: string;
  confirmed: boolean;
}

export interface UserSession {
  role: Role;
  username: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Disabled";
  createdAt: string;
}

export interface EnterpriseOwner {
  id: string;
  companyName: string;
  ownerName: string;
  email: string;
  containersCount: number;
  status: "Active" | "Disabled";
  createdAt: string;
}

export type SlotStatus = "Open" | "Closed" | "Maintenance";

export interface Slot {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: SlotStatus;
  capacity: number;
  booked: number;
  comment?: string;
}

export interface PlatformSettings {
  platformName: string;
  defaultTimeZone: string;
  slotDurationMinutes: number;
  defaultCapacity: number;
  notifyOnBooking: boolean;
  notifyOnArrival: boolean;
  notifyOnCancellation: boolean;
  maintenanceMode: boolean;
}

export interface ChartDataPoint {
  date: string;
  appointments: number;
  arrived: number;
  notArrived: number;
}
