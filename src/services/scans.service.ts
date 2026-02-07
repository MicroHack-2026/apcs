import { ScanEvent } from "@/lib/types";
import { mockScanEvents } from "@/lib/mockData";

let scanEvents = [...mockScanEvents];
let scanCounter = scanEvents.length;

export const scansService = {
  getScanEvents: async (): Promise<ScanEvent[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...scanEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  addScanEvent: async (event: Omit<ScanEvent, "id">): Promise<ScanEvent> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    scanCounter++;
    const newEvent: ScanEvent = {
      ...event,
      id: `SC-${String(scanCounter).padStart(3, "0")}`,
    };
    scanEvents.push(newEvent);
    return newEvent;
  },

  reset: (): void => {
    scanEvents = [...mockScanEvents];
    scanCounter = scanEvents.length;
  },
};
