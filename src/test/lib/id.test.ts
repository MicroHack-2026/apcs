import { describe, it, expect, beforeEach } from "vitest";
import { generateBookingId } from "@/lib/id";

describe("generateBookingId", () => {
  it("should generate a booking ID with BK- prefix", () => {
    const id = generateBookingId();
    expect(id).toMatch(/^BK-\d+$/);
  });

  it("should generate incrementing IDs", () => {
    const id1 = generateBookingId();
    const id2 = generateBookingId();
    const id3 = generateBookingId();

    const num1 = parseInt(id1.replace("BK-", ""));
    const num2 = parseInt(id2.replace("BK-", ""));
    const num3 = parseInt(id3.replace("BK-", ""));

    expect(num2).toBe(num1 + 1);
    expect(num3).toBe(num2 + 1);
  });

  it("should generate unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateBookingId());
    }
    expect(ids.size).toBe(100);
  });

  it("should return a string type", () => {
    const id = generateBookingId();
    expect(typeof id).toBe("string");
  });
});
