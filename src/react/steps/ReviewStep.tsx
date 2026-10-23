import type { ReactNode } from "react";
import type { QuoteInvoiceConfig } from "../../config.js";
import {
  formatAccountNumberInput,
  formatPounds,
  formatSortCodeInput,
  formatUkDate,
} from "../../money.js";
import {
  documentKindLabel,
  formatLineTotal,
  resolvedBranch,
  sumQuoteLines,
  type QuoteDraft,
  type StepErrors,
} from "../../types.js";
import type { RememberBankSlotProps } from "../wizard-types.js";
import { Input } from "../ui/Input.js";
import { Label } from "../ui/Label.js";

type Props = {
  draft: QuoteDraft;
  errors: StepErrors;
  config: QuoteInvoiceConfig;
  reviewBlurb: string;
  onChange: (patch: Partial<QuoteDraft>) => void;
  rememberBankSlot?: (props: RememberBankSlotProps) => ReactNode;
};

export function ReviewStep({
  draft,
  errors,
  config,
  reviewBlurb,
  onChange,
  rememberBankSlot,
}: Props) {
  const total = sumQuoteLines(draft.lines);
  const kindLabel = documentKindLabel(draft.kind);

  return (
    <div className="qip-stack">
      <div>
        <h2 className="qip-heading" style={{ fontSize: "1.5rem", color: "var(--qip-fg)" }}>
          Review &amp; share
        </h2>
        <p className="qip-muted">{reviewBlurb}</p>
      </div>

      <section className="qip-card" style={{ fontSize: "0.875rem" }}>
        <h3 style={{ margin: 0, fontWeight: 600, color: "var(--qip-primary)" }}>
          {kindLabel} details
        </h3>
        <dl className="qip-dl">
          <div className="qip-dl-row">
            <dt>Branch</dt>
            <dd>{resolvedBranch(draft, config)}</dd>
          </div>
          <div className="qip-dl-row">
            <dt>Date</dt>
            <dd>{draft.documentDate ? formatUkDate(draft.documentDate) : "—"}</dd>
          </div>
          {draft.documentNumber.trim() ? (
            <div className="qip-dl-row">
              <dt>Document no.</dt>
              <dd>{draft.documentNumber}</dd>
            </div>
          ) : null}
          <div className="qip-dl-row">
            <dt>Company</dt>
            <dd>{draft.companyName}</dd>
          </div>
        </dl>
      </section>

      <section className="qip-card">
        <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "var(--qip-primary)" }}>
          Lines
        </h3>
        <ul className="qip-review-lines">
          {draft.lines
            .filter((line) => line.description.trim())
            .map((line, index) => (
              <li key={line.id}>
                <div style={{ display: "flex", gap: "0.75rem", minWidth: 0 }}>
                  <span style={{ color: "var(--qip-muted)", fontWeight: 500 }}>{index + 1}.</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 500 }}>{line.description}</p>
                    <p style={{ margin: 0, color: "var(--qip-muted)" }}>
                      {line.quantity} × {line.unitPrice}
                    </p>
                  </div>
                </div>
                <p style={{ margin: 0, fontWeight: 500, flexShrink: 0 }}>{formatLineTotal(line)}</p>
              </li>
            ))}
        </ul>
        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid color-mix(in srgb, var(--qip-border) 70%, transparent)",
            paddingTop: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <span>Total</span>
          <span>{formatPounds(total)}</span>
        </div>
      </section>

      {draft.kind === "quote" ? (
        <div className="qip-field">
          <Label htmlFor="qip-validUntil">
            Valid until <span className="qip-hint">(optional)</span>
          </Label>
          <Input
            id="qip-validUntil"
            type="date"
            value={draft.validUntil}
            onChange={(e) => onChange({ validUntil: e.target.value })}
          />
        </div>
      ) : (
        <>
          <div className="qip-field">
            <Label htmlFor="qip-dueDate">
              Due date <span className="qip-hint">(optional)</span>
            </Label>
            <Input
              id="qip-dueDate"
              type="date"
              value={draft.dueDate}
              onChange={(e) => onChange({ dueDate: e.target.value })}
            />
          </div>
          <div className="qip-field">
            <Label htmlFor="qip-paymentTerms">
              Payment terms <span className="qip-hint">(optional)</span>
            </Label>
            <textarea
              id="qip-paymentTerms"
              className="qip-textarea"
              style={{ minHeight: "5rem" }}
              value={draft.paymentTerms}
              onChange={(e) => onChange({ paymentTerms: e.target.value })}
              placeholder="e.g. Payment within 14 days of invoice"
            />
          </div>

          <section className="qip-card qip-stack" style={{ gap: "0.75rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "var(--qip-primary)" }}>
                Bank details for payment
              </h3>
              <p className="qip-muted" style={{ fontSize: "0.75rem" }}>
                Optional. Added to the invoice payment by bank transfer (BAC).
              </p>
            </div>
            <div className="qip-field">
              <Label htmlFor="qip-accountName">Account name</Label>
              <Input
                id="qip-accountName"
                value={draft.accountName}
                onChange={(e) => onChange({ accountName: e.target.value })}
                placeholder="Name as it appears on the account"
                aria-invalid={Boolean(errors.accountName)}
              />
              {errors.accountName ? (
                <p className="qip-error">{errors.accountName}</p>
              ) : null}
            </div>
            <div className="qip-field">
              <Label htmlFor="qip-sortCode">Sort code</Label>
              <Input
                id="qip-sortCode"
                inputMode="numeric"
                value={draft.sortCode}
                onChange={(e) =>
                  onChange({ sortCode: formatSortCodeInput(e.target.value) })
                }
                placeholder="12-34-56"
                aria-invalid={Boolean(errors.sortCode)}
              />
              {errors.sortCode ? <p className="qip-error">{errors.sortCode}</p> : null}
            </div>
            <div className="qip-field">
              <Label htmlFor="qip-accountNumber">Account number</Label>
              <Input
                id="qip-accountNumber"
                inputMode="numeric"
                value={draft.accountNumber}
                onChange={(e) =>
                  onChange({
                    accountNumber: formatAccountNumberInput(e.target.value),
                  })
                }
                placeholder="12345678"
                aria-invalid={Boolean(errors.accountNumber)}
              />
              {errors.accountNumber ? (
                <p className="qip-error">{errors.accountNumber}</p>
              ) : null}
            </div>
            {rememberBankSlot
              ? rememberBankSlot({
                  checked: draft.rememberBank,
                  onCheckedChange: (checked) => onChange({ rememberBank: checked }),
                  onClearSaved: () =>
                    onChange({
                      rememberBank: false,
                      accountName: "",
                      sortCode: "",
                      accountNumber: "",
                    }),
                })
              : null}
          </section>
        </>
      )}

      {Object.keys(errors).length > 0 ? (
        <p className="qip-error">
          Some details still need fixing before you can generate the PDF.
        </p>
      ) : null}
    </div>
  );
}
