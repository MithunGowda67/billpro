import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { companyApi } from '../services/apiServices';
import { Save, Loader2, Building2 } from 'lucide-react';
import type { Company } from '../types';

export default function CompanySettingsPage() {
  const qc = useQueryClient();
  const { data: company, isLoading } = useQuery({
    queryKey: ['company'],
    queryFn: () => companyApi.get().then(r => r.data),
  });

  const [form, setForm] = useState<Partial<Company>>({});

  const currentData = { ...company, ...form };
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => companyApi.update(form),
    onSuccess: () => {
      toast.success('Company settings saved!');
      qc.invalidateQueries({ queryKey: ['company'] });
      setForm({});
    },
    onError: () => toast.error('Failed to save settings'),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Building2 className="w-7 h-7 text-primary-400" /> Company Settings
          </h1>
          <p className="page-subtitle">Changes reflect on all bills automatically</p>
        </div>
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending || Object.keys(form).length === 0}
          className="btn-primary">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold text-white border-b border-surface-border pb-3">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="input-label">Company Name *</label>
            <input className="input" value={currentData.name || ''} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="input-label">Address</label>
            <textarea className="input resize-none" rows={2} value={currentData.address || ''}
              onChange={e => set('address', e.target.value)} />
          </div>
          <div>
            <label className="input-label">City</label>
            <input className="input" value={currentData.city || ''} onChange={e => set('city', e.target.value)} />
          </div>
          <div>
            <label className="input-label">State</label>
            <input className="input" value={currentData.state || ''} onChange={e => set('state', e.target.value)} />
          </div>
          <div>
            <label className="input-label">Pincode</label>
            <input className="input" value={currentData.pincode || ''} onChange={e => set('pincode', e.target.value)} />
          </div>
          <div>
            <label className="input-label">Phone</label>
            <input className="input" value={currentData.phone || ''} onChange={e => set('phone', e.target.value)} />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input type="email" className="input" value={currentData.email || ''} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="input-label">GSTIN Number</label>
            <input className="input font-mono" value={currentData.gstNumber || ''} onChange={e => set('gstNumber', e.target.value)}
              placeholder="27AAPFU0939F1ZV" />
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold text-white border-b border-surface-border pb-3">Bill Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="input-label">Bill Prefix</label>
            <input className="input" value={currentData.invoicePrefix || 'INV'}
              onChange={e => set('invoicePrefix', e.target.value)} placeholder="INV" />
            <p className="text-xs text-slate-500 mt-1">e.g. INV → INV-2026-000001</p>
          </div>
          <div>
            <label className="input-label">Currency Symbol</label>
            <input className="input" value={currentData.currencySymbol || '₹'}
              onChange={e => set('currencySymbol', e.target.value)} placeholder="₹" />
          </div>
          <div>
            <label className="input-label">Default Tax Rate (%)</label>
            <input type="number" className="input" value={currentData.taxRateDefault ?? 18}
              onChange={e => set('taxRateDefault', Number(e.target.value))} min="0" max="100" step="0.01" />
          </div>
        </div>
        <div>
          <label className="input-label">Bill Footer Message</label>
          <textarea className="input resize-none" rows={2} value={currentData.invoiceFooter || ''}
            onChange={e => set('invoiceFooter', e.target.value)}
            placeholder="Thank you for your business!" />
        </div>
      </div>

      {/* Preview */}
      <div className="card bg-surface/50">
        <h3 className="font-semibold text-slate-300 mb-3 text-sm">Bill Number Preview</h3>
        <div className="font-mono text-primary-300 text-lg">
          {currentData.invoicePrefix || 'INV'}-{new Date().getFullYear()}-000001
        </div>
      </div>
    </div>
  );
}
