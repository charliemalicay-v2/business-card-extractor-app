import { describe, expect, it } from "vitest";
import { getTotalPages } from "@/lib/pagination";

describe("getTotalPages", () => {
  it("divides evenly", () => {
    expect(getTotalPages(20, 10)).toBe(2);
  });

  it("rounds up a partial last page", () => {
    expect(getTotalPages(21, 10)).toBe(3);
  });

  it("returns 1 for zero total", () => {
    expect(getTotalPages(0, 10)).toBe(1);
  });

  it("returns 1 when total is less than page size", () => {
    expect(getTotalPages(3, 10)).toBe(1);
  });
});
