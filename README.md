# quote-invoice-pdf

Config-driven **quote / invoice PDF** generator and optional **React wizard**. Hosts supply organisation branding, branch lists, storage, and share behaviour — this package has no organisation-specific defaults.

## Install

```bash
npm install quote-invoice-pdf
```

Peer dependencies: `react`, `react-dom` (for the wizard).

## Core API

```ts
import {
  createEmptyQuote,
  generateQuotePdf,
  type QuoteInvoiceConfig,
} from "quote-invoice-pdf";

const config: QuoteInvoiceConfig = {
  billTo: {
    legalName: "ACME COMMUNITY TRUST",
    shortName: "Acme",
    charityNumber: "0000000",
  },
  branches: ["North", "South"],
  defaultBranch: "North",
};

const draft = createEmptyQuote("invoice", config);
draft.companyName = "Supplier Ltd";
// …fill fields…
const file = await generateQuotePdf(draft, config);
```

## React wizard

```tsx
import { QuoteInvoiceWizard } from "quote-invoice-pdf/react";
import "quote-invoice-pdf/react/styles.css";

<QuoteInvoiceWizard
  kind="invoice"
  config={config}
  branding={{ productName: "My App", logo: <img src="/logo.png" alt="" /> }}
  copy={{ /* branch labels, blurbs, share text */ }}
  storage={{ load, save, clear, hasDraft }}
  onShare={async (file, { title, text }) => "downloaded"}
/>;
```

## Demo

```bash
npm install
npm run demo
```

Opens a Vite app with a fictional **Acme** org and `demo-*` localStorage keys.

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Unit tests |
| `npm run build` | Emit `dist/` for publish |
| `npm run demo` | Standalone wizard |
