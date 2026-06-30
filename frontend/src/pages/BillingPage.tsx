import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Plus, Minus, Trash2, Receipt, Calculator,
  ShoppingCart, User, X, CheckCircle2,
  Loader2, CreditCard, Smartphone, Landmark, Banknote, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { itemsApi, invoicesApi } from '../services/apiServices';
import type { Item, Invoice } from '../types';
import InvoicePrint from '../components/billing/InvoicePrint';

interface CartItem {
  item: Item;
  quantity: number;
  unitPrice: number;
}

const PAYMENT_METHODS = [
  { value: 'CASH',          label: 'Cash',          icon: Banknote },
  { value: 'UPI',           label: 'UPI',           icon: Smartphone },
  { value: 'CARD',          label: 'Card',          icon: CreditCard },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Landmark },
  { value: 'CREDIT',        label: 'Credit',        icon: BookOpen },
];

export default function BillingPage() {
  const qc = useQueryClient();
  const [searchQ, setSearchQ] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<'NONE' | 'PERCENT' | 'FIXED'>('NONE');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: searchResults = [], isLoading: searching } = useQuery({
    queryKey: ['items-search', searchQ],
    queryFn: () => searchQ.length >= 2
      ? itemsApi.search(searchQ).then(r => r.data)
      : Promise.resolve([]),
    enabled: searchQ.length >= 2,
  });

  // Cart calculations
  const subtotal = cart.reduce((sum, ci) => sum + ci.unitPrice * ci.quantity, 0);
  const totalTax = cart.reduce((sum, ci) => {
    const lineSubtotal = ci.unitPrice * ci.quantity;
    return sum + (lineSubtotal * (ci.item.taxPercentage / 100));
  }, 0);

  const discountAmount = (() => {
    const val = parseFloat(discountValue) || 0;
    if (discountType === 'PERCENT') return (subtotal * val) / 100;
    if (discountType === 'FIXED') return val;
    return 0;
  })();

  const formatVal = (v: number) => v % 1 === 0 ? v.toFixed(0) : v.toFixed(1);
  const isPercent = discountType === 'PERCENT';
  const valFloat = parseFloat(discountValue) || 0;

  const kvicVal = valFloat * 15 / 35;
  const kvibVal = valFloat * 10 / 35;
  const instVal = valFloat * 10 / 35;

  const kvicAmt = discountAmount * 15 / 35;
  const kvibAmt = discountAmount * 10 / 35;
  const instAmt = discountAmount * 10 / 35;

  const grandTotal = Math.max(0, subtotal + totalTax - discountAmount);

  const addToCart = (item: Item) => {
    if (item.quantity <= 0) {
      toast.error(`${item.name} is out of stock!`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.quantity) {
          toast.error(`Max stock: ${item.quantity} ${item.unit}`);
          return prev;
        }
        return prev.map(ci => ci.item.id === item.id
          ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { item, quantity: 1, unitPrice: item.sellingPrice }];
    });
    setSearchQ('');
    searchRef.current?.focus();
  };

  const updateQty = (itemId: number, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(ci => ci.item.id !== itemId));
    } else {
      setCart(prev => prev.map(ci => ci.item.id === itemId ? { ...ci, quantity: qty } : ci));
    }
  };

  const updatePrice = (itemId: number, price: number) => {
    setCart(prev => prev.map(ci => ci.item.id === itemId ? { ...ci, unitPrice: price } : ci));
  };

  const createMutation = useMutation({
    mutationFn: () => invoicesApi.create({
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || undefined,
      items: cart.map(ci => ({ itemId: ci.item.id, quantity: ci.quantity, unitPrice: ci.unitPrice })),
      discountType,
      discountValue: parseFloat(discountValue) || 0,
      paymentMethod,
      notes: notes || undefined,
    }),
    onSuccess: (res) => {
      setCompletedInvoice(res.data);
      toast.success(`Bill ${res.data.invoiceNumber} created!`);
      qc.invalidateQueries({ queryKey: ['items'] });
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create bill'),
  });

  const handleCheckout = () => {
    if (cart.length === 0) return toast.error('Cart is empty!');
    createMutation.mutate();
  };

  const handleNewSale = () => {
    setCart([]);
    setCompletedInvoice(null);
    setDiscountType('NONE');
    setDiscountValue('');
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setPaymentMethod('CASH');
    searchRef.current?.focus();
  };

  if (completedInvoice) {
    return <InvoicePrint invoice={completedInvoice} onNewSale={handleNewSale} />;
  }

  return (
    <div className="animate-fade-in-up h-[calc(100vh-7rem)] flex flex-col">
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Billing / POS</h1>
          <p className="page-subtitle">Create new bill</p>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left — Product Search + Cart */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Search */}
          <div className="card p-4">
            <label className="input-label">Search Product (by name or code)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                ref={searchRef}
                type="text"
                className="input pl-9"
                placeholder="Type product name or item code..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                autoFocus
              />
              {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 animate-spin" />}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 border border-surface-border rounded-lg overflow-hidden">
                {searchResults.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-colors text-left border-b border-surface-border/50 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary-400">{item.itemCode}</span>
                        <span className="font-medium text-sm text-white truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className={`text-xs ${item.isLowStock ? 'text-red-400' : 'text-emerald-400'}`}>
                          Stock: {item.quantity} {item.unit}
                        </span>
                        {item.taxPercentage > 0 && (
                          <span className="text-xs text-slate-500">+ {item.taxPercentage}% GST</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-white">₹{Number(item.sellingPrice).toFixed(2)}</div>
                      <div className="text-xs text-slate-500">per {item.unit}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="card flex-1 overflow-y-auto min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Cart
                {cart.length > 0 && <span className="badge-blue">{cart.length} items</span>}
              </h3>
              {cart.length > 0 && (
                <button type="button" onClick={() => setCart([])} className="btn-danger text-xs px-2 py-1">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-500">
                <ShoppingCart className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">Search and add products above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map(ci => (
                  <div key={ci.item.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-surface-border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary-400">{ci.item.itemCode}</span>
                        <span className="text-sm font-medium text-white truncate">{ci.item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{ci.item.taxPercentage}% GST</span>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="w-24">
                      <label className="text-[10px] text-slate-500">Unit Price</label>
                      <input
                        type="number"
                        className="input text-xs px-2 py-1"
                        value={ci.unitPrice}
                        onChange={e => updatePrice(ci.item.id, Number(e.target.value))}
                        min="0" step="0.01"
                      />
                    </div>

                    {/* Qty Controls */}
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => updateQty(ci.item.id, ci.quantity - 1)} className="btn-icon w-7 h-7">
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        className="w-14 text-center input text-xs px-1 py-1"
                        value={ci.quantity}
                        onChange={e => updateQty(ci.item.id, Number(e.target.value))}
                        min="0.001" step="0.001"
                      />
                      <button type="button" onClick={() => updateQty(ci.item.id, ci.quantity + 1)} className="btn-icon w-7 h-7">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="w-24 text-right">
                      <div className="text-sm font-bold text-white">
                        ₹{(ci.unitPrice * ci.quantity + ci.unitPrice * ci.quantity * ci.item.taxPercentage / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500">
                        incl. tax
                      </div>
                    </div>

                    <button type="button" onClick={() => setCart(p => p.filter(c => c.item.id !== ci.item.id))} className="btn-icon text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Summary + Checkout */}
        <div className="w-80 flex flex-col gap-4">
          {/* Customer Info */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Customer</h3>
            <div className="space-y-3">
              <div>
                <label className="input-label">Name</label>
                <input className="input" placeholder="Walk-in Customer" value={customerName}
                  onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div>
                <label className="input-label">Phone</label>
                <input className="input" placeholder="Phone number" value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Discount */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Calculator className="w-4 h-4" /> Discount</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                {(['NONE', 'PERCENT', 'FIXED'] as const).map(t => (
                  <button type="button" key={t} onClick={() => { setDiscountType(t); if (t === 'NONE') setDiscountValue(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      discountType === t ? 'bg-primary-600 text-white' : 'bg-surface text-slate-400 border border-surface-border hover:text-slate-200'
                    }`}>
                    {t === 'NONE' ? 'None' : t === 'PERCENT' ? '% Off' : '₹ Off'}
                  </button>
                ))}
              </div>
              {discountType !== 'NONE' && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    {discountType === 'PERCENT' ? '%' : '₹'}
                  </span>
                  <input type="number" className="input pl-7" value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)} min="0"
                    max={discountType === 'PERCENT' ? 100 : subtotal} />
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map(pm => (
                <button type="button" key={pm.value} onClick={() => setPaymentMethod(pm.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    paymentMethod === pm.value
                      ? 'bg-primary-600/20 text-primary-300 border border-primary-600/40'
                      : 'bg-surface text-slate-400 border border-surface-border hover:text-slate-200'
                  }`}>
                  <pm.icon className="w-4 h-4" />
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="card flex-1">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Receipt className="w-4 h-4" /> Summary</h3>
            <div className="flex gap-3 items-start">
              {/* Left Column - Split Discount */}
              {discountAmount > 0 && (
                <div className="w-[85px] text-[10px] font-mono text-emerald-400 space-y-1.5 border-r border-surface-border pr-2 mt-1">
                  <div>KVIC ({isPercent ? `${formatVal(kvicVal)}%` : `15/35`}):<br/>-₹{kvicAmt.toFixed(2)}</div>
                  <div>KVIB ({isPercent ? `${formatVal(kvibVal)}%` : `10/35`}):<br/>-₹{kvibAmt.toFixed(2)}</div>
                  <div>Inst ({isPercent ? `${formatVal(instVal)}%` : `10/35`}):<br/>-₹{instAmt.toFixed(2)}</div>
                </div>
              )}

              {/* Right Column - Totals */}
              <div className="flex-1 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 text-xs">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Tax (GST)</span>
                  <span>₹{totalTax.toFixed(2)}</span>
                </div>
                <div className="border-t border-surface-border pt-2 flex justify-between font-bold text-base text-white">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="input-label">Notes</label>
              <textarea className="input resize-none text-xs" rows={2} value={notes}
                onChange={e => setNotes(e.target.value)} placeholder="Optional note..." />
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || createMutation.isPending}
              className="btn-success w-full justify-center py-3 mt-4 text-base"
            >
              {createMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                : <><CheckCircle2 className="w-4 h-4" /> Generate Bill — ₹{grandTotal.toFixed(2)}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
