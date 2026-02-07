let bookingCounter = 10000;

export function generateBookingId(): string {
  bookingCounter++;
  return `BK-${bookingCounter}`;
}
