import {
  allBranchOptions,
  otherBranchValue,
  type QuoteInvoiceConfig,
} from "../../config.js";
import {
  documentKindLabel,
  type QuoteDraft,
  type StepErrors,
} from "../../types.js";
import { Input } from "../ui/Input.js";
import { Label } from "../ui/Label.js";

type Props = {
  draft: QuoteDraft;
  errors: StepErrors;
  config: QuoteInvoiceConfig;
  branchFieldLabel: string;
  onChange: (patch: Partial<QuoteDraft>) => void;
};

export function TypeStep({
  draft,
  errors,
  config,
  branchFieldLabel,
  onChange,
}: Props) {
  const kindLabel = documentKindLabel(draft.kind).toLowerCase();
  const other = otherBranchValue(config);
  const options = allBranchOptions(config);

  return (
    <div className="qip-stack">
      <div>
        <h2 className="qip-heading" style={{ fontSize: "1.5rem", color: "var(--qip-fg)" }}>
          Branch &amp; date
        </h2>
        <p className="qip-muted">
          Choose the {branchFieldLabel.toLowerCase()} this {kindLabel} is for.
        </p>
      </div>

      <div className="qip-field">
        <Label htmlFor="qip-branch">{branchFieldLabel}</Label>
        <select
          id="qip-branch"
          className="qip-select"
          value={draft.branch}
          onChange={(e) => onChange({ branch: e.target.value })}
          aria-invalid={Boolean(errors.branch)}
        >
          {options.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
        {errors.branch ? <p className="qip-error">{errors.branch}</p> : null}
      </div>

      {draft.branch === other ? (
        <div className="qip-field">
          <Label htmlFor="qip-otherBranch">Branch name</Label>
          <Input
            id="qip-otherBranch"
            value={draft.otherBranch}
            onChange={(e) => onChange({ otherBranch: e.target.value })}
            placeholder="Enter branch name"
            aria-invalid={Boolean(errors.otherBranch)}
          />
          {errors.otherBranch ? (
            <p className="qip-error">{errors.otherBranch}</p>
          ) : null}
        </div>
      ) : null}

      <div className="qip-field">
        <Label htmlFor="qip-documentDate">Document date</Label>
        <Input
          id="qip-documentDate"
          type="date"
          value={draft.documentDate}
          onChange={(e) => onChange({ documentDate: e.target.value })}
          aria-invalid={Boolean(errors.documentDate)}
        />
        {errors.documentDate ? (
          <p className="qip-error">{errors.documentDate}</p>
        ) : null}
      </div>

      <div className="qip-field">
        <Label htmlFor="qip-documentNumber">
          Document number <span className="qip-hint">(optional)</span>
        </Label>
        <Input
          id="qip-documentNumber"
          value={draft.documentNumber}
          onChange={(e) => onChange({ documentNumber: e.target.value })}
          placeholder={`Your ${kindLabel} number`}
        />
      </div>
    </div>
  );
}
