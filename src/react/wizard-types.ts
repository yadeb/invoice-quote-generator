import type { ReactNode } from "react";
import type { QuoteInvoiceConfig } from "../config.js";
import type { DocumentKind, QuoteDraft } from "../types.js";

export type QuoteInvoiceCopy = {
  branchFieldLabel: string;
  startBlurb: string;
  reviewBlurb: string;
  doneSharedHint: string;
  doneDownloadedHint: string;
  shareTitle: string;
  shareText: string;
};

export type QuoteInvoiceBranding = {
  /** Compact mark for the in-flow header. */
  logo?: ReactNode;
  /** Optional larger mark on the start screen; falls back to `logo`. */
  startLogo?: ReactNode;
  productName: string;
};

export type QuoteInvoiceStorage = {
  load: (kind: DocumentKind) => QuoteDraft | null;
  save: (draft: QuoteDraft) => void;
  clear: (kind: DocumentKind) => void;
  hasDraft: (kind: DocumentKind) => boolean;
};

export type QuoteInvoicePrefs = {
  hydrate?: (draft: QuoteDraft) => QuoteDraft | Promise<QuoteDraft>;
  persist?: (draft: QuoteDraft) => void | Promise<void>;
};

export type RememberBankSlotProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onClearSaved: () => void;
};

export type QuoteInvoiceWizardProps = {
  kind: DocumentKind;
  config: QuoteInvoiceConfig;
  branding: QuoteInvoiceBranding;
  copy: QuoteInvoiceCopy;
  storage: QuoteInvoiceStorage;
  prefs?: QuoteInvoicePrefs;
  onShare: (
    file: File,
    meta: { title: string; text: string },
  ) => Promise<"shared" | "downloaded" | "cancelled" | "error">;
  rememberBankSlot?: (props: RememberBankSlotProps) => ReactNode;
  homeLink?: ReactNode;
};
