// All TypeScript interfaces for the application

export interface Item {
  id: number;
  itemCode: string;
  name: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  unit: 'METER' | 'PIECE' | 'KG' | 'NOS';
  taxPercentage: number;
  minStockThreshold: number;
  isActive: boolean;
  isLowStock: boolean;
  dateAdded: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  totalPurchases: number;
  totalInvoices: number;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: number;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxPercentage: number;
  taxAmount: number;
  lineTotal: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  subtotal: number;
  discountType: 'NONE' | 'PERCENT' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT';
  paymentStatus: 'PAID' | 'PENDING';
  notes?: string;
  createdAt: string;
  createdByName?: string;
  items: InvoiceLineItem[];
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    gstNumber: string;
    logoUrl?: string;
    invoiceFooter?: string;
    currencySymbol: string;
  };
}

export interface InvoiceSummary {
  id: number;
  invoiceNumber: string;
  customerName: string;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export interface DashboardSummary {
  todayBills: number;
  todayRevenue: number;
  monthBills: number;
  monthRevenue: number;
  quarterRevenue: number;
  yearRevenue: number;
  totalProducts: number;
  totalBills: number;
  totalCustomers: number;
  lowStockProducts: number;
}

export interface SalesTrendPoint {
  date: string;
  billCount: number;
  revenue: number;
}

export interface MonthlyTrendPoint {
  month: string;
  year: number;
  billCount: number;
  revenue: number;
}

export interface TopProduct {
  itemId: number;
  itemCode: string;
  itemName: string;
  totalQty: number;
  totalRevenue: number;
}

export interface CategoryPerformance {
  categoryName: string;
  totalRevenue: number;
  totalQty: number;
}

export interface Company {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  logoUrl?: string;
  invoiceFooter?: string;
  taxRateDefault: number;
  currencySymbol: string;
  invoicePrefix: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'BILLING_STAFF';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface DailyReport {
  date: string;
  billCount: number;
  revenue: number;
  discounts: number;
  taxes: number;
  netRevenue: number;
  invoices: InvoiceSummary[];
}

export interface MonthlyReport {
  year: number;
  month: number;
  monthName: string;
  billCount: number;
  revenue: number;
  profit: number;
  discounts: number;
  taxes: number;
  topProducts: ProductPerformance[];
}

export interface QuarterlyReport {
  year: number;
  quarter: number;
  revenue: number;
  previousQuarterRevenue: number;
  growthPercent: number;
  bestSellers: ProductPerformance[];
  categoryPerformance: CategoryPerformance[];
}

export interface YearlyReport {
  year: number;
  revenue: number;
  cost: number;
  profit: number;
  taxes: number;
  discounts: number;
  monthlyBreakdown: MonthlyBreakdown[];
  topProducts: ProductPerformance[];
}

export interface MonthlyBreakdown {
  month: number;
  monthName: string;
  revenue: number;
  profit: number;
  billCount: number;
}

export interface ProductPerformance {
  itemCode: string;
  itemName: string;
  totalQty: number;
  totalRevenue: number;
}
