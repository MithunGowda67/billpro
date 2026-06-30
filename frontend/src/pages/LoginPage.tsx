import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../services/apiServices';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const mutation = useMutation({
    mutationFn: () => authApi.login(form.username, form.password),
    onSuccess: (res) => {
      const data = res.data;
      login(data.token, {
        id: data.userId,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        companyId: data.companyId,
        companyName: data.companyName,
      });
      toast.success(`Welcome back, ${data.fullName}!`);
      navigate('/dashboard');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md animate-fade-in-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/20 border border-primary-600/30 mb-4 animate-pulse-glow">
            <ShoppingBag className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">BillPro</h1>
          <p className="text-slate-400 mt-1 text-sm">Inventory & Billing Management</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Username or Email</label>
              <input
                id="username"
                type="text"
                className="input"
                placeholder="admin"
                value={form.username}
                onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-surface border border-surface-border">
            <p className="text-xs text-slate-400 font-medium mb-2">Demo Credentials</p>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Admin: <span className="text-slate-300">admin / admin123</span></p>
              <p className="text-xs text-slate-500">Staff: <span className="text-slate-300">staff / admin123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
