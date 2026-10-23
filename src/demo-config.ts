import type { QuoteInvoiceConfig } from "./config.js";

/** Neutral sample config for tests and the Vite demo. Not for production hosts. */
export const DEMO_CONFIG: QuoteInvoiceConfig = {
  billTo: {
    legalName: "ACME COMMUNITY TRUST",
    shortName: "Acme",
    charityNumber: "0000000",
    branchLabel: "branch",
  },
  branches: ["North", "South", "East", "West"],
  defaultBranch: "North",
  otherBranchValue: "Other",
  fileNamePrefix: "Acme",
  theme: { accentRgb: [30, 100, 140] },
  notes: {
    quote: "This quotation is provided for Acme consideration. Prices exclude VAT.",
    invoice:
      "Please send payment according to the terms above. Thank you for your business.",
  },
};
