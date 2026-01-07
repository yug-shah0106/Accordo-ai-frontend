import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import type { Deal } from '../types/chatbot';

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  explainabilityJson?: any;
  counterOffer?: any;
  extractedOffer?: any;
}

/**
 * Export deal as PDF with summary and full transcript
 */
export const exportDealAsPDF = (deal: Deal, messages: Message[]) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Negotiation Deal Summary', 14, 20);

  // Deal Summary Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Deal Information', 14, 35);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const summaryData = [
    ['Deal Title:', deal.title],
    ['Status:', deal.status],
    ['Counterparty:', deal.counterparty || 'N/A'],
    ['Round:', `${deal.round}`],
    ['Mode:', deal.mode],
    ['Created:', new Date(deal.createdAt).toLocaleString()],
    ['Last Updated:', new Date(deal.updatedAt).toLocaleString()],
  ];

  autoTable(doc, {
    startY: 40,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 140 }
    }
  });

  // Chat Transcript Section
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Negotiation Transcript', 14, finalY + 15);

  const tableData = messages.map((msg, index) => [
    `#${index + 1}`,
    msg.role,
    new Date(msg.createdAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    msg.content.substring(0, 150) + (msg.content.length > 150 ? '...' : '')
  ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['#', 'Role', 'Time', 'Message']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 75, 243], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 25, fontStyle: 'bold' },
      2: { cellWidth: 35 },
      3: { cellWidth: 108 }
    },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  // Save the PDF
  const filename = `deal-${deal.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.pdf`;
  doc.save(filename);
};

/**
 * Export deal as CSV with all messages and metadata
 */
export const exportDealAsCSV = (deal: Deal, messages: Message[]) => {
  const data = messages.map((msg, index) => ({
    'Message #': index + 1,
    'Deal Title': deal.title,
    'Deal Status': deal.status,
    'Round': deal.round,
    'Counterparty': deal.counterparty || 'N/A',
    'Role': msg.role,
    'Timestamp': new Date(msg.createdAt).toISOString(),
    'Message': msg.content,
    'Has Offer': msg.counterOffer || msg.extractedOffer ? 'Yes' : 'No'
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  const filename = `deal-${deal.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.csv`;
  link.download = filename;
  link.click();

  // Clean up
  URL.revokeObjectURL(url);
};
