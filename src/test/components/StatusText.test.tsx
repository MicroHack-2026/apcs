import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusText, StatusPill } from "@/components/StatusText";

describe("StatusText", () => {
  describe("when scheduled is true", () => {
    it("should render 'Scheduled' text", () => {
      render(<StatusText arrived={false} scheduled={true} />);
      expect(screen.getByText("Scheduled")).toBeInTheDocument();
    });

    it("should have scheduled styling class", () => {
      render(<StatusText arrived={false} scheduled={true} />);
      const element = screen.getByText("Scheduled");
      expect(element).toHaveClass("glass-pill-scheduled");
    });
  });

  describe("when arrived is true", () => {
    it("should render 'Container Arrived' text", () => {
      render(<StatusText arrived={true} />);
      expect(screen.getByText("Container Arrived")).toBeInTheDocument();
    });

    it("should have arrived styling class", () => {
      render(<StatusText arrived={true} />);
      const element = screen.getByText("Container Arrived");
      expect(element).toHaveClass("glass-pill-arrived");
    });
  });

  describe("when neither scheduled nor arrived", () => {
    it("should render 'Not Arrived' text", () => {
      render(<StatusText arrived={false} />);
      expect(screen.getByText("Not Arrived")).toBeInTheDocument();
    });

    it("should have not-arrived styling class", () => {
      render(<StatusText arrived={false} />);
      const element = screen.getByText("Not Arrived");
      expect(element).toHaveClass("glass-pill-not-arrived");
    });
  });

  describe("with custom className", () => {
    it("should apply custom className", () => {
      render(<StatusText arrived={true} className="custom-class" />);
      const element = screen.getByText("Container Arrived");
      expect(element).toHaveClass("custom-class");
    });
  });

  describe("priority order", () => {
    it("should show 'Scheduled' even when arrived is true", () => {
      render(<StatusText arrived={true} scheduled={true} />);
      expect(screen.getByText("Scheduled")).toBeInTheDocument();
      expect(screen.queryByText("Container Arrived")).not.toBeInTheDocument();
    });
  });
});

describe("StatusPill", () => {
  describe("when status is Active", () => {
    it("should render 'Active' text", () => {
      render(<StatusPill status="Active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("should have active styling class", () => {
      render(<StatusPill status="Active" />);
      const element = screen.getByText("Active");
      expect(element).toHaveClass("glass-pill-active");
    });
  });

  describe("when status is Disabled", () => {
    it("should render 'Disabled' text", () => {
      render(<StatusPill status="Disabled" />);
      expect(screen.getByText("Disabled")).toBeInTheDocument();
    });

    it("should have disabled styling class", () => {
      render(<StatusPill status="Disabled" />);
      const element = screen.getByText("Disabled");
      expect(element).toHaveClass("glass-pill-disabled");
    });
  });

  describe("with custom className", () => {
    it("should apply custom className", () => {
      render(<StatusPill status="Active" className="my-custom" />);
      const element = screen.getByText("Active");
      expect(element).toHaveClass("my-custom");
    });
  });
});
