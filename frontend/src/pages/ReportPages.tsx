import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FileText, TrendingUp, IndianRupee, Receipt, Tag, Download } from 'lucide-react';
import { reportsApi } from '../services/apiServices';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  exportDailyReportToExcel, exportDailyReportToPDF,
  exportMonthlyReportToExcel, exportMonthlyReportToPDF,
  exportQuarterlyReportToExcel, exportQuarterlyReportToPDF,
  exportYearlyReportToExcel, exportYearlyReportToPDF
} from '../utils/exportUtils';

function formatCurrency(n: number = 0) {
  return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n));
}

// ─── Daily Report ─────────────────────────────────────────────────────────────
export function DailyReportPage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { data, isLoading } = useQuery({
    queryKey: ['report-daily', date],
    queryFn: () => reportsApi.daily(date).then(r => r.data),
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Sales Report</h1>
          <p className="page-subtitle">Detailed breakdown for a specific day</p>
        </div>
        <div className="flex gap-2 items-center">
          <input type="date" className="input w-auto" value={date} onChange={e => setDate(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')} />
          {data && (
            <>
              <button onClick={() => exportDailyReportToExcel(date, data)} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3" title="Export Excel">
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={() => exportDailyReportToPDF(date, data)} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3" title="Export PDF">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </>
          )}
        </div>
      </div>
      {isLoading ? <ReportSkeleton /> : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Bills" value={String(data.billCount)} icon={Receipt} color="bg-primary-600/20" />
            <StatCard title="Revenue" value={formatCurrency(data.revenue)} icon={IndianRupee} color="bg-emerald-600/20" />
            <StatCard title="Discounts" value={formatCurrency(data.discounts)} icon={Tag} color="bg-amber-600/20" />
            <StatCard title="Taxes" value={formatCurrency(data.taxes)} icon={TrendingUp} color="bg-blue-600/20" />
            <StatCard title="Net Revenue" value={formatCurrency(data.netRevenue)} icon={IndianRupee} color="bg-purple-600/20" />
          </div>
          <div className="table-wrapper">
            <div className="px-4 py-3 border-b border-surface-border">
              <h3 className="font-semibold text-white">Bills</h3>
            </div>
            <table className="table">
              <thead><tr><th>Bill No</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {data.invoices.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-slate-500 py-8">No bills for this date</td></tr>
                ) : data.invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-mono text-primary-400">{inv.invoiceNumber}</td>
                    <td>{inv.customerName}</td>
                    <td className="font-semibold">₹{Number(inv.grandTotal).toFixed(2)}</td>
                    <td><span className="badge-blue">{inv.paymentMethod}</span></td>
                    <td>{inv.paymentStatus === 'PAID' ? <span className="badge-green">Paid</span> : <span className="badge-yellow">Pending</span>}</td>
                    <td className="text-slate-500 text-xs">{new Date(inv.createdAt).toLocaleTimeString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Monthly Report ────────────────────────────────────────────────────────────
export function MonthlyReportPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { data, isLoading } = useQuery({
    queryKey: ['report-monthly', year, month],
    queryFn: () => reportsApi.monthly(year, month).then(r => r.data),
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Monthly Sales Report</h1>
          <p className="page-subtitle">{data?.monthName} {year}</p>
        </div>
        <div className="flex gap-2 items-center">
          <select className="select w-auto" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {['January','February','March','April','May','June','July','August','September','October','November','December']
              .map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select className="select w-auto" value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {data && (
            <>
              <button onClick={() => exportMonthlyReportToExcel(year, data.monthName, data)} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3" title="Export Excel">
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={() => exportMonthlyReportToPDF(year, data.monthName, data)} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3" title="Export PDF">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </>
          )}
        </div>
      </div>
      {isLoading ? <ReportSkeleton /> : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Bills" value={String(data.billCount)} icon={Receipt} color="bg-primary-600/20" />
            <StatCard title="Revenue" value={formatCurrency(data.revenue)} icon={IndianRupee} color="bg-emerald-600/20" />
            <StatCard title="Discounts" value={formatCurrency(data.discounts)} icon={Tag} color="bg-amber-600/20" />
            <StatCard title="Tax Collected" value={formatCurrency(data.taxes)} icon={TrendingUp} color="bg-blue-600/20" />
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-4">Top Products</h3>
            {data.topProducts.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No sales this month</p>
            ) : (
              <table className="table">
                <thead><tr><th>Item Code</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
                <tbody>
                  {data.topProducts.map((p, i) => (
                    <tr key={i}>
                      <td className="font-mono text-primary-400">{p.itemCode}</td>
                      <td className="font-medium text-white">{p.itemName}</td>
                      <td>{Number(p.totalQty).toFixed(2)}</td>
                      <td className="font-bold text-emerald-400">{formatCurrency(p.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Quarterly Report ──────────────────────────────────────────────────────────
export function QuarterlyReportPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const currentQ = Math.floor(now.getMonth() / 3) + 1;
  const [quarter, setQuarter] = useState(currentQ);
  const { data, isLoading } = useQuery({
    queryKey: ['report-quarterly', year, quarter],
    queryFn: () => reportsApi.quarterly(year, quarter).then(r => r.data),
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quarterly Report</h1>
          <p className="page-subtitle">Q{quarter} {year}</p>
        </div>
        <div className="flex gap-2 items-center">
          <select className="select w-auto" value={quarter} onChange={e => setQuarter(Number(e.target.value))}>
            {[1,2,3,4].map(q => <option key={q} value={q}>Q{q}</option>)}
          </select>
          <select className="select w-auto" value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {data && (
            <>
              <button onClick={() => exportQuarterlyReportToExcel(year, quarter, data)} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3" title="Export Excel">
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={() => exportQuarterlyReportToPDF(year, quarter, data)} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3" title="Export PDF">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </>
          )}
        </div>
      </div>
      {isLoading ? <ReportSkeleton /> : data ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatCard title="Q Revenue" value={formatCurrency(data.revenue)} icon={IndianRupee} color="bg-primary-600/20" />
            <StatCard title="Prev Quarter" value={formatCurrency(data.previousQuarterRevenue)} icon={TrendingUp} color="bg-slate-600/20" />
            <div className="kpi-card">
              <div className="kpi-icon bg-emerald-600/20">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Growth</p>
                <p className={`text-2xl font-bold ${Number(data.growthPercent) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {Number(data.growthPercent) >= 0 ? '▲' : '▼'} {Math.abs(Number(data.growthPercent)).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Best Sellers</h3>
              {data.bestSellers.slice(0, 8).map((p, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-surface-border/50 last:border-0">
                  <span className="text-sm text-slate-300 truncate">{p.itemName}</span>
                  <span className="text-sm font-semibold text-emerald-400 ml-3">{formatCurrency(p.totalRevenue)}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Category Performance</h3>
              {data.categoryPerformance.map((c, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-surface-border/50 last:border-0">
                  <span className="text-sm text-slate-300">{c.categoryName}</span>
                  <span className="text-sm font-semibold text-primary-400">{formatCurrency(c.totalRevenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Yearly Report ─────────────────────────────────────────────────────────────
export function YearlyReportPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useQuery({
    queryKey: ['report-yearly', year],
    queryFn: () => reportsApi.yearly(year).then(r => r.data),
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Yearly Report</h1>
          <p className="page-subtitle">Annual performance — {year}</p>
        </div>
        <div className="flex gap-2 items-center">
          <select className="select w-auto" value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {data && (
            <>
              <button onClick={() => exportYearlyReportToExcel(year, data)} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3" title="Export Excel">
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={() => exportYearlyReportToPDF(year, data)} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3" title="Export PDF">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </>
          )}
        </div>
      </div>
      {isLoading ? <ReportSkeleton /> : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Annual Revenue" value={formatCurrency(data.revenue)} icon={IndianRupee} color="bg-primary-600/20" />
            <StatCard title="Profit" value={formatCurrency(data.profit)} icon={TrendingUp} color="bg-emerald-600/20" />
            <StatCard title="Tax Collected" value={formatCurrency(data.taxes)} icon={FileText} color="bg-blue-600/20" />
            <StatCard title="Total Discounts" value={formatCurrency(data.discounts)} icon={Tag} color="bg-amber-600/20" />
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-4">Monthly Revenue Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.monthlyBreakdown} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="monthName" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => v.slice(0,3)} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => '₹' + (v/1000) + 'k'} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} labelFormatter={(v: any) => String(v)} />
                <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-4">Top Products of {year}</h3>
            <table className="table">
              <thead><tr><th>Item Code</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
              <tbody>
                {data.topProducts.slice(0, 10).map((p, i) => (
                  <tr key={i}>
                    <td className="font-mono text-primary-400">{p.itemCode}</td>
                    <td className="font-medium text-white">{p.itemName}</td>
                    <td>{Number(p.totalQty).toFixed(2)}</td>
                    <td className="font-bold text-emerald-400">{formatCurrency(p.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Shared subcomponents ────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${color}`}><Icon className="w-6 h-6" /></div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Loading report...</p>
      </div>
    </div>
  );
}
