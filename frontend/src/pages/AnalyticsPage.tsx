import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/apiServices';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Award, AlertTriangle, Zap } from 'lucide-react';

function formatCurrency(n: number = 0) {
  return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n));
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(12);

  const { data: monthlyTrend = [] } = useQuery({
    queryKey: ['monthly-trend', period],
    queryFn: () => dashboardApi.monthlyTrend(period).then(r => r.data),
  });

  const { data: topProducts = [] } = useQuery({
    queryKey: ['top-products-all'],
    queryFn: () => dashboardApi.topProducts(20).then(r => r.data),
  });

  const { data: catPerf = [] } = useQuery({
    queryKey: ['category-performance'],
    queryFn: () => dashboardApi.categoryPerformance().then(r => r.data),
  });

  const bestSellers = topProducts.slice(0, 10);
  const slowMovers = [...topProducts].sort((a, b) => Number(a.totalQty) - Number(b.totalQty)).slice(0, 5);
  const fastMovers = topProducts.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Business insights and trends</p>
        </div>
        <select className="select w-auto" value={period} onChange={e => setPeriod(Number(e.target.value))}>
          <option value={3}>Last 3 months</option>
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
        </select>
      </div>

      {/* Revenue & Profit Trend */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-400" /> Revenue Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => '₹' + v / 1000 + 'k'} />
            <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Three analytics cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Best Sellers */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Best Sellers
          </h3>
          {bestSellers.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-500/20 text-slate-400' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-surface text-slate-500'}
                  `}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{p.itemName}</p>
                    <p className="text-xs text-slate-500">{Number(p.totalQty).toFixed(1)} units sold</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">{formatCurrency(p.totalRevenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Slow Movers */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Slow Movers
          </h3>
          {slowMovers.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-3">
              {slowMovers.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{p.itemName}</p>
                    <p className="text-xs text-slate-500">Only {Number(p.totalQty).toFixed(1)} units sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fast Movers */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" /> Fast Movers
          </h3>
          {fastMovers.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-3">
              {fastMovers.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{p.itemName}</p>
                    <p className="text-xs text-emerald-500">{Number(p.totalQty).toFixed(1)} units · {formatCurrency(p.totalRevenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Performance Chart */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">Category Performance</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={catPerf} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => '₹' + v / 1000 + 'k'} />
            <YAxis type="category" dataKey="categoryName" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
            <Bar dataKey="totalRevenue" name="Revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
