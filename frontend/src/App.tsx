import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import BillingPage from './pages/BillingPage';
import InvoiceHistoryPage from './pages/InvoiceHistoryPage';
import { DailyReportPage, MonthlyReportPage, QuarterlyReportPage, YearlyReportPage } from './pages/ReportPages';
import AnalyticsPage from './pages/AnalyticsPage';
import CompanySettingsPage from './pages/CompanySettingsPage';
import UserManagementPage from './pages/UserManagementPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected (all authenticated) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/low-stock" element={<InventoryPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/billing/history" element={<InvoiceHistoryPage />} />
            <Route path="/billing/invoice/:id" element={<InvoiceDetailPage />} />
          </Route>

          {/* Admin only */}
          <Route element={<AdminRoute />}>
            <Route path="/reports/daily" element={<DailyReportPage />} />
            <Route path="/reports/monthly" element={<MonthlyReportPage />} />
            <Route path="/reports/quarterly" element={<QuarterlyReportPage />} />
            <Route path="/reports/yearly" element={<YearlyReportPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings/company" element={<CompanySettingsPage />} />
            <Route path="/settings/users" element={<UserManagementPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
