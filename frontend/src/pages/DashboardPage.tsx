import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, Receipt, Package, Users, AlertTriangle,
  IndianRupee, Calendar, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { dashboardApi } from '../services/apiServices';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

function formatCurrency(n: number = 0) {
  return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n));
}

function KpiCard({ title, value, sub, icon: Icon, color, trend }: {
  title: string; value: string; sub?: string;
  icon: React.ElementType; color: string; trend?: string;
}) {
  return (
    <div className="kpi-card animate-fade-in-up">
      <div className={`kpi-icon ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <div className="text-right">
          <span className="badge-green text-xs">{trend}</span>
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card p-3 text-xs space-y-1 shadow-xl">
        <p className="text-slate-400">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.name === 'revenue' ? '₹' + new Intl.NumberFormat('en-IN').format(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.summary().then(r => r.data),
  });

  const { data: salesTrend = [] } = useQuery({
    queryKey: ['sales-trend'],
    queryFn: () => dashboardApi.salesTrend(30).then(r => r.data),
  });

  const { data: monthlyTrend = [] } = useQuery({
    queryKey: ['monthly-trend'],
    queryFn: () => dashboardApi.monthlyTrend(12).then(r => r.data),
  });

  const { data: topProducts = [] } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => dashboardApi.topProducts(8).then(r => r.data),
  });

  const { data: categoryPerf = [] } = useQuery({
    queryKey: ['category-performance'],
    queryFn: () => dashboardApi.categoryPerformance().then(r => r.data),
  });

  if (loadingSummary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.fullName} 👋</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Low stock alert banner */}
      {(summary?.lowStockProducts ?? 0) > 0 && (
        <Link to="/inventory/low-stock" className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">Low Stock Alert</p>
            <p className="text-xs text-amber-400/70">{summary?.lowStockProducts} products are running low. Click to view.</p>
          </div>
        </Link>
      )}

      {/* KPI Cards — Today */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Today</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Today's Revenue" value={formatCurrency(summary?.todayRevenue)} icon={IndianRupee}
            color="bg-primary-600/20" sub={`${summary?.todayBills || 0} bills`} />
          <KpiCard title="Monthly Revenue" value={formatCurrency(summary?.monthRevenue)} icon={TrendingUp}
            color="bg-emerald-600/20" sub={`${summary?.monthBills || 0} bills this month`} />
          <KpiCard title="Quarter Revenue" value={formatCurrency(summary?.quarterRevenue)} icon={BarChart2}
            color="bg-blue-600/20" />
          <KpiCard title="Annual Revenue" value={formatCurrency(summary?.yearRevenue)} icon={Calendar}
            color="bg-purple-600/20" />
        </div>
      </div>

      {/* Business Metrics */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Business Metrics</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Products"   value={String(summary?.totalProducts || 0)} icon={Package}
            color="bg-cyan-600/20" />
          <KpiCard title="Total Bills"      value={String(summary?.totalBills || 0)}    icon={Receipt}
            color="bg-orange-600/20" />
          <KpiCard title="Total Customers"  value={String(summary?.totalCustomers || 0)} icon={Users}
            color="bg-pink-600/20" />
          <KpiCard title="Low Stock Items"  value={String(summary?.lowStockProducts || 0)} icon={AlertTriangle}
            color="bg-red-600/20" />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Sales Trend */}
        <div className="card col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Daily Sales Trend</h3>
            <span className="badge-blue">Last 30 days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => '₹' + (v / 1000) + 'k'} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Category Performance</h3>
          {categoryPerf.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryPerf} dataKey="totalRevenue" nameKey="categoryName"
                  cx="50%" cy="50%" outerRadius={75} innerRadius={35}
                  paddingAngle={3}>
                  {categoryPerf.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => '₹' + new Intl.NumberFormat('en-IN').format(v)} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue */}
        <div className="card col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Monthly Revenue Trend</h3>
            <span className="badge-purple">Last 12 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => '₹' + (v / 1000) + 'k'} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Products */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Top Selling Products</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 6).map((p, i) => {
                const maxRevenue = topProducts[0]?.totalRevenue || 1;
                const pct = Math.round((p.totalRevenue / maxRevenue) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 truncate flex-1 mr-2">{p.itemName}</span>
                      <span className="text-slate-400 flex-shrink-0">{formatCurrency(p.totalRevenue)}</span>
                    </div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
