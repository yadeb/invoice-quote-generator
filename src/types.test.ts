import { describe, expect, it } from "vitest";
import { DEMO_CONFIG } from "./demo-config.js";
import {
  createEmptyQuote,
  createQuoteLine,
  lineTotal,
  quoteFileName,
  resolvedBranch,
  sumQuoteLines,
  validateCompanyStep,
  validateLinesStep,
  validateOptionalBank,
  validateTypeStep,
} from "./types.js";

describe("quote totals", () => {
  it("multiplies quantity by unit price", () => {
    expect(lineTotal(createQuoteLine({ quantity: "2", unitPrice: "10.50" }))).toBe(21);
  });

  it("sums complete lines and ignores invalid ones as zero", () => {
    const total = sumQuoteLines([
      createQuoteLine({ quantity: "2", unitPrice: "5" }),
      createQuoteLine({ quantity: "abc", unitPrice: "9" }),
      createQuoteLine({ quantity: "1", unitPrice: "3.25" }),
    ]);
    expect(total).toBe(13.25);
  });
});

describe("quote validation", () => {
  it("requires Other branch text when Other is selected", () => {
    const draft = createEmptyQuote("quote", DEMO_CONFIG);
    draft.branch = "Other";
    draft.otherBranch = "";
    expect(validateTypeStep(draft, DEMO_CONFIG).otherBranch).toBeTruthy();
    draft.otherBranch = "Custom Branch";
    expect(validateTypeStep(draft, DEMO_CONFIG)).toEqual({});
  });

  it("requires company fields", () => {
    const draft = createEmptyQuote("quote", DEMO_CONFIG);
    const errors = validateCompanyStep(draft);
    expect(errors.companyName).toBeTruthy();
    expect(errors.companyAddress).toBeTruthy();
    expect(errors.companyEmail).toBeTruthy();
  });

  it("requires at least one complete line", () => {
    const draft = createEmptyQuote("quote", DEMO_CONFIG);
    expect(validateLinesStep(draft).lines).toBeTruthy();
    draft.lines = [
      createQuoteLine({ description: "Catering", quantity: "1", unitPrice: "100" }),
    ];
    expect(validateLinesStep(draft)).toEqual({});
  });

  it("allows empty invoice bank details but validates partial ones", () => {
    const draft = createEmptyQuote("invoice", DEMO_CONFIG);
    expect(validateOptionalBank(draft)).toEqual({});
    draft.accountName = "Smoke Test Supplies Ltd";
    expect(validateOptionalBank(draft).sortCode).toBeTruthy();
    draft.sortCode = "12-34-56";
    draft.accountNumber = "12345678";
    expect(validateOptionalBank(draft)).toEqual({});
  });
});

describe("quote helpers", () => {
  it("creates drafts for the requested document kind", () => {
    expect(createEmptyQuote("quote", DEMO_CONFIG).kind).toBe("quote");
    expect(createEmptyQuote("invoice", DEMO_CONFIG).kind).toBe("invoice");
  });

  it("resolves Other branch text", () => {
    const draft = createEmptyQuote("quote", DEMO_CONFIG);
    draft.branch = "Other";
    draft.otherBranch = "Isle of Man";
    expect(resolvedBranch(draft, DEMO_CONFIG)).toBe("Isle of Man");
  });

  it("builds invoice and quote filenames from config prefix", () => {
    const draft = createEmptyQuote("invoice", DEMO_CONFIG);
    draft.companyName = "Ada Supplies";
    draft.documentDate = "2026-09-30";
    expect(quoteFileName(draft, DEMO_CONFIG)).toBe(
      "Acme-Invoice-Ada-Supplies-2026-09-30.pdf",
    );
    draft.kind = "quote";
    expect(quoteFileName(draft, DEMO_CONFIG)).toBe(
      "Acme-Quote-Ada-Supplies-2026-09-30.pdf",
    );
  });
});
