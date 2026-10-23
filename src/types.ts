import {
  QuoteInvoiceConfig,
  fileNamePrefix,
  isKnownBranchOption,
  otherBranchValue,
} from "./config.js";
import { formatPounds, parseAmount } from "./money.js";

export type DocumentKind = "quote" | "invoice";

export type QuoteLine = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

export type QuoteStep =
  | "start"
  | "type"
  | "company"
  | "lines"
  | "review"
  | "done";

export type QuoteDraft = {
  kind: DocumentKind;
  branch: string;
  otherBranch: string;
  documentNumber: string;
  documentDate: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  lines: QuoteLine[];
  validUntil: string;
  dueDate: string;
  paymentTerms: string;
  accountName: string;
  sortCode: string;
  accountNumber: string;
  /** Opt-in: host may persist bank details on this device. */
  rememberBank: boolean;
  currentStep: QuoteStep;
};

export type StepErrors = Record<string, string>;

export function createQuoteLine(partial?: Partial<QuoteLine>): QuoteLine {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `ql-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description: "",
    quantity: "1",
    unitPrice: "",
    ...partial,
  };
}

export function documentKindLabel(kind: DocumentKind): string {
  return kind === "invoice" ? "Invoice" : "Quote";
}

export function createEmptyQuote(
  kind: DocumentKind,
  config: Pick<QuoteInvoiceConfig, "defaultBranch">,
): QuoteDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    kind,
    branch: config.defaultBranch,
    otherBranch: "",
    documentNumber: "",
    documentDate: today,
    companyName: "",
    companyAddress: "",
    companyEmail: "",
    companyPhone: "",
    lines: [createQuoteLine()],
    validUntil: "",
    dueDate: "",
    paymentTerms: "",
    accountName: "",
    sortCode: "",
    accountNumber: "",
    rememberBank: false,
    currentStep: "start",
  };
}

export function resolvedBranch(
  draft: QuoteDraft,
  config: QuoteInvoiceConfig,
): string {
  if (draft.branch === otherBranchValue(config)) {
    return draft.otherBranch.trim();
  }
  return draft.branch.trim();
}

/** Normalize a loaded draft so branch is a known select option. */
export function coerceQuoteBranchFields(
  draft: QuoteDraft,
  config: QuoteInvoiceConfig,
): QuoteDraft {
  const normalized = draft.branch.trim();
  const other = otherBranchValue(config);
  if (!normalized) {
    return { ...draft, branch: config.defaultBranch, otherBranch: "" };
  }
  if (normalized === other) {
    return {
      ...draft,
      branch: other,
      otherBranch: draft.otherBranch.trim(),
    };
  }
  if (isKnownBranchOption(normalized, config)) {
    return { ...draft, branch: normalized, otherBranch: draft.otherBranch ?? "" };
  }
  return {
    ...draft,
    branch: other,
    otherBranch: draft.otherBranch.trim() || normalized,
  };
}

export function lineTotal(line: QuoteLine): number {
  const qty = parseAmount(line.quantity);
  const price = parseAmount(line.unitPrice);
  if (!Number.isFinite(qty) || !Number.isFinite(price)) return NaN;
  return qty * price;
}

export function sumQuoteLines(lines: QuoteLine[]): number {
  return lines.reduce((total, line) => {
    const n = lineTotal(line);
    return total + (Number.isFinite(n) ? n : 0);
  }, 0);
}

export function formatLineTotal(line: QuoteLine): string {
  const n = lineTotal(line);
  return Number.isFinite(n) ? formatPounds(n) : "—";
}

export function validateTypeStep(
  draft: QuoteDraft,
  config: QuoteInvoiceConfig,
): StepErrors {
  const errors: StepErrors = {};
  const other = otherBranchValue(config);
  if (!draft.kind) errors.kind = "Document type is missing.";
  if (!draft.branch.trim()) errors.branch = "Choose a branch.";
  if (draft.branch === other && !draft.otherBranch.trim()) {
    errors.otherBranch = "Enter the branch name.";
  }
  if (!draft.documentDate) errors.documentDate = "Enter the document date.";
  return errors;
}

export function validateCompanyStep(draft: QuoteDraft): StepErrors {
  const errors: StepErrors = {};
  if (!draft.companyName.trim()) errors.companyName = "Enter your company name.";
  if (!draft.companyAddress.trim()) errors.companyAddress = "Enter your company address.";
  if (!draft.companyEmail.trim()) {
    errors.companyEmail = "Enter a contact email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.companyEmail.trim())) {
    errors.companyEmail = "Enter a valid email address.";
  }
  return errors;
}

export function validateLinesStep(draft: QuoteDraft): StepErrors {
  const errors: StepErrors = {};
  if (!draft.lines.length) {
    errors.lines = "Add at least one line item.";
    return errors;
  }

  let complete = 0;
  draft.lines.forEach((line, index) => {
    const prefix = `line-${index}`;
    const hasAny =
      line.description.trim() ||
      line.unitPrice.trim() ||
      (line.quantity.trim() && line.quantity.trim() !== "1");

    if (!line.description.trim()) {
      if (hasAny || draft.lines.length === 1) {
        errors[`${prefix}-description`] = "Enter a description.";
      }
    }
    const qty = parseAmount(line.quantity);
    if (!line.quantity.trim() || !Number.isFinite(qty) || qty <= 0) {
      if (hasAny || draft.lines.length === 1) {
        errors[`${prefix}-quantity`] = "Enter a quantity greater than zero.";
      }
    }
    const price = parseAmount(line.unitPrice);
    if (!line.unitPrice.trim() || !Number.isFinite(price) || price < 0) {
      if (hasAny || draft.lines.length === 1) {
        errors[`${prefix}-unitPrice`] = "Enter a valid unit price.";
      }
    }
    if (
      line.description.trim() &&
      Number.isFinite(qty) &&
      qty > 0 &&
      Number.isFinite(price) &&
      price >= 0
    ) {
      complete += 1;
    }
  });

  if (complete < 1) {
    errors.lines = "Add at least one complete line (description, quantity, unit price).";
  }
  return errors;
}

/** Optional bank block: empty is fine; if any field is set, require all three with UK formats. */
export function validateOptionalBank(draft: QuoteDraft): StepErrors {
  const errors: StepErrors = {};
  if (draft.kind !== "invoice") return errors;

  const name = draft.accountName.trim();
  const sortDigits = draft.sortCode.replace(/\D/g, "");
  const accountDigits = draft.accountNumber.replace(/\D/g, "");
  const anyFilled = Boolean(name || sortDigits || accountDigits);
  if (!anyFilled) return errors;

  if (!name) errors.accountName = "Enter the account name.";
  if (sortDigits.length !== 6) {
    errors.sortCode = "Enter a 6-digit sort code (e.g. 12-34-56).";
  }
  if (accountDigits.length < 6 || accountDigits.length > 8) {
    errors.accountNumber = "Enter an account number (6–8 digits).";
  }
  return errors;
}

export function hasSupplierBankDetails(draft: QuoteDraft): boolean {
  return Boolean(
    draft.accountName.trim() &&
      draft.sortCode.replace(/\D/g, "").length === 6 &&
      draft.accountNumber.replace(/\D/g, "").length >= 6,
  );
}

export function validateReviewStep(
  draft: QuoteDraft,
  config: QuoteInvoiceConfig,
): StepErrors {
  return {
    ...validateTypeStep(draft, config),
    ...validateCompanyStep(draft),
    ...validateLinesStep(draft),
    ...validateOptionalBank(draft),
  };
}

export function quoteFileName(
  draft: QuoteDraft,
  config: QuoteInvoiceConfig,
): string {
  const kindLabel = documentKindLabel(draft.kind);
  const company =
    draft.companyName
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 40) || "Supplier";
  const date = draft.documentDate || new Date().toISOString().slice(0, 10);
  const prefix = fileNamePrefix(config);
  return `${prefix}-${kindLabel}-${company}-${date}.pdf`;
}

export function documentTitle(kind: DocumentKind): string {
  return kind === "invoice" ? "INVOICE" : "QUOTATION";
}
