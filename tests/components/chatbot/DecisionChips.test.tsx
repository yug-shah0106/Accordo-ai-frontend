/**
 * DecisionChips Component Tests
 *
 * Tests chip styles, icons, labels, and click handlers for all DecisionAction types,
 * including the new REDIRECT and ERROR_RECOVERY variants.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DecisionChips from "../../../src/components/chatbot/DecisionChips";
import type { DecisionAction } from "../../../src/types/chatbot";

const ALL_ACTIONS: DecisionAction[] = [
  "ACCEPT",
  "COUNTER",
  "WALK_AWAY",
  "ESCALATE",
  "ASK_CLARIFY",
  "REDIRECT",
  "ERROR_RECOVERY",
];

describe("DecisionChips", () => {
  describe("Rendering", () => {
    it("should render a chip for each decision", () => {
      render(<DecisionChips decisions={ALL_ACTIONS} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(7);
    });

    it("should render chips in a flex wrapper", () => {
      const { container } = render(<DecisionChips decisions={["ACCEPT"]} />);
      const wrapper = container.firstElementChild;
      expect(wrapper).toHaveClass("flex", "flex-wrap", "gap-2");
    });

    it("should render empty when decisions array is empty", () => {
      const { container } = render(<DecisionChips decisions={[]} />);
      expect(container.querySelectorAll("button")).toHaveLength(0);
    });
  });

  describe("Chip styles", () => {
    it("should apply green styles for ACCEPT", () => {
      render(<DecisionChips decisions={["ACCEPT"]} />);
      const chip = screen.getByRole("button");
      expect(chip.className).toContain("bg-green-100");
      expect(chip.className).toContain("text-green-700");
      expect(chip.className).toContain("border-green-300");
    });

    it("should apply blue styles for COUNTER", () => {
      render(<DecisionChips decisions={["COUNTER"]} />);
      const chip = screen.getByRole("button");
      expect(chip.className).toContain("bg-blue-100");
      expect(chip.className).toContain("text-blue-700");
    });

    it("should apply red styles for WALK_AWAY", () => {
      render(<DecisionChips decisions={["WALK_AWAY"]} />);
      const chip = screen.getByRole("button");
      expect(chip.className).toContain("bg-red-100");
      expect(chip.className).toContain("text-red-700");
    });

    it("should apply orange styles for ESCALATE", () => {
      render(<DecisionChips decisions={["ESCALATE"]} />);
      const chip = screen.getByRole("button");
      expect(chip.className).toContain("bg-orange-100");
      expect(chip.className).toContain("text-orange-700");
    });

    it("should apply yellow styles for ASK_CLARIFY", () => {
      render(<DecisionChips decisions={["ASK_CLARIFY"]} />);
      const chip = screen.getByRole("button");
      expect(chip.className).toContain("bg-yellow-100");
      expect(chip.className).toContain("text-yellow-700");
    });

    it("should apply purple styles for REDIRECT", () => {
      render(<DecisionChips decisions={["REDIRECT"]} />);
      const chip = screen.getByRole("button");
      expect(chip.className).toContain("bg-purple-100");
      expect(chip.className).toContain("text-purple-700");
      expect(chip.className).toContain("border-purple-300");
    });

    it("should apply amber styles for ERROR_RECOVERY", () => {
      render(<DecisionChips decisions={["ERROR_RECOVERY"]} />);
      const chip = screen.getByRole("button");
      expect(chip.className).toContain("bg-amber-100");
      expect(chip.className).toContain("text-amber-700");
      expect(chip.className).toContain("border-amber-300");
    });

    it("should apply gray fallback styles for unknown actions", () => {
      render(<DecisionChips decisions={["UNKNOWN" as DecisionAction]} />);
      const chip = screen.getByRole("button");
      expect(chip.className).toContain("bg-gray-100");
      expect(chip.className).toContain("text-gray-700");
    });
  });

  describe("Icons", () => {
    it("should show checkmark icon for ACCEPT", () => {
      render(<DecisionChips decisions={["ACCEPT"]} />);
      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("should show arrows icon for COUNTER", () => {
      render(<DecisionChips decisions={["COUNTER"]} />);
      expect(screen.getByText("↔")).toBeInTheDocument();
    });

    it("should show X icon for WALK_AWAY", () => {
      render(<DecisionChips decisions={["WALK_AWAY"]} />);
      expect(screen.getByText("×")).toBeInTheDocument();
    });

    it("should show up arrow icon for ESCALATE", () => {
      render(<DecisionChips decisions={["ESCALATE"]} />);
      expect(screen.getByText("⇧")).toBeInTheDocument();
    });

    it("should show question mark for ASK_CLARIFY", () => {
      render(<DecisionChips decisions={["ASK_CLARIFY"]} />);
      expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("should show return arrow icon for REDIRECT", () => {
      render(<DecisionChips decisions={["REDIRECT"]} />);
      expect(screen.getByText("↩")).toBeInTheDocument();
    });

    it("should show shield icon for ERROR_RECOVERY", () => {
      render(<DecisionChips decisions={["ERROR_RECOVERY"]} />);
      expect(screen.getByText("🛡")).toBeInTheDocument();
    });

    it("should show bullet for unknown actions", () => {
      render(<DecisionChips decisions={["UNKNOWN" as DecisionAction]} />);
      expect(screen.getByText("•")).toBeInTheDocument();
    });
  });

  describe("Labels", () => {
    it('should display "Redirected" for REDIRECT (not "REDIRECT")', () => {
      render(<DecisionChips decisions={["REDIRECT"]} />);
      expect(screen.getByText("Redirected")).toBeInTheDocument();
      expect(screen.queryByText("REDIRECT")).not.toBeInTheDocument();
    });

    it('should display "Recovery" for ERROR_RECOVERY (not "ERROR RECOVERY")', () => {
      render(<DecisionChips decisions={["ERROR_RECOVERY"]} />);
      expect(screen.getByText("Recovery")).toBeInTheDocument();
      expect(screen.queryByText("ERROR RECOVERY")).not.toBeInTheDocument();
    });

    it('should display "Accept" for ACCEPT', () => {
      render(<DecisionChips decisions={["ACCEPT"]} />);
      expect(screen.getByText("Accept")).toBeInTheDocument();
    });

    it('should display "Walk Away" for WALK_AWAY', () => {
      render(<DecisionChips decisions={["WALK_AWAY"]} />);
      expect(screen.getByText("Walk Away")).toBeInTheDocument();
    });

    it('should display "Ask Clarify" for ASK_CLARIFY', () => {
      render(<DecisionChips decisions={["ASK_CLARIFY"]} />);
      expect(screen.getByText("Ask Clarify")).toBeInTheDocument();
    });
  });

  describe("Click handling", () => {
    it("should call onSelect when a chip is clicked", () => {
      const onSelect = vi.fn();
      render(<DecisionChips decisions={["REDIRECT"]} onSelect={onSelect} />);

      fireEvent.click(screen.getByRole("button"));
      expect(onSelect).toHaveBeenCalledWith("REDIRECT");
    });

    it("should call onSelect with correct action for each chip", () => {
      const onSelect = vi.fn();
      render(
        <DecisionChips
          decisions={["REDIRECT", "ERROR_RECOVERY"]}
          onSelect={onSelect}
        />,
      );

      fireEvent.click(screen.getByText("Redirected"));
      expect(onSelect).toHaveBeenCalledWith("REDIRECT");

      fireEvent.click(screen.getByText("Recovery"));
      expect(onSelect).toHaveBeenCalledWith("ERROR_RECOVERY");
    });

    it("should disable buttons when onSelect is not provided", () => {
      render(<DecisionChips decisions={["REDIRECT"]} />);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should use cursor-pointer when onSelect is provided", () => {
      const onSelect = vi.fn();
      render(<DecisionChips decisions={["REDIRECT"]} onSelect={onSelect} />);
      const button = screen.getByRole("button");
      expect(button.className).toContain("cursor-pointer");
    });

    it("should use cursor-default when onSelect is not provided", () => {
      render(<DecisionChips decisions={["REDIRECT"]} />);
      const button = screen.getByRole("button");
      expect(button.className).toContain("cursor-default");
    });
  });

  describe("Multiple chips rendering", () => {
    it("should render all 7 action types simultaneously", () => {
      render(<DecisionChips decisions={ALL_ACTIONS} />);

      expect(screen.getByText("Accept")).toBeInTheDocument();
      expect(screen.getByText("Counter")).toBeInTheDocument();
      expect(screen.getByText("Walk Away")).toBeInTheDocument();
      expect(screen.getByText("Escalate")).toBeInTheDocument();
      expect(screen.getByText("Ask Clarify")).toBeInTheDocument();
      expect(screen.getByText("Redirected")).toBeInTheDocument();
      expect(screen.getByText("Recovery")).toBeInTheDocument();
    });

    it("should render distinct colors for all 7 chips", () => {
      const { container } = render(<DecisionChips decisions={ALL_ACTIONS} />);
      const buttons = container.querySelectorAll("button");

      const colorClasses = Array.from(buttons).map(
        (btn) => btn.className.match(/bg-(\w+)-100/)?.[1],
      );

      // Each action has its own color
      expect(colorClasses).toContain("green"); // ACCEPT
      expect(colorClasses).toContain("blue"); // COUNTER
      expect(colorClasses).toContain("red"); // WALK_AWAY
      expect(colorClasses).toContain("orange"); // ESCALATE
      expect(colorClasses).toContain("yellow"); // ASK_CLARIFY
      expect(colorClasses).toContain("purple"); // REDIRECT
      expect(colorClasses).toContain("amber"); // ERROR_RECOVERY
    });
  });
});
