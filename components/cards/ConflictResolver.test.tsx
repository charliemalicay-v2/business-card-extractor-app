import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConflictResolver } from "@/components/cards/ConflictResolver";

describe("ConflictResolver", () => {
  it("reports the OCR value when the OCR candidate is selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ConflictResolver
        ocrValue="Acme Corp"
        qrValue="Acme Corporation"
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("Acme Corp"));

    expect(onChange).toHaveBeenLastCalledWith("Acme Corp");
  });

  it("reports the QR value when the QR candidate is selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ConflictResolver
        ocrValue="Acme Corp"
        qrValue="Acme Corporation"
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("Acme Corporation"));

    expect(onChange).toHaveBeenLastCalledWith("Acme Corporation");
  });

  it("reports undefined when Custom is selected but nothing is typed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ConflictResolver ocrValue="Acme Corp" qrValue="Acme Corporation" onChange={onChange} />
    );

    await user.click(screen.getByRole("button", { name: "Custom" }));

    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("reports the typed value once custom text is entered", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ConflictResolver ocrValue="Acme Corp" qrValue="Acme Corporation" onChange={onChange} />
    );

    await user.click(screen.getByRole("button", { name: "Custom" }));
    await user.type(screen.getByPlaceholderText("Enter corrected value"), "Acme Inc");

    expect(onChange).toHaveBeenLastCalledWith("Acme Inc");
  });

  it("reports undefined for a whitespace-only custom value", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ConflictResolver ocrValue="Acme Corp" qrValue="Acme Corporation" onChange={onChange} />
    );

    await user.click(screen.getByRole("button", { name: "Custom" }));
    await user.type(screen.getByPlaceholderText("Enter corrected value"), "   ");

    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("disables a candidate whose value is null", () => {
    render(
      <ConflictResolver ocrValue="Acme Corp" qrValue={null} onChange={vi.fn()} />
    );

    expect(screen.getByText("—").closest("button")).toBeDisabled();
  });
});
