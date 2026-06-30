import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Currency Formatter Helper
const formatCurrency = (val: number) => {
  return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(val));
};

// ─── DAILY REPORT EXPORTS ──────────────────────────────────────────────────
export const exportDailyReportToExcel = (date: string, data: any) => {
  const sheetData = [
    ['DAILY SALES REPORT', date],
    [],
    ['KEY PERFORMANCE METRICS'],
    ['Total Bills', data.billCount],
    ['Gross Revenue', Number(data.revenue)],
    ['Discounts Given', Number(data.discounts)],
    ['Taxes Collected', Number(data.taxes)],
    ['Net Revenue', Number(data.netRevenue)],
    [],
    ['BILL DETAILS'],
    ['Bill Number', 'Customer Name', 'Grand Total', 'Payment Method', 'Status', 'Time']
  ];

  data.invoices.forEach((inv: any) => {
    sheetData.push([
      inv.invoiceNumber,
      inv.customerName || 'Walk-in Customer',
      Number(inv.grandTotal),
      inv.paymentMethod,
      inv.paymentStatus,
      new Date(inv.createdAt).toLocaleTimeString('en-IN')
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');
  XLSX.writeFile(wb, `Daily_Sales_Report_${date}.xlsx`);
};

export const exportDailyReportToPDF = (date: string, data: any) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Daily Sales Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Date: ${date}`, 14, 26);

  // Stats table
  autoTable(doc, {
    startY: 32,
    head: [['Metric', 'Value']],
    body: [
      ['Total Bills', String(data.billCount)],
      ['Gross Revenue', formatCurrency(Number(data.revenue))],
      ['Discounts Given', formatCurrency(Number(data.discounts))],
      ['Taxes Collected', formatCurrency(Number(data.taxes))],
      ['Net Revenue', formatCurrency(Number(data.netRevenue))],
    ],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  // Bills table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Bill Breakdown', 14, (doc as any).lastAutoTable.finalY + 12);

  const billRows = data.invoices.map((inv: any) => [
    inv.invoiceNumber,
    inv.customerName || 'Walk-in Customer',
    formatCurrency(Number(inv.grandTotal)),
    inv.paymentMethod,
    inv.paymentStatus,
    new Date(inv.createdAt).toLocaleTimeString('en-IN')
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 16,
    head: [['Bill No', 'Customer', 'Amount', 'Payment Method', 'Status', 'Time']],
    body: billRows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  doc.save(`Daily_Sales_Report_${date}.pdf`);
};

// ─── MONTHLY REPORT EXPORTS ────────────────────────────────────────────────
export const exportMonthlyReportToExcel = (year: number, monthName: string, data: any) => {
  const sheetData = [
    ['MONTHLY SALES REPORT', `${monthName} ${year}`],
    [],
    ['MONTHLY METRICS'],
    ['Total Bills', data.billCount],
    ['Gross Revenue', Number(data.revenue)],
    ['Total Cost', Number(data.cost || 0)],
    ['Net Profit', Number(data.profit || 0)],
    ['Discounts Given', Number(data.discounts)],
    ['Taxes Collected', Number(data.taxes)],
    [],
    ['TOP SELLING PRODUCTS'],
    ['Item Code', 'Product Name', 'Quantity Sold', 'Revenue']
  ];

  data.topProducts.forEach((p: any) => {
    sheetData.push([
      p.itemCode,
      p.itemName,
      Number(p.totalQty),
      Number(p.totalRevenue)
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report');
  XLSX.writeFile(wb, `Monthly_Report_${monthName}_${year}.xlsx`);
};

export const exportMonthlyReportToPDF = (year: number, monthName: string, data: any) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Sales Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Period: ${monthName} ${year}`, 14, 26);

  // Stats table
  autoTable(doc, {
    startY: 32,
    head: [['Metric', 'Value']],
    body: [
      ['Total Bills', String(data.billCount)],
      ['Gross Revenue', formatCurrency(Number(data.revenue))],
      ['Total Cost', formatCurrency(Number(data.cost || 0))],
      ['Net Profit', formatCurrency(Number(data.profit || 0))],
      ['Discounts Given', formatCurrency(Number(data.discounts))],
      ['Taxes Collected', formatCurrency(Number(data.taxes))],
    ],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  // Top products table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Top Selling Products', 14, (doc as any).lastAutoTable.finalY + 12);

  const productRows = data.topProducts.map((p: any) => [
    p.itemCode,
    p.itemName,
    Number(p.totalQty).toFixed(2),
    formatCurrency(Number(p.totalRevenue))
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 16,
    head: [['Item Code', 'Product Name', 'Qty Sold', 'Revenue']],
    body: productRows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  doc.save(`Monthly_Report_${monthName}_${year}.pdf`);
};

// ─── QUARTERLY REPORT EXPORTS ──────────────────────────────────────────────
export const exportQuarterlyReportToExcel = (year: number, quarter: number, data: any) => {
  const wb = XLSX.utils.book_new();

  // Summary and metrics sheet
  const summaryData = [
    ['QUARTERLY SALES REPORT', `Q${quarter} ${year}`],
    [],
    ['METRIC', 'VALUE'],
    ['Revenue', Number(data.revenue)],
    ['Previous Quarter Revenue', Number(data.previousQuarterRevenue)],
    ['Growth Percent', `${Number(data.growthPercent).toFixed(2)}%`]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Best sellers sheet
  const bestSellersData = [
    ['BEST SELLING PRODUCTS'],
    ['Item Code', 'Product Name', 'Quantity Sold', 'Revenue']
  ];
  data.bestSellers.forEach((p: any) => {
    bestSellersData.push([p.itemCode, p.itemName, Number(p.totalQty), Number(p.totalRevenue)]);
  });
  const wsBestSellers = XLSX.utils.aoa_to_sheet(bestSellersData);
  XLSX.utils.book_append_sheet(wb, wsBestSellers, 'Best Sellers');

  // Category performance sheet
  const catData = [
    ['CATEGORY PERFORMANCE'],
    ['Category Name', 'Total Revenue']
  ];
  data.categoryPerformance.forEach((c: any) => {
    catData.push([c.categoryName, Number(c.totalRevenue)]);
  });
  const wsCat = XLSX.utils.aoa_to_sheet(catData);
  XLSX.utils.book_append_sheet(wb, wsCat, 'Category Performance');

  XLSX.writeFile(wb, `Quarterly_Report_Q${quarter}_${year}.xlsx`);
};

export const exportQuarterlyReportToPDF = (year: number, quarter: number, data: any) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Quarterly Sales Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Period: Q${quarter} ${year}`, 14, 26);

  // Stats table
  autoTable(doc, {
    startY: 32,
    head: [['Metric', 'Value']],
    body: [
      ['Revenue', formatCurrency(Number(data.revenue))],
      ['Previous Quarter Revenue', formatCurrency(Number(data.previousQuarterRevenue))],
      ['Growth', `${Number(data.growthPercent).toFixed(2)}%`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  // Best sellers
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Best Selling Products', 14, (doc as any).lastAutoTable.finalY + 12);

  const bestSellerRows = data.bestSellers.map((p: any) => [
    p.itemCode,
    p.itemName,
    Number(p.totalQty).toFixed(2),
    formatCurrency(Number(p.totalRevenue))
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 16,
    head: [['Item Code', 'Product Name', 'Qty Sold', 'Revenue']],
    body: bestSellerRows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  // Category performance
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Category Performance', 14, (doc as any).lastAutoTable.finalY + 12);

  const catRows = data.categoryPerformance.map((c: any) => [
    c.categoryName,
    formatCurrency(Number(c.totalRevenue))
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 16,
    head: [['Category Name', 'Total Revenue']],
    body: catRows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  doc.save(`Quarterly_Report_Q${quarter}_${year}.pdf`);
};

// ─── YEARLY REPORT EXPORTS ─────────────────────────────────────────────────
export const exportYearlyReportToExcel = (year: number, data: any) => {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['YEARLY SALES REPORT', String(year)],
    [],
    ['METRIC', 'VALUE'],
    ['Annual Revenue', Number(data.revenue)],
    ['Total Cost', Number(data.cost || 0)],
    ['Net Profit', Number(data.profit || 0)],
    ['Discounts Given', Number(data.discounts)],
    ['Taxes Collected', Number(data.taxes)]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Monthly breakdown sheet
  const breakdownData = [
    ['MONTHLY BREAKDOWN'],
    ['Month', 'Bill Count', 'Revenue', 'Profit']
  ];
  data.monthlyBreakdown.forEach((m: any) => {
    breakdownData.push([m.monthName, m.billCount, Number(m.revenue), Number(m.profit)]);
  });
  const wsBreakdown = XLSX.utils.aoa_to_sheet(breakdownData);
  XLSX.utils.book_append_sheet(wb, wsBreakdown, 'Monthly Breakdown');

  // Top products sheet
  const productsData = [
    ['TOP SELLING PRODUCTS'],
    ['Item Code', 'Product Name', 'Quantity Sold', 'Revenue']
  ];
  data.topProducts.forEach((p: any) => {
    productsData.push([p.itemCode, p.itemName, Number(p.totalQty), Number(p.totalRevenue)]);
  });
  const wsProducts = XLSX.utils.aoa_to_sheet(productsData);
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Top Products');

  XLSX.writeFile(wb, `Yearly_Report_${year}.xlsx`);
};

export const exportYearlyReportToPDF = (year: number, data: any) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Yearly Sales Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Year: ${year}`, 14, 26);

  // Stats table
  autoTable(doc, {
    startY: 32,
    head: [['Metric', 'Value']],
    body: [
      ['Annual Revenue', formatCurrency(Number(data.revenue))],
      ['Total Cost', formatCurrency(Number(data.cost || 0))],
      ['Net Profit', formatCurrency(Number(data.profit || 0))],
      ['Discounts Given', formatCurrency(Number(data.discounts))],
      ['Taxes Collected', formatCurrency(Number(data.taxes))],
    ],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  // Monthly breakdown
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Monthly Breakdown', 14, (doc as any).lastAutoTable.finalY + 12);

  const breakdownRows = data.monthlyBreakdown.map((m: any) => [
    m.monthName,
    String(m.billCount),
    formatCurrency(Number(m.revenue)),
    formatCurrency(Number(m.profit))
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 16,
    head: [['Month', 'Bill Count', 'Revenue', 'Profit']],
    body: breakdownRows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  // Top products
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Products', 14, (doc as any).lastAutoTable.finalY + 12);

  const productRows = data.topProducts.map((p: any) => [
    p.itemCode,
    p.itemName,
    Number(p.totalQty).toFixed(2),
    formatCurrency(Number(p.totalRevenue))
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 16,
    head: [['Item Code', 'Product Name', 'Qty Sold', 'Revenue']],
    body: productRows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  doc.save(`Yearly_Report_${year}.pdf`);
};
