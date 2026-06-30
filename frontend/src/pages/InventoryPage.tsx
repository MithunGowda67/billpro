import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertTriangle, RefreshCw, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { itemsApi } from '../services/apiServices';
import type { Item } from '../types';
import { useAuthStore } from '../store/authStore';
import ItemModal from '../components/inventory/ItemModal';

export default function InventoryPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['items', { search, page }],
    queryFn: () => itemsApi.list({ search: search || undefined, page, size: 15 }).then(r => r.data),
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => itemsApi.lowStock().then(r => r.data),
    enabled: showLowStock,
  });

  const deleteMutation = useMutation({
    mutationFn: itemsApi.delete,
    onSuccess: () => {
      toast.success('Item deleted successfully');
      qc.invalidateQueries({ queryKey: ['items'] });
    },
    onError: () => toast.error('Failed to delete item'),
  });

  const handleDelete = (item: Item) => {
    if (confirm(`Delete "${item.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const displayItems = showLowStock ? lowStockItems : (data?.content || []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">
            {data?.totalElements || 0} total items
            {(lowStockItems.length > 0) && !showLowStock && (
              <span className="ml-2 badge-yellow">
                <AlertTriangle className="w-3 h-3" /> {lowStockItems.length} low stock
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLowStock(s => !s)}
            className={showLowStock ? 'btn-primary' : 'btn-secondary'}
          >
            <AlertTriangle className="w-4 h-4" />
            {showLowStock ? 'Show All' : 'Low Stock'}
          </button>
          <button onClick={() => refetch()} className="btn-icon" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setSelectedItem(null); setShowModal(true); }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Search by name or item code..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <Package className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Name</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Tax %</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <span className="font-mono text-xs text-primary-400">{item.itemCode}</span>
                  </td>
                  <td className="font-medium text-slate-200">{item.name}</td>
                  <td className="text-slate-400">₹{Number(item.purchasePrice).toFixed(2)}</td>
                  <td className="font-semibold text-white">₹{Number(item.sellingPrice).toFixed(2)}</td>
                  <td>
                    <span className={item.isLowStock ? 'text-red-400 font-semibold' : 'text-emerald-400'}>
                      {Number(item.quantity).toFixed(2)}
                      {item.isLowStock && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                    </span>
                  </td>
                  <td className="text-slate-400">{item.unit}</td>
                  <td className="text-slate-400">{item.taxPercentage}%</td>
                  <td>
                    {item.isActive
                      ? <span className="badge-green">Active</span>
                      : <span className="badge-gray">Inactive</span>}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setSelectedItem(item); setShowModal(true); }}
                        className="btn-icon text-primary-400"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(item)}
                          className="btn-icon text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!showLowStock && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {page * 15 + 1}–{Math.min((page + 1) * 15, data.totalElements)} of {data.totalElements}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-secondary text-xs px-3 py-1">← Prev</button>
            <span className="text-xs text-slate-400 self-center">Page {page + 1} of {data.totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages - 1} className="btn-secondary text-xs px-3 py-1">Next →</button>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showModal && (
        <ItemModal
          item={selectedItem}
          onClose={() => { setShowModal(false); setSelectedItem(null); }}
          onSaved={() => {
            setShowModal(false);
            setSelectedItem(null);
            qc.invalidateQueries({ queryKey: ['items'] });
            qc.invalidateQueries({ queryKey: ['low-stock'] });
          }}
        />
      )}
    </div>
  );
}
