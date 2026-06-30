import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '../services/apiServices';
import InvoicePrint from '../components/billing/InvoicePrint';
import { ArrowLeft } from 'lucide-react';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.get(Number(id)).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <p>Bill not found</p>
        <button onClick={() => navigate('/billing/history')} className="btn-secondary mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate('/billing/history')} className="btn-secondary mb-4 print:hidden">
        <ArrowLeft className="w-4 h-4" /> Back to History
      </button>
      <InvoicePrint invoice={invoice} onNewSale={() => navigate('/billing')} />
    </div>
  );
}
