/**
 * Export Service
 *
 * Handles exporting deal transcripts to PDF and CSV formats.
 * Uses jsPDF and jspdf-autotable for PDF generation (client-side).
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Deal, Message, NegotiationConfig, Explainability } from '../types';

// Extend jsPDF type to include autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface SummaryData {
  finalPrice?: number;
  finalTerms?: string;
  savings?: number;
  savingsPercentage?: number;
  totalRounds?: number;
  duration?: string;
}

/**
 * Export deal transcript to PDF
 *
 * Includes:
 * - Deal information (title, status, counterparty)
 * - Negotiation configuration
 * - Full message transcript with decision metadata
 * - Explainability data (if available)
 */
export async function exportToPDF(
  deal: Deal,
  messages: Message[],
  config: NegotiationConfig | null,
  explainability: Explainability | null = null
): Promise<void> {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Negotiation Transcript', 14, 20);

  // Deal Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Deal: ${deal.title}`, 14, 30);
  doc.text(`Status: ${deal.status}`, 14, 37);
  doc.text(`Round: ${deal.round}`, 14, 44);
  if (deal.counterparty) {
    doc.text(`Counterparty: ${deal.counterparty}`, 14, 51);
  }
  doc.text(`Mode: ${deal.mode}`, 14, 58);

  // Configuration Section
  let yPos = 68;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Negotiation Configuration', 14, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (config) {
    const configLines = [
      `Target Price: $${config.parameters?.unit_price?.target ?? 'N/A'}`,
      `Anchor Price: $${config.parameters?.unit_price?.anchor ?? 'N/A'}`,
      `Max Acceptable: $${config.parameters?.unit_price?.max_acceptable ?? 'N/A'}`,
      `Payment Terms: ${config.parameters?.payment_terms?.options?.join(', ') ?? 'N/A'}`,
      `Accept Threshold: ${config.accept_threshold ?? 'N/A'}`,
      `Walk Away Threshold: ${config.walkaway_threshold ?? 'N/A'}`,
      `Max Rounds: ${config.max_rounds ?? 'N/A'}`,
    ];

    configLines.forEach((line) => {
      doc.text(line, 14, yPos);
      yPos += 6;
    });
  }

  // Messages Transcript Table
  yPos += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Message Transcript', 14, yPos);

  yPos += 5;

  const tableData = messages.map((msg) => [
    msg.role,
    new Date(msg.createdAt).toLocaleString(),
    msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
    msg.decisionAction ?? '-',
    msg.utilityScore !== null ? msg.utilityScore.toFixed(2) : '-',
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Role', 'Timestamp', 'Content', 'Decision', 'Utility']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [63, 81, 181] },
    margin: { left: 14, right: 14 },
  });

  // Explainability Section (if available)
  if (explainability) {
    yPos = doc.lastAutoTable.finalY + 10;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Decision Explainability (Last Round)', 14, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (explainability.vendorOffer) {
      doc.text(`Vendor Offer:`, 14, yPos);
      yPos += 6;
      doc.text(`  Price: $${explainability.vendorOffer.unit_price ?? 'N/A'}`, 14, yPos);
      yPos += 6;
      doc.text(`  Terms: ${explainability.vendorOffer.payment_terms ?? 'N/A'}`, 14, yPos);
      yPos += 8;
    }

    if (explainability.utilities) {
      doc.text(`Utility Breakdown:`, 14, yPos);
      yPos += 6;
      doc.text(`  Price Utility: ${explainability.utilities.priceUtility?.toFixed(2) ?? 'N/A'}`, 14, yPos);
      yPos += 6;
      doc.text(`  Terms Utility: ${explainability.utilities.termsUtility?.toFixed(2) ?? 'N/A'}`, 14, yPos);
      yPos += 6;
      doc.text(`  Total Utility: ${explainability.utilities.total?.toFixed(2) ?? 'N/A'}`, 14, yPos);
      yPos += 8;
    }

    if (explainability.decision) {
      doc.text(`Decision: ${explainability.decision.action}`, 14, yPos);
      yPos += 6;

      if (explainability.decision.reasons && explainability.decision.reasons.length > 0) {
        doc.text(`Reasons:`, 14, yPos);
        yPos += 6;
        explainability.decision.reasons.forEach((reason) => {
          const lines = doc.splitTextToSize(`  - ${reason}`, 180);
          lines.forEach((line: string) => {
            doc.text(line, 14, yPos);
            yPos += 5;
          });
        });
      }
    }
  }

  // Save PDF
  doc.save(`negotiation-${deal.id}.pdf`);
}

/**
 * Export deal transcript to CSV
 *
 * Columns:
 * - deal_id
 * - round
 * - role
 * - timestamp
 * - content
 * - decision_action
 * - utility_score
 * - price_offer
 * - terms_offer
 */
export function exportToCSV(deal: Deal, messages: Message[]): void {
  const headers = [
    'deal_id',
    'round',
    'role',
    'timestamp',
    'content',
    'decision_action',
    'utility_score',
    'price_offer',
    'terms_offer',
  ];

  const rows = messages.map((msg) => {
    const priceOffer =
      msg.counterOffer?.unit_price ??
      msg.extractedOffer?.unit_price ??
      '';
    const termsOffer =
      msg.counterOffer?.payment_terms ??
      msg.extractedOffer?.payment_terms ??
      '';

    return [
      deal.id,
      deal.round || '',
      msg.role,
      new Date(msg.createdAt).toISOString(),
      `"${msg.content.replace(/"/g, '""')}"`, // Escape quotes
      msg.decisionAction ?? '',
      msg.utilityScore !== null ? msg.utilityScore.toString() : '',
      priceOffer.toString(),
      termsOffer.toString(),
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `negotiation-${deal.id}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export deal summary (for summary page)
 *
 * Similar to exportToPDF but includes outcome analysis
 */
export async function exportSummaryPDF(
  deal: Deal,
  messages: Message[],
  _config: NegotiationConfig | null,
  summary: SummaryData
): Promise<void> {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Negotiation Summary', 14, 20);

  // Deal Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Deal: ${deal.title}`, 14, 30);
  doc.text(`Status: ${deal.status}`, 14, 37);
  doc.text(`Final Round: ${deal.round}`, 14, 44);

  // Outcome Section
  let yPos = 54;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Outcome Analysis', 14, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (summary) {
    const summaryLines = [
      `Final Price: $${summary.finalPrice ?? 'N/A'}`,
      `Final Terms: ${summary.finalTerms ?? 'N/A'}`,
      `Savings: $${summary.savings ?? 'N/A'} (${summary.savingsPercentage ?? 0}%)`,
      `Total Rounds: ${summary.totalRounds ?? deal.round}`,
      `Duration: ${summary.duration ?? 'N/A'}`,
    ];

    summaryLines.forEach((line) => {
      doc.text(line, 14, yPos);
      yPos += 6;
    });
  }

  // Add transcript (same as exportToPDF)
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Message Transcript', 14, yPos);

  yPos += 5;

  const tableData = messages.map((msg) => [
    msg.role,
    new Date(msg.createdAt).toLocaleString(),
    msg.content.substring(0, 80) + (msg.content.length > 80 ? '...' : ''),
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Role', 'Timestamp', 'Content']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [63, 81, 181] },
    margin: { left: 14, right: 14 },
  });

  // Save PDF
  doc.save(`negotiation-summary-${deal.id}.pdf`);
}
