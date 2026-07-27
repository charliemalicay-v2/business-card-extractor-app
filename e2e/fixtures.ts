// Self-contained fixtures for E2E specs, matching API_USAGE.md's documented
// response shapes. Deliberately not imported from the app's `lib/types` so
// these specs stay a black-box layer, independent of internal refactors.

export const confirmedNoQrCard = {
  id: "b3f1c2a0-1111-4a22-9c33-abcdef123456",
  status: "confirmed",
  fields: {
    name: { value: "Jane Doe", status: "unverified", ocr_llm_value: "Jane Doe", qr_value: null },
    position: { value: "Sales Manager", status: "unverified", ocr_llm_value: "Sales Manager", qr_value: null },
    company: { value: "Acme Corp", status: "unverified", ocr_llm_value: "Acme Corp", qr_value: null },
    email: { value: "jane@acme.com", status: "unverified", ocr_llm_value: "jane@acme.com", qr_value: null },
    phone: { value: "+1-555-0100", status: "unverified", ocr_llm_value: "+1-555-0100", qr_value: null },
  },
  optional_fields: { website: "acme.com" },
  qr: { detected: false, decoded: false },
  raw_ocr_text: "Jane Doe\nSales Manager\nAcme Corp\njane@acme.com\n+1-555-0100",
  created_at: "2026-07-27T10:00:00Z",
  updated_at: "2026-07-27T10:00:00Z",
};

export const needsReviewCard = {
  id: "d5b3e4c2-3333-4c44-b155-cdef34567890",
  status: "needs_review",
  fields: {
    name: { value: "Jane Doe", status: "confirmed", ocr_llm_value: "Jane Doe", qr_value: "Jane Doe" },
    position: { value: "Sales Manager", status: "unverified", ocr_llm_value: "Sales Manager", qr_value: null },
    company: { value: null, status: "conflict", ocr_llm_value: "Acme Corp", qr_value: "Acme Corporation" },
    email: { value: "jane@acme.com", status: "confirmed", ocr_llm_value: "jane@acme.com", qr_value: "jane@acme.com" },
    phone: { value: "+1-555-0100", status: "unverified", ocr_llm_value: "+1-555-0100", qr_value: null },
  },
  optional_fields: {},
  qr: { detected: true, decoded: true },
  raw_ocr_text: "Jane Doe\nSales Manager\nAcme Corp\njane@acme.com\n+1-555-0100",
  created_at: "2026-07-27T10:10:00Z",
  updated_at: "2026-07-27T10:10:00Z",
};

export const resolvedCard = {
  ...needsReviewCard,
  status: "confirmed",
  fields: {
    ...needsReviewCard.fields,
    company: {
      value: "Acme Corporation",
      status: "confirmed",
      ocr_llm_value: "Acme Corp",
      qr_value: "Acme Corporation",
    },
  },
  updated_at: "2026-07-27T10:15:00Z",
};

export function makeListItem(overrides: {
  id: string;
  status: "confirmed" | "needs_review";
  name: string;
}) {
  return {
    ...confirmedNoQrCard,
    id: overrides.id,
    status: overrides.status,
    fields: {
      ...confirmedNoQrCard.fields,
      name: { ...confirmedNoQrCard.fields.name, value: overrides.name },
    },
    raw_ocr_text: undefined,
  };
}
