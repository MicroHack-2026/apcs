import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("should merge single class names", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base", isActive && "active");
    expect(result).toBe("base active");
  });

  it("should filter out falsy values", () => {
    const result = cn("base", false, null, undefined, "valid");
    expect(result).toBe("base valid");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should merge Tailwind conflicting classes", () => {
    // twMerge should resolve conflicts like p-2 vs p-4
    const result = cn("p-2", "p-4");
    expect(result).toBe("p-4");
  });

  it("should handle array of classes", () => {
    const classes = ["class1", "class2"];
    const result = cn(classes);
    expect(result).toBe("class1 class2");
  });

  it("should handle object syntax for conditional classes", () => {
    const result = cn({
      base: true,
      active: true,
      disabled: false,
    });
    expect(result).toBe("base active");
  });

  it("should handle complex Tailwind class merging", () => {
    const result = cn(
      "text-sm font-medium",
      "text-lg", // Should override text-sm
      "hover:text-blue-500"
    );
    expect(result).toBe("font-medium text-lg hover:text-blue-500");
  });

  it("should merge background color classes", () => {
    const result = cn("bg-red-500", "bg-blue-500");
    expect(result).toBe("bg-blue-500");
  });

  it("should keep non-conflicting classes", () => {
    const result = cn("p-4", "m-2", "text-lg");
    expect(result).toBe("p-4 m-2 text-lg");
  });
});
