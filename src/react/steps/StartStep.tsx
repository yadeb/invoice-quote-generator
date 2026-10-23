import type { ReactNode } from "react";
import { documentKindLabel, type DocumentKind } from "../../types.js";
import { Button } from "../ui/Button.js";

type Props = {
  kind: DocumentKind;
  hasDraft: boolean;
  startBlurb: string;
  logo?: ReactNode;
  homeLink?: ReactNode;
  onStart: () => void;
  onResume: () => void;
};

export function StartStep({
  kind,
  hasDraft,
  startBlurb,
  logo,
  homeLink,
  onStart,
  onResume,
}: Props) {
  const kindLabel = documentKindLabel(kind);
  const noun = kind === "invoice" ? "invoice" : "quotation";

  return (
    <div className="qip-center">
      {logo ? (
        <div className="qip-logo-wrap">
          <div className="qip-logo-glow" aria-hidden />
          {logo}
        </div>
      ) : null}

      <p className="qip-title-lg">{kindLabel}</p>
      <h1 className="qip-blurb">{startBlurb}</h1>

      <div className="qip-cta-col">
        <Button className="qip-btn" style={{ width: "100%" }} onClick={onStart}>
          Start new {noun}
        </Button>
        {hasDraft ? (
          <Button variant="outline" style={{ width: "100%" }} onClick={onResume}>
            Resume saved draft
          </Button>
        ) : null}
        {homeLink}
      </div>
    </div>
  );
}
