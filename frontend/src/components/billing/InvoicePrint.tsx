import { useRef } from 'react';
import { Printer, Download, PlusCircle, CheckCircle } from 'lucide-react';
import type { Invoice } from '../../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  invoice: Invoice;
  onNewSale: () => void;
}

export default function InvoicePrint({ invoice, onNewSale }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const co = invoice.company;
  const currency = co?.currencySymbol || '₹';

  const handlePrint = () => window.print();

  const handlePDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(co.name || 'Company Name', 14, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    const addrLine = [co.address, co.city, co.state, co.pincode].filter(Boolean).join(', ');
    doc.text(addrLine, 14, 28);
    if (co.phone) doc.text(`Phone: ${co.phone}`, 14, 33);
    if (co.email) doc.text(`Email: ${co.email}`, 14, 38);
    if (co.gstNumber) doc.text(`GSTIN: ${co.gstNumber}`, 14, 43);

    // Invoice title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('TAX BILL', 140, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bill No: ${invoice.invoiceNumber}`, 140, 28);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, 140, 33);
    doc.text(`Payment: ${invoice.paymentMethod}`, 140, 38);

    // Customer
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 50, 182, 18, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 16, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(`${invoice.customerName || 'Walk-in Customer'}`, 16, 63);
    if (invoice.customerPhone) doc.text(`Ph: ${invoice.customerPhone}`, 100, 63);

    // Items table
    const rows = invoice.items.map((item, i) => [
      String(i + 1),
      item.itemCode,
      item.itemName,
      `${item.quantity} ${item.unit}`,
      `${currency}${Number(item.unitPrice).toFixed(2)}`,
      `${item.taxPercentage}%`,
      `${currency}${Number(item.taxAmount).toFixed(2)}`,
      `${currency}${Number(item.lineTotal).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 72,
      head: [['#', 'Code', 'Description', 'Qty', 'Rate', 'Tax%', 'Tax Amt', 'Total']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      styles: { cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 22 }, 7: { halign: 'right' } },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 6;

    // Totals
    const totals = [
      ['Subtotal', `${currency}${Number(invoice.subtotal).toFixed(2)}`],
    ];
    if (Number(invoice.discountAmount) > 0) {
      totals.push([
        `Total Discount (${invoice.discountType === 'PERCENT' ? invoice.discountValue + '%' : 'Fixed'})`,
        `-${currency}${Number(invoice.discountAmount).toFixed(2)}`
      ]);
    }
    totals.push(['Tax (GST)', `${currency}${Number(invoice.taxAmount).toFixed(2)}`]);
    totals.push(['GRAND TOTAL', `${currency}${Number(invoice.grandTotal).toFixed(2)}`]);

    autoTable(doc, {
      startY: finalY,
      body: totals,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { halign: 'right', textColor: [100, 116, 139] },
        1: { halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 120 },
      didDrawCell: (data) => {
        if (data.row.index === totals.length - 1) {
          doc.setFillColor(79, 70, 229);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setTextColor(255);
        }
      },
    });

    if (Number(invoice.discountAmount) > 0) {
      const dAmt = Number(invoice.discountAmount);
      const dVal = Number(invoice.discountValue);
      const isP = invoice.discountType === 'PERCENT';
      const formatV = (v: number) => v % 1 === 0 ? v.toFixed(0) : v.toFixed(1);

      const kvicV = dVal * 15 / 35;
      const kvibV = dVal * 10 / 35;
      const instV = dVal * 10 / 35;

      const kvicA = dAmt * 15 / 35;
      const kvibA = dAmt * 10 / 35;
      const instA = dAmt * 10 / 35;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      doc.text(`KVIC DISCOUNT (${isP ? formatV(kvicV) + '%' : '15/35'}): -${currency}${kvicA.toFixed(2)}`, 14, finalY + 4);
      doc.text(`KVIB DISCOUNT (${isP ? formatV(kvibV) + '%' : '10/35'}): -${currency}${kvibA.toFixed(2)}`, 14, finalY + 9);
      doc.text(`INSTITUTION DISCOUNT (${isP ? formatV(instV) + '%' : '10/35'}): -${currency}${instA.toFixed(2)}`, 14, finalY + 14);
    }

    if (co.invoiceFooter) {
      const footerY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(co.invoiceFooter, 105, footerY, { align: 'center' });
    }

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Bill Created</h2>
            <p className="text-sm text-slate-400">{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-secondary">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handlePDF} className="btn-secondary">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button onClick={onNewSale} className="btn-primary">
            <PlusCircle className="w-4 h-4" /> New Sale
          </button>
        </div>
      </div>

      {/* Invoice preview */}
      <div ref={printRef} className="bg-white text-gray-900 rounded-xl p-8 shadow-2xl max-w-3xl mx-auto print:shadow-none print:rounded-none print:max-w-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{co.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {[co.address, co.city, co.state, co.pincode].filter(Boolean).join(', ')}
            </p>
            {co.phone && <p className="text-sm text-gray-500">📞 {co.phone}</p>}
            {co.email && <p className="text-sm text-gray-500">✉ {co.email}</p>}
            {co.gstNumber && <p className="text-sm font-medium text-gray-700 mt-1">GSTIN: {co.gstNumber}</p>}
          </div>
          <div className="text-right">
            <div className="inline-block bg-indigo-600 text-white text-sm font-bold px-4 py-1 rounded-lg mb-2">
              TAX BILL
            </div>
            <p className="text-sm font-bold text-gray-900">{invoice.invoiceNumber}</p>
            <p className="text-xs text-gray-500">
              {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(invoice.createdAt).toLocaleTimeString('en-IN')}
            </p>
          </div>
        </div>

        {/* Customer info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Billed To</p>
          <p className="font-semibold text-gray-900">{invoice.customerName || 'Walk-in Customer'}</p>
          {invoice.customerPhone && <p className="text-sm text-gray-600">📞 {invoice.customerPhone}</p>}
          <div className="mt-2 text-sm text-gray-600">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              invoice.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {invoice.paymentMethod} • {invoice.paymentStatus}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="text-left px-3 py-2 text-xs">#</th>
              <th className="text-left px-3 py-2 text-xs">Item</th>
              <th className="text-center px-3 py-2 text-xs">Qty</th>
              <th className="text-right px-3 py-2 text-xs">Rate</th>
              <th className="text-right px-3 py-2 text-xs">Tax</th>
              <th className="text-right px-3 py-2 text-xs">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                <td className="px-3 py-2">
                  <div className="font-medium text-gray-900">{item.itemName}</div>
                  <div className="text-xs text-gray-400">{item.itemCode}</div>
                </td>
                <td className="px-3 py-2 text-center text-gray-700">{item.quantity} {item.unit}</td>
                <td className="px-3 py-2 text-right text-gray-700">{currency}{Number(item.unitPrice).toFixed(2)}</td>
                <td className="px-3 py-2 text-right text-gray-500 text-xs">
                  {item.taxPercentage}%<br/>
                  <span className="text-gray-400">{currency}{Number(item.taxAmount).toFixed(2)}</span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-gray-900">{currency}{Number(item.lineTotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-between items-start border-t border-gray-100 pt-4">
          {/* Left Column - Split Discount Details */}
          <div className="text-[11px] text-gray-500 font-mono space-y-1 mt-1">
            {Number(invoice.discountAmount) > 0 && (() => {
              const dAmt = Number(invoice.discountAmount);
              const dVal = Number(invoice.discountValue);
              const isP = invoice.discountType === 'PERCENT';
              const formatV = (v: number) => v % 1 === 0 ? v.toFixed(0) : v.toFixed(1);
              
              const kvicV = dVal * 15 / 35;
              const kvibV = dVal * 10 / 35;
              const instV = dVal * 10 / 35;
              
              const kvicA = dAmt * 15 / 35;
              const kvibA = dAmt * 10 / 35;
              const instA = dAmt * 10 / 35;
              
              return (
                <>
                  <div>KVIC DISCOUNT ({isP ? `${formatV(kvicV)}%` : `15/35`}): -{currency}{kvicA.toFixed(2)}</div>
                  <div>KVIB DISCOUNT ({isP ? `${formatV(kvibV)}%` : `10/35`}): -{currency}{kvibA.toFixed(2)}</div>
                  <div>INSTITUTION DISCOUNT ({isP ? `${formatV(instV)}%` : `10/35`}): -{currency}{instA.toFixed(2)}</div>
                </>
              );
            })()}
          </div>

          {/* Right Column - Totals */}
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{currency}{Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            {Number(invoice.discountAmount) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{currency}{Number(invoice.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax (GST)</span>
              <span>{currency}{Number(invoice.taxAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-white bg-indigo-600 rounded-lg px-3 py-2 mt-2">
              <span>TOTAL</span>
              <span>{currency}{Number(invoice.grandTotal).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
            <p className="text-sm text-gray-700">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        {co.invoiceFooter && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 italic">{co.invoiceFooter}</p>
          </div>
        )}
      </div>
    </div>
  );
}
