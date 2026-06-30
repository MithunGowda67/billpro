import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { invoicesApi } from '../services/apiServices';

const PAYMENT_METHODS = ['', 'CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CREDIT'];

export default function InvoiceHistoryPage() {
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', { search, paymentMethod, from, to, page }],
    queryFn: () => invoicesApi.list({
      invoiceNumber: search || undefined,
      paymentMethod: paymentMethod || undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to + 'T23:59:59').toISOString() : undefined,
      page,
      size: 20,
    }).then(r => r.data),
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bill History</h1>
          <p className="page-subtitle">{data?.totalElements || 0} bills total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input className="input pl-9" placeholder="Search bill number..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <select className="select w-auto" value={paymentMethod} onChange={e => { setPaymentMethod(e.target.value); setPage(0); }}>
          <option value="">All Payment Methods</option>
          {PAYMENT_METHODS.filter(Boolean).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="date" className="input w-auto" value={from} onChange={e => { setFrom(e.target.value); setPage(0); }}
          placeholder="From date" />
        <input type="date" className="input w-auto" value={to} onChange={e => { setTo(e.target.value); setPage(0); }}
          placeholder="To date" />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (data?.content.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <Receipt className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No bills found</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date & Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.content.map(inv => (
                <tr key={inv.id}>
                  <td>
                    <span className="font-mono text-primary-400 text-sm">{inv.invoiceNumber}</span>
                  </td>
                  <td className="font-medium text-slate-200">{inv.customerName || 'Walk-in'}</td>
                  <td className="font-bold text-white">₹{Number(inv.grandTotal).toFixed(2)}</td>
                  <td><span className="badge-blue text-xs">{inv.paymentMethod}</span></td>
                  <td>
                    {inv.paymentStatus === 'PAID'
                      ? <span className="badge-green">Paid</span>
                      : <span className="badge-yellow">Pending</span>}
                  </td>
                  <td className="text-slate-500 text-xs">
                    {new Date(inv.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <Link to={`/billing/invoice/${inv.id}`} className="btn-secondary text-xs px-2 py-1">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {page + 1} of {data.totalPages} · {data.totalElements} bills
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-secondary text-xs px-3 py-1">← Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages - 1} className="btn-secondary text-xs px-3 py-1">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
