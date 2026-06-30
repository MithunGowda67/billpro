import api from './api';
import type {
  Item, Category, Invoice, InvoiceSummary, DashboardSummary,
  SalesTrendPoint, MonthlyTrendPoint, TopProduct, CategoryPerformance,
  Company, User, PageResponse, DailyReport, MonthlyReport, QuarterlyReport, YearlyReport
} from '../types';

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/api/auth/login', { username, password }),
  me: () => api.get('/api/auth/me'),
};

// ── Items ─────────────────────────────────────────────────────────────
export const itemsApi = {
  list: (params?: { search?: string; categoryId?: number; page?: number; size?: number }) =>
    api.get<PageResponse<Item>>('/api/items', { params }),
  get: (id: number) => api.get<Item>(`/api/items/${id}`),
  create: (data: Partial<Item>) => api.post<Item>('/api/items', data),
  update: (id: number, data: Partial<Item>) => api.put<Item>(`/api/items/${id}`, data),
  delete: (id: number) => api.delete(`/api/items/${id}`),
  lowStock: () => api.get<Item[]>('/api/items/low-stock'),
  search: (q: string) => api.get<Item[]>('/api/items/search', { params: { q } }),
};

// ── Categories ────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () => api.get<Category[]>('/api/categories'),
  create: (name: string, description?: string) => api.post('/api/categories', { name, description }),
  update: (id: number, data: { name?: string; description?: string }) =>
    api.put(`/api/categories/${id}`, data),
  delete: (id: number) => api.delete(`/api/categories/${id}`),
};

// ── Invoices ──────────────────────────────────────────────────────────
export const invoicesApi = {
  list: (params?: {
    from?: string; to?: string; customerId?: number;
    paymentMethod?: string; invoiceNumber?: string; page?: number; size?: number;
  }) => api.get<PageResponse<InvoiceSummary>>('/api/invoices', { params }),
  get: (id: number) => api.get<Invoice>(`/api/invoices/${id}`),
  create: (data: object) => api.post<Invoice>('/api/invoices', data),
};

// ── Dashboard ─────────────────────────────────────────────────────────
export const dashboardApi = {
  summary: () => api.get<DashboardSummary>('/api/dashboard/summary'),
  salesTrend: (days = 30) => api.get<SalesTrendPoint[]>('/api/dashboard/sales-trend', { params: { days } }),
  monthlyTrend: (months = 12) => api.get<MonthlyTrendPoint[]>('/api/dashboard/monthly-trend', { params: { months } }),
  topProducts: (limit = 10) => api.get<TopProduct[]>('/api/dashboard/top-products', { params: { limit } }),
  categoryPerformance: () => api.get<CategoryPerformance[]>('/api/dashboard/category-performance'),
};

// ── Reports ───────────────────────────────────────────────────────────
export const reportsApi = {
  daily: (date?: string) => api.get<DailyReport>('/api/reports/daily', { params: { date } }),
  monthly: (year?: number, month?: number) =>
    api.get<MonthlyReport>('/api/reports/monthly', { params: { year, month } }),
  quarterly: (year?: number, quarter?: number) =>
    api.get<QuarterlyReport>('/api/reports/quarterly', { params: { year, quarter } }),
  yearly: (year?: number) => api.get<YearlyReport>('/api/reports/yearly', { params: { year } }),
};

// ── Company ───────────────────────────────────────────────────────────
export const companyApi = {
  get: () => api.get<Company>('/api/company'),
  update: (data: Partial<Company>) => api.put<Company>('/api/company', data),
};

// ── Users ─────────────────────────────────────────────────────────────
export const usersApi = {
  list: () => api.get<User[]>('/api/users'),
  create: (data: object) => api.post<User>('/api/users', data),
  update: (id: number, data: object) => api.put<User>(`/api/users/${id}`, data),
  delete: (id: number) => api.delete(`/api/users/${id}`),
  toggleActive: (id: number) => api.put<User>(`/api/users/${id}/toggle-active`),
};
