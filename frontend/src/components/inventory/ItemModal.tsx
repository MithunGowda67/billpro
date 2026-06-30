import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { itemsApi } from '../../services/apiServices';
import type { Item } from '../../types';

interface Props {
  item: Item | null;
  onClose: () => void;
  onSaved: () => void;
}

const UNITS = ['PIECE', 'METER', 'KG', 'NOS'];

export default function ItemModal({ item, onClose, onSaved }: Props) {
  const isEdit = !!item;

  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    purchasePrice: item?.purchasePrice || '',
    sellingPrice: item?.sellingPrice || '',
    quantity: item?.quantity || '',
    unit: item?.unit || 'PIECE',
    taxPercentage: item?.taxPercentage ?? 18,
    minStockThreshold: item?.minStockThreshold ?? 10,
    isActive: item?.isActive ?? true,
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: (payload?: any) => isEdit
      ? itemsApi.update(item!.id, payload || form as any)
      : itemsApi.create(payload || form as any),
    onSuccess: () => {
      toast.success(isEdit ? 'Item updated!' : 'Item created!');
      onSaved();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to save item'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Item name is required');
    if (!form.purchasePrice) return toast.error('Purchase price is required');
    if (!form.sellingPrice) return toast.error('Selling price is required');
    if (!form.quantity && !isEdit) return toast.error('Opening stock quantity is required');

    // Convert string inputs to numbers before sending
    const payload = {
      ...form,
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      quantity: Number(form.quantity) || 0,
      minStockThreshold: Number(form.minStockThreshold) || 10,
    };

    mutation.mutate(payload as any);
  };

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal max-w-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? 'Edit Item' : 'Add New Item'}
          </h2>
          {isEdit && (
            <span className="badge-blue font-mono">{item.itemCode}</span>
          )}
          <button onClick={onClose} className="btn-icon ml-auto">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="input-label">Item Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Cotton Fabric" />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="input-label">Description</label>
              <textarea className="input resize-none" rows={2} value={form.description}
                onChange={e => set('description', e.target.value)} placeholder="Optional description" />
            </div>



            {/* Unit */}
            <div>
              <label className="input-label">Unit</label>
              <select className="select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            {/* Purchase Price */}
            <div>
              <label className="input-label">Purchase Price (₹) *</label>
              <input type="number" className="input" step="0.01" min="0" value={form.purchasePrice}
                onChange={e => set('purchasePrice', e.target.value)} placeholder="0.00" />
            </div>

            {/* Selling Price */}
            <div>
              <label className="input-label">Selling Price (₹) *</label>
              <input type="number" className="input" step="0.01" min="0" value={form.sellingPrice}
                onChange={e => set('sellingPrice', e.target.value)} placeholder="0.00" />
            </div>

            {/* Quantity */}
            <div>
              <label className="input-label">Opening Stock Quantity</label>
              <input type="number" className="input" step="0.001" min="0" value={form.quantity}
                onChange={e => set('quantity', e.target.value)} placeholder="0" />
            </div>

            {/* Min Stock Threshold */}
            <div>
              <label className="input-label">Low Stock Alert At</label>
              <input type="number" className="input" step="0.001" min="0" value={form.minStockThreshold}
                onChange={e => set('minStockThreshold', e.target.value)} placeholder="10" />
            </div>

            {/* Tax % */}
            <div>
              <label className="input-label">Tax Percentage (%)</label>
              <select className="select" value={form.taxPercentage} onChange={e => set('taxPercentage', Number(e.target.value))}>
                {[0, 5, 12, 18, 28].map(t => <option key={t} value={t}>{t}% GST</option>)}
              </select>
            </div>

            {/* Active */}
            {isEdit && (
              <div className="flex items-center gap-3 pt-5">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only" checked={form.isActive}
                    onChange={e => set('isActive', e.target.checked)} />
                  <div className={`w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-primary-600' : 'bg-surface-border'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 mx-0.5 ${form.isActive ? 'translate-x-5' : ''}`} />
                  </div>
                </label>
                <span className="text-sm text-slate-300">Active</span>
              </div>
            )}
          </div>

          {/* Profit indicator */}
          {form.purchasePrice && form.sellingPrice && (
            <div className="p-3 rounded-lg bg-surface border border-surface-border">
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Margin: </span>
                  <span className={Number(form.sellingPrice) > Number(form.purchasePrice) ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                    ₹{(Number(form.sellingPrice) - Number(form.purchasePrice)).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Margin %: </span>
                  <span className="text-slate-300">
                    {Number(form.purchasePrice) > 0
                      ? (((Number(form.sellingPrice) - Number(form.purchasePrice)) / Number(form.purchasePrice)) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-border">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
