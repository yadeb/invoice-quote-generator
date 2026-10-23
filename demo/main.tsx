import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  coerceQuoteBranchFields,
  createEmptyQuote,
  type DocumentKind,
  type QuoteDraft,
} from "../src/index.ts";
import { DEMO_CONFIG } from "../src/demo-config.ts";
import { QuoteInvoiceWizard } from "../src/react/index.ts";
import "../src/react/styles.css";

const QUOTE_KEY = "demo-quote-draft-v1";
const INVOICE_KEY = "demo-invoice-draft-v1";

function storageKey(kind: DocumentKind): string {
  return kind === "invoice" ? INVOICE_KEY : QUOTE_KEY;
}

function parseDraft(raw: string | null, kind: DocumentKind): QuoteDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as QuoteDraft;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.kind && parsed.kind !== kind) return null;
    const empty = createEmptyQuote(kind, DEMO_CONFIG);
    return coerceQuoteBranchFields(
      {
        ...empty,
        ...parsed,
        kind,
        lines:
          Array.isArray(parsed.lines) && parsed.lines.length > 0
            ? parsed.lines
            : empty.lines,
      },
      DEMO_CONFIG,
    );
  } catch {
    return null;
  }
}

const demoStorage = {
  load(kind: DocumentKind) {
    return parseDraft(localStorage.getItem(storageKey(kind)), kind);
  },
  save(draft: QuoteDraft) {
    localStorage.setItem(storageKey(draft.kind), JSON.stringify(draft));
  },
  clear(kind: DocumentKind) {
    localStorage.removeItem(storageKey(kind));
  },
  hasDraft(kind: DocumentKind) {
    return parseDraft(localStorage.getItem(storageKey(kind)), kind) !== null;
  },
};

async function downloadShare(
  file: File,
): Promise<"shared" | "downloaded" | "cancelled" | "error"> {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return "downloaded";
}

function DemoApp() {
  const [kind, setKind] = useState<DocumentKind>("invoice");
  const copy = useMemo(
    () => ({
      branchFieldLabel: "Branch",
      startBlurb: `Create a branded PDF ${kind === "invoice" ? "invoice" : "quotation"} for an Acme branch, then download it.`,
      reviewBlurb: "Check the details, then generate the PDF.",
      doneSharedHint: "PDF shared successfully.",
      doneDownloadedHint: "The PDF downloaded to this device.",
      shareTitle: kind === "invoice" ? "Acme invoice" : "Acme quotation",
      shareText:
        kind === "invoice"
          ? "Acme invoice PDF — please find attached."
          : "Acme quotation PDF — please find attached.",
    }),
    [kind],
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fa" }}>
      <div style={{ display: "flex", gap: "0.5rem", padding: "1rem", justifyContent: "center" }}>
        <button type="button" onClick={() => setKind("quote")} disabled={kind === "quote"}>
          Quote
        </button>
        <button type="button" onClick={() => setKind("invoice")} disabled={kind === "invoice"}>
          Invoice
        </button>
      </div>
      <QuoteInvoiceWizard
        key={kind}
        kind={kind}
        config={DEMO_CONFIG}
        branding={{
          productName: "Demo Quotes",
          logo: (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "var(--qip-primary)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              A
            </div>
          ),
        }}
        copy={copy}
        storage={demoStorage}
        onShare={downloadShare}
        homeLink={
          <a className="qip-link" href="#" onClick={(e) => e.preventDefault()}>
            Demo home
          </a>
        }
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
);
