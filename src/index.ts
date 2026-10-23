export type { QuoteInvoiceConfig } from "./config.js";
export {
  DEFAULT_ACCENT_RGB,
  DEFAULT_INVOICE_NOTE,
  DEFAULT_OTHER_BRANCH,
  DEFAULT_QUOTE_NOTE,
  accentRgb,
  allBranchOptions,
  branchLabel,
  fileNamePrefix,
  invoiceNote,
  isKnownBranchOption,
  otherBranchValue,
  quoteNote,
} from "./config.js";

export {
  formatAccountNumberInput,
  formatPounds,
  formatSortCodeInput,
  formatUkDate,
  parseAmount,
} from "./money.js";

export type {
  DocumentKind,
  QuoteDraft,
  QuoteLine,
  QuoteStep,
  StepErrors,
} from "./types.js";
export {
  coerceQuoteBranchFields,
  createEmptyQuote,
  createQuoteLine,
  documentKindLabel,
  documentTitle,
  formatLineTotal,
  hasSupplierBankDetails,
  lineTotal,
  quoteFileName,
  resolvedBranch,
  sumQuoteLines,
  validateCompanyStep,
  validateLinesStep,
  validateOptionalBank,
  validateReviewStep,
  validateTypeStep,
} from "./types.js";

export { generateQuotePdf } from "./generate-quote-pdf.js";
