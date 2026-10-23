import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  QuoteInvoiceConfig,
  accentRgb,
  branchLabel,
  invoiceNote,
  quoteNote,
} from "./config.js";
import { formatPounds, formatUkDate, parseAmount } from "./money.js";
import {
  QuoteDraft,
  documentTitle,
  formatLineTotal,
  hasSupplierBankDetails,
  quoteFileName,
  resolvedBranch,
  sumQuoteLines,
} from "./types.js";

const CHARCOAL: [number, number, number] = [44, 44, 44];
const MUTED: [number, number, number] = [90, 90, 90];

export async function generateQuotePdf(
  draft: QuoteDraft,
  config: QuoteInvoiceConfig,
): Promise<File> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 40;
  const title = documentTitle(draft.kind);
  const branch = resolvedBranch(draft, config);
  const total = sumQuoteLines(draft.lines);
  const company = draft.companyName.trim() || "Supplier";
  const green = accentRgb(config);
  const label = branchLabel(config);

  // Supplier letterhead
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...CHARCOAL);
  doc.setFontSize(20);
  const nameLines = doc.splitTextToSize(company, pageWidth - margin * 2);
  doc.text(nameLines, pageWidth / 2, y, { align: "center" });
  y += nameLines.length * 22 + 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const contactLines = [
    draft.companyAddress.trim(),
    draft.companyEmail.trim(),
    draft.companyPhone.trim() ? `Tel: ${draft.companyPhone.trim()}` : "",
  ].filter(Boolean);
  for (const line of contactLines) {
    const wrapped = doc.splitTextToSize(line, pageWidth - margin * 2);
    doc.text(wrapped, pageWidth / 2, y, { align: "center" });
    y += wrapped.length * 12 + 2;
  }

  y += 8;
  doc.setDrawColor(...green);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...CHARCOAL);
  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, y, { align: "center" });
  y += 20;

  const billToLines = [
    config.billTo.legalName,
    `${config.billTo.shortName} ${branch} ${label}`,
  ];
  if (config.billTo.charityNumber) {
    billToLines.push(`Charity No: ${config.billTo.charityNumber}`);
  }

  const metaBody: string[][] = [
    [
      draft.kind === "invoice" ? "Bill to:" : "Quote to:",
      billToLines.join("\n"),
    ],
    ["Document date:", formatUkDate(draft.documentDate)],
  ];
  if (draft.documentNumber.trim()) {
    metaBody.push(["Document no.:", draft.documentNumber.trim()]);
  }
  if (draft.kind === "quote" && draft.validUntil) {
    metaBody.push(["Valid until:", formatUkDate(draft.validUntil)]);
  }
  if (draft.kind === "invoice" && draft.dueDate) {
    metaBody.push(["Due date:", formatUkDate(draft.dueDate)]);
  }
  if (draft.kind === "invoice" && draft.paymentTerms.trim()) {
    metaBody.push(["Payment terms:", draft.paymentTerms.trim()]);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 10, textColor: CHARCOAL, cellPadding: 5 },
    body: metaBody,
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [242, 242, 242], cellWidth: 120 },
      1: { cellWidth: "auto" },
    },
    tableWidth: pageWidth - margin * 2,
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;

  const tableBody = draft.lines
    .filter((line) => line.description.trim())
    .map((line, index) => {
      const price = parseAmount(line.unitPrice);
      return [
        String(index + 1),
        line.description.trim(),
        line.quantity.trim(),
        Number.isFinite(price) ? formatPounds(price) : line.unitPrice,
        formatLineTotal(line),
      ];
    });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["#", "Description", "Qty", "Unit price", "Line total"]],
    body: tableBody,
    foot: [["", "", "", "TOTAL", formatPounds(total)]],
    styles: { fontSize: 9, textColor: CHARCOAL, cellPadding: 5, minCellHeight: 18 },
    headStyles: {
      fillColor: green,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    footStyles: {
      fillColor: [242, 242, 242],
      textColor: CHARCOAL,
      fontStyle: "bold",
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: 28, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 48, halign: "center" },
      3: { cellWidth: 80, halign: "right" },
      4: { cellWidth: 80, halign: "right" },
    },
    tableWidth: pageWidth - margin * 2,
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;

  if (draft.kind === "invoice" && hasSupplierBankDetails(draft)) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...CHARCOAL);
    doc.text("Pay to (BAC)", margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Account name: ${draft.accountName.trim()}`, margin, y);
    y += 13;
    doc.text(`Sort code: ${draft.sortCode.trim()}`, margin, y);
    y += 13;
    doc.text(`Account number: ${draft.accountNumber.trim()}`, margin, y);
    y += 18;
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...CHARCOAL);
  const note =
    draft.kind === "invoice" ? invoiceNote(config) : quoteNote(config);
  doc.text(doc.splitTextToSize(note, pageWidth - margin * 2), margin, y);

  const blob = doc.output("blob");
  return new File([blob], quoteFileName(draft, config), { type: "application/pdf" });
}
