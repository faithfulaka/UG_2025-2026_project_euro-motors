'use client';

import { jsPDF } from 'jspdf';
import type { BuyCar } from '@/types/cars';

export interface QuotePdfInput {
  quoteId?: string;
  car: BuyCar;
  quoteType: 'trade-in' | 'direct';
  amount: number;
  tradeInValue?: number;
  balanceDue: number;
  cashDeposit: number;
  termMonths: number;
  monthlyPayment: number;
  customerNotes?: string;
}

export function downloadQuotePdf(input: QuotePdfInput) {
  const doc = new jsPDF();
  const margin = 14;
  let y = 18;

  const title = 'Euro Motors - Purchase Quote';
  doc.setFontSize(16);
  doc.text(title, margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, margin, y);
  y += 6;
  if (input.quoteId) {
    doc.text(`Quote ID: ${input.quoteId}`, margin, y);
    y += 6;
  }

  doc.setFontSize(12);
  doc.text('Vehicle', margin, y);
  y += 6;
  doc.setFontSize(10);
  doc.text(`${input.car.make} ${input.car.model} ${input.car.trim ?? ''} (${input.car.year})`, margin, y);
  y += 6;
  doc.text(`Price: £${input.amount.toLocaleString()}`, margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.text('Payment Summary', margin, y);
  y += 6;
  doc.setFontSize(10);
  doc.text(`Quote Type: ${input.quoteType === 'trade-in' ? 'Trade-In + Finance' : 'Direct Finance'}`, margin, y);
  y += 6;
  if (input.tradeInValue !== undefined) {
    doc.text(`Trade-In Value: £${input.tradeInValue.toLocaleString()}`, margin, y);
    y += 6;
  }
  doc.text(`Cash Deposit: £${input.cashDeposit.toLocaleString()}`, margin, y);
  y += 6;
  doc.text(`Balance Due: £${input.balanceDue.toLocaleString()}`, margin, y);
  y += 6;
  doc.text(`Term: ${input.termMonths} months`, margin, y);
  y += 6;
  doc.text(`Estimated Monthly: £${input.monthlyPayment.toFixed(2)}`, margin, y);
  y += 8;

  if (input.customerNotes) {
    doc.setFontSize(12);
    doc.text('Notes', margin, y);
    y += 6;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(input.customerNotes, 180);
    doc.text(lines, margin, y);
    y += lines.length * 5;
  }

  doc.setFontSize(9);
  doc.text('This quote is for demo purposes only. Payment processing is handled separately.', margin, 280);

  doc.save(`quote-${input.car.make}-${input.car.model}-${Date.now()}.pdf`);
}
