import { useEffect, useMemo, useState } from "react";
import { accentRgb } from "../config.js";
import { generateQuotePdf } from "../generate-quote-pdf.js";
import {
  createEmptyQuote,
  documentKindLabel,
  validateCompanyStep,
  validateLinesStep,
  validateReviewStep,
  validateTypeStep,
  type QuoteDraft,
  type QuoteStep,
  type StepErrors,
} from "../types.js";
import { CompanyStep } from "./steps/CompanyStep.js";
import { DoneStep } from "./steps/DoneStep.js";
import { LinesStep } from "./steps/LinesStep.js";
import { ReviewStep } from "./steps/ReviewStep.js";
import { StartStep } from "./steps/StartStep.js";
import { TypeStep } from "./steps/TypeStep.js";
import { Button } from "./ui/Button.js";
import type { QuoteInvoiceWizardProps } from "./wizard-types.js";

const FLOW_STEPS: Exclude<QuoteStep, "start" | "done">[] = [
  "type",
  "company",
  "lines",
  "review",
];

const STEP_LABELS: Record<(typeof FLOW_STEPS)[number], string> = {
  type: "Branch",
  company: "Company",
  lines: "Lines",
  review: "Review",
};

function rgbToCss(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function QuoteInvoiceWizard({
  kind,
  config,
  branding,
  copy,
  storage,
  prefs,
  onShare,
  rememberBankSlot,
  homeLink,
}: QuoteInvoiceWizardProps) {
  const [draft, setDraft] = useState<QuoteDraft>(() =>
    createEmptyQuote(kind, config),
  );
  const [errors, setErrors] = useState<StepErrors>({});
  const [hasDraft, setHasDraft] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [doneMode, setDoneMode] = useState<"shared" | "downloaded">("downloaded");
  const [lastPdf, setLastPdf] = useState<File | null>(null);
  const kindLabel = documentKindLabel(kind);

  useEffect(() => {
    setHasDraft(storage.hasDraft(kind));
    setHydrated(true);
  }, [kind, storage]);

  useEffect(() => {
    if (!hydrated) return;
    if (draft.currentStep === "start") return;
    storage.save({ ...draft, kind });
    void prefs?.persist?.({ ...draft, kind });
    setHasDraft(true);
  }, [draft, hydrated, kind, prefs, storage]);

  const progressIndex = useMemo(() => {
    return FLOW_STEPS.indexOf(draft.currentStep as (typeof FLOW_STEPS)[number]);
  }, [draft.currentStep]);

  function patchDraft(patch: Partial<QuoteDraft>) {
    setDraft((prev) => ({ ...prev, ...patch, kind }));
    setErrors({});
    setActionError(null);
  }

  function startNew() {
    void (async () => {
      storage.clear(kind);
      setHasDraft(false);
      setLastPdf(null);
      setActionError(null);
      setErrors({});
      let next = createEmptyQuote(kind, config);
      if (prefs?.hydrate) {
        next = await prefs.hydrate(next);
      }
      setDraft({ ...next, kind, currentStep: "type" });
    })();
  }

  function resumeDraft() {
    const saved = storage.load(kind);
    if (!saved) {
      startNew();
      return;
    }
    const step =
      saved.currentStep === "start" || saved.currentStep === "done"
        ? "type"
        : saved.currentStep;
    setDraft({ ...saved, kind, currentStep: step });
    setErrors({});
    setActionError(null);
  }

  function goBack() {
    const idx = FLOW_STEPS.indexOf(draft.currentStep as (typeof FLOW_STEPS)[number]);
    if (idx <= 0) {
      setDraft((prev) => ({ ...prev, kind, currentStep: "start" }));
      return;
    }
    setErrors({});
    setDraft((prev) => ({ ...prev, kind, currentStep: FLOW_STEPS[idx - 1] }));
  }

  function goNext() {
    let stepErrors: StepErrors = {};
    if (draft.currentStep === "type") stepErrors = validateTypeStep(draft, config);
    if (draft.currentStep === "company") stepErrors = validateCompanyStep(draft);
    if (draft.currentStep === "lines") stepErrors = validateLinesStep(draft);

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    const idx = FLOW_STEPS.indexOf(draft.currentStep as (typeof FLOW_STEPS)[number]);
    if (idx >= 0 && idx < FLOW_STEPS.length - 1) {
      setDraft((prev) => ({ ...prev, kind, currentStep: FLOW_STEPS[idx + 1] }));
    }
  }

  async function generateAndShare() {
    const stepErrors = validateReviewStep({ ...draft, kind }, config);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setBusy(true);
    setActionError(null);
    try {
      const pdf = await generateQuotePdf({ ...draft, kind }, config);
      setLastPdf(pdf);
      const result = await onShare(pdf, {
        title: copy.shareTitle,
        text: copy.shareText,
      });
      if (result === "cancelled") {
        setActionError("Share cancelled. You can try again when ready.");
        return;
      }
      if (result === "error") {
        setActionError("Could not share or download the PDF.");
        return;
      }
      setDoneMode(result === "shared" ? "shared" : "downloaded");
      setDraft((prev) => ({ ...prev, kind, currentStep: "done" }));
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not generate the PDF.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function shareAgain() {
    if (!lastPdf) {
      await generateAndShare();
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const result = await onShare(lastPdf, {
        title: copy.shareTitle,
        text: copy.shareText,
      });
      if (result === "cancelled") {
        setActionError("Share cancelled. You can try again when ready.");
        return;
      }
      if (result === "error") {
        setActionError("Could not share or download the PDF.");
        return;
      }
      setDoneMode(result === "shared" ? "shared" : "downloaded");
    } finally {
      setBusy(false);
    }
  }

  const showChrome = draft.currentStep !== "start" && draft.currentStep !== "done";
  const primary = rgbToCss(accentRgb(config));

  return (
    <div className="qip-root" style={{ ["--qip-primary" as string]: primary }}>
      {showChrome ? (
        <header className="qip-header">
          {branding.logo}
          <div className="qip-header-text">
            <p className="qip-header-title">{kindLabel}</p>
            <p className="qip-header-sub">
              Step {progressIndex + 1} of {FLOW_STEPS.length}:{" "}
              {STEP_LABELS[draft.currentStep as (typeof FLOW_STEPS)[number]]}
            </p>
          </div>
        </header>
      ) : null}

      {showChrome ? (
        <div
          className="qip-progress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={FLOW_STEPS.length}
          aria-valuenow={progressIndex + 1}
        >
          <div
            className="qip-progress-bar"
            style={{
              width: `${((progressIndex + 1) / FLOW_STEPS.length) * 100}%`,
            }}
          />
        </div>
      ) : null}

      <main className="qip-main">
        {draft.currentStep === "start" ? (
          <StartStep
            kind={kind}
            hasDraft={hydrated && hasDraft}
            startBlurb={copy.startBlurb}
            logo={branding.startLogo ?? branding.logo}
            homeLink={homeLink}
            onStart={startNew}
            onResume={resumeDraft}
          />
        ) : null}
        {draft.currentStep === "type" ? (
          <TypeStep
            draft={draft}
            errors={errors}
            config={config}
            branchFieldLabel={copy.branchFieldLabel}
            onChange={patchDraft}
          />
        ) : null}
        {draft.currentStep === "company" ? (
          <CompanyStep draft={draft} errors={errors} onChange={patchDraft} />
        ) : null}
        {draft.currentStep === "lines" ? (
          <LinesStep draft={draft} errors={errors} onChange={patchDraft} />
        ) : null}
        {draft.currentStep === "review" ? (
          <ReviewStep
            draft={draft}
            errors={errors}
            config={config}
            reviewBlurb={copy.reviewBlurb}
            onChange={patchDraft}
            rememberBankSlot={rememberBankSlot}
          />
        ) : null}
        {draft.currentStep === "done" && lastPdf ? (
          <DoneStep
            kind={kind}
            mode={doneMode}
            fileName={lastPdf.name}
            doneSharedHint={copy.doneSharedHint}
            doneDownloadedHint={copy.doneDownloadedHint}
            homeLink={homeLink}
            onShareAgain={() => void shareAgain()}
            onNewDocument={startNew}
          />
        ) : null}
      </main>

      {actionError ? (
        <p className="qip-alert" role="alert">
          {actionError}
        </p>
      ) : null}

      {showChrome ? (
        <div className="qip-actions">
          <Button variant="outline" onClick={goBack} disabled={busy}>
            Back
          </Button>
          {draft.currentStep === "review" ? (
            <Button onClick={() => void generateAndShare()} disabled={busy}>
              {busy ? "Preparing…" : "Generate & share"}
            </Button>
          ) : (
            <Button onClick={goNext} disabled={busy}>
              Next
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
