import { formatPounds } from "../../money.js";
import {
  createQuoteLine,
  formatLineTotal,
  sumQuoteLines,
  type QuoteDraft,
  type StepErrors,
} from "../../types.js";
import { Button } from "../ui/Button.js";
import { Input } from "../ui/Input.js";
import { Label } from "../ui/Label.js";

type Props = {
  draft: QuoteDraft;
  errors: StepErrors;
  onChange: (patch: Partial<QuoteDraft>) => void;
};

export function LinesStep({ draft, errors, onChange }: Props) {
  const total = sumQuoteLines(draft.lines);

  function updateLine(id: string, patch: Partial<(typeof draft.lines)[number]>) {
    onChange({
      lines: draft.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    });
  }

  function removeLine(id: string) {
    if (draft.lines.length === 1) {
      onChange({ lines: [createQuoteLine()] });
      return;
    }
    onChange({ lines: draft.lines.filter((line) => line.id !== id) });
  }

  return (
    <div className="qip-stack">
      <div>
        <h2 className="qip-heading" style={{ fontSize: "1.5rem", color: "var(--qip-fg)" }}>
          Line items
        </h2>
        <p className="qip-muted">
          Add each item with quantity and unit price. Totals exclude VAT.
        </p>
      </div>

      {errors.lines ? <p className="qip-error">{errors.lines}</p> : null}

      <ul className="qip-line-list">
        {draft.lines.map((line, index) => {
          const descError = errors[`line-${index}-description`];
          const qtyError = errors[`line-${index}-quantity`];
          const priceError = errors[`line-${index}-unitPrice`];
          return (
            <li key={line.id} className="qip-card">
              <div className="qip-line-head">
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "var(--qip-primary)" }}>
                  Item {index + 1}
                </p>
                <Button
                  variant="ghost"
                  onClick={() => removeLine(line.id)}
                  aria-label={`Remove item ${index + 1}`}
                >
                  ✕
                </Button>
              </div>

              <div className="qip-stack" style={{ gap: "0.75rem" }}>
                <div className="qip-field">
                  <Label htmlFor={`qip-desc-${line.id}`}>Description</Label>
                  <Input
                    id={`qip-desc-${line.id}`}
                    value={line.description}
                    onChange={(e) => updateLine(line.id, { description: e.target.value })}
                    aria-invalid={Boolean(descError)}
                  />
                  {descError ? <p className="qip-error">{descError}</p> : null}
                </div>

                <div className="qip-grid-2">
                  <div className="qip-field">
                    <Label htmlFor={`qip-qty-${line.id}`}>Quantity</Label>
                    <Input
                      id={`qip-qty-${line.id}`}
                      inputMode="decimal"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, { quantity: e.target.value })}
                      aria-invalid={Boolean(qtyError)}
                    />
                    {qtyError ? <p className="qip-error">{qtyError}</p> : null}
                  </div>
                  <div className="qip-field">
                    <Label htmlFor={`qip-price-${line.id}`}>Unit price (£)</Label>
                    <Input
                      id={`qip-price-${line.id}`}
                      inputMode="decimal"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(line.id, { unitPrice: e.target.value })}
                      aria-invalid={Boolean(priceError)}
                    />
                    {priceError ? <p className="qip-error">{priceError}</p> : null}
                  </div>
                </div>

                <p style={{ margin: 0, textAlign: "right", fontSize: "0.875rem", fontWeight: 500 }}>
                  Line total: {formatLineTotal(line)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <Button
        variant="outline"
        style={{ width: "100%" }}
        onClick={() => onChange({ lines: [...draft.lines, createQuoteLine()] })}
      >
        + Add line
      </Button>

      <div className="qip-total-bar">
        <span>Total</span>
        <span>{formatPounds(total)}</span>
      </div>
    </div>
  );
}
