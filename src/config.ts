export type QuoteInvoiceConfig = {
  billTo: {
    legalName: string;
    shortName: string;
    charityNumber?: string;
    /** Noun used in PDF bill-to line, e.g. "branch" → "Acme North branch". */
    branchLabel?: string;
  };
  branches: readonly string[];
  defaultBranch: string;
  /** Select value for free-text branch. Default: "Other". */
  otherBranchValue?: string;
  /** Filename prefix. Default: billTo.shortName. */
  fileNamePrefix?: string;
  theme?: {
    accentRgb?: [number, number, number];
  };
  notes?: {
    quote?: string;
    invoice?: string;
  };
};

export const DEFAULT_OTHER_BRANCH = "Other";

export const DEFAULT_ACCENT_RGB: [number, number, number] = [27, 122, 60];

export const DEFAULT_QUOTE_NOTE =
  "This quotation is provided for consideration. Prices exclude VAT.";

export const DEFAULT_INVOICE_NOTE =
  "Please send payment according to the terms above. Thank you for your business.";

export function otherBranchValue(config: QuoteInvoiceConfig): string {
  return config.otherBranchValue ?? DEFAULT_OTHER_BRANCH;
}

export function fileNamePrefix(config: QuoteInvoiceConfig): string {
  return (config.fileNamePrefix ?? config.billTo.shortName).trim() || "Doc";
}

export function branchLabel(config: QuoteInvoiceConfig): string {
  return config.billTo.branchLabel ?? "branch";
}

export function accentRgb(config: QuoteInvoiceConfig): [number, number, number] {
  return config.theme?.accentRgb ?? DEFAULT_ACCENT_RGB;
}

export function quoteNote(config: QuoteInvoiceConfig): string {
  return config.notes?.quote ?? DEFAULT_QUOTE_NOTE;
}

export function invoiceNote(config: QuoteInvoiceConfig): string {
  return config.notes?.invoice ?? DEFAULT_INVOICE_NOTE;
}

export function allBranchOptions(config: QuoteInvoiceConfig): string[] {
  const other = otherBranchValue(config);
  const set = new Set<string>([...config.branches, other]);
  return [...set];
}

export function isKnownBranchOption(
  value: string,
  config: QuoteInvoiceConfig,
): boolean {
  const trimmed = value.trim();
  return allBranchOptions(config).includes(trimmed);
}
