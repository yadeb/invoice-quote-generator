import type { QuoteDraft, StepErrors } from "../../types.js";
import { Input } from "../ui/Input.js";
import { Label } from "../ui/Label.js";

type Props = {
  draft: QuoteDraft;
  errors: StepErrors;
  onChange: (patch: Partial<QuoteDraft>) => void;
};

export function CompanyStep({ draft, errors, onChange }: Props) {
  return (
    <div className="qip-stack">
      <div>
        <h2 className="qip-heading" style={{ fontSize: "1.5rem", color: "var(--qip-fg)" }}>
          Your company
        </h2>
        <p className="qip-muted">These details appear as the letterhead on the PDF.</p>
      </div>

      <div className="qip-field">
        <Label htmlFor="qip-companyName">Company name</Label>
        <Input
          id="qip-companyName"
          value={draft.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
          aria-invalid={Boolean(errors.companyName)}
        />
        {errors.companyName ? <p className="qip-error">{errors.companyName}</p> : null}
      </div>

      <div className="qip-field">
        <Label htmlFor="qip-companyAddress">Address</Label>
        <textarea
          id="qip-companyAddress"
          className="qip-textarea"
          value={draft.companyAddress}
          onChange={(e) => onChange({ companyAddress: e.target.value })}
          aria-invalid={Boolean(errors.companyAddress)}
        />
        {errors.companyAddress ? (
          <p className="qip-error">{errors.companyAddress}</p>
        ) : null}
      </div>

      <div className="qip-field">
        <Label htmlFor="qip-companyEmail">Email</Label>
        <Input
          id="qip-companyEmail"
          type="email"
          autoComplete="email"
          value={draft.companyEmail}
          onChange={(e) => onChange({ companyEmail: e.target.value })}
          aria-invalid={Boolean(errors.companyEmail)}
        />
        {errors.companyEmail ? <p className="qip-error">{errors.companyEmail}</p> : null}
      </div>

      <div className="qip-field">
        <Label htmlFor="qip-companyPhone">
          Phone <span className="qip-hint">(optional)</span>
        </Label>
        <Input
          id="qip-companyPhone"
          type="tel"
          autoComplete="tel"
          value={draft.companyPhone}
          onChange={(e) => onChange({ companyPhone: e.target.value })}
        />
      </div>
    </div>
  );
}
