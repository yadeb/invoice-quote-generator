import type { ReactNode } from "react";
import type { DocumentKind } from "../../types.js";
import { Button } from "../ui/Button.js";

type Props = {
  kind: DocumentKind;
  mode: "shared" | "downloaded";
  fileName: string;
  doneSharedHint: string;
  doneDownloadedHint: string;
  homeLink?: ReactNode;
  onShareAgain: () => void;
  onNewDocument: () => void;
};

export function DoneStep({
  kind,
  mode,
  fileName,
  doneSharedHint,
  doneDownloadedHint,
  homeLink,
  onShareAgain,
  onNewDocument,
}: Props) {
  const noun = kind === "invoice" ? "invoice" : "quote";
  return (
    <div className="qip-center">
      <svg
        className="qip-check-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <h2 className="qip-heading" style={{ fontSize: "1.5rem", color: "var(--qip-fg)" }}>
        Your PDF is ready
      </h2>
      <p className="qip-muted" style={{ maxWidth: "24rem" }}>
        {mode === "shared" ? doneSharedHint : doneDownloadedHint}
      </p>
      <p className="qip-filename">{fileName}</p>
      <div className="qip-cta-col">
        <Button style={{ width: "100%" }} onClick={onShareAgain}>
          {mode === "shared" ? "Share again" : "Try share again"}
        </Button>
        <Button variant="outline" style={{ width: "100%" }} onClick={onNewDocument}>
          Start another {noun}
        </Button>
        {homeLink}
      </div>
    </div>
  );
}
