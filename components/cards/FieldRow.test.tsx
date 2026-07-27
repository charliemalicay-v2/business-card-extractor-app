import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldRow } from "@/components/cards/FieldRow";
import type { FieldValue } from "@/lib/types";

describe("FieldRow", () => {
  it("shows a plain value for a confirmed field", () => {
    const value: FieldValue = {
      value: "Jane Doe",
      status: "confirmed",
      ocr_llm_value: "Jane Doe",
      qr_value: "Jane Doe",
    };
    render(<FieldRow field="name" value={value} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(
      screen.queryByText(/only one source/i)
    ).not.toBeInTheDocument();
  });

  it("shows the value with an unverified indicator for an unverified field", () => {
    const value: FieldValue = {
      value: "Sales Manager",
      status: "unverified",
      ocr_llm_value: "Sales Manager",
      qr_value: null,
    };
    render(<FieldRow field="position" value={value} />);

    expect(screen.getByText("Sales Manager")).toBeInTheDocument();
    expect(screen.getByText("Unverified")).toBeInTheDocument();
    expect(screen.getByText(/only one source/i)).toBeInTheDocument();
  });

  it("shows both candidates for a conflict field, not the null value", () => {
    const value: FieldValue = {
      value: null,
      status: "conflict",
      ocr_llm_value: "Acme Corp",
      qr_value: "Acme Corporation",
    };
    render(<FieldRow field="company" value={value} />);

    expect(screen.getByText("Conflict")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Acme Corporation")).toBeInTheDocument();
  });
});
