import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Receipt, Users, BarChart3,
  Settings, LogOut, ChevronLeft, ChevronRight, ShoppingBag,
  TrendingUp, User, AlertTriangle, FileText
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/apiServices';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  adminOnly?: boolean;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Inventory',  icon: Package,          path: '/inventory' },
  { label: 'Billing',    icon: Receipt,           path: '/billing' },
  { label: 'Bills',      icon: FileText,          path: '/billing/history' },
  { label: 'Customers',  icon: Users,             path: '/customers' },
  { label: 'Reports',    icon: BarChart3,         path: '/reports/daily', adminOnly: true },
  { label: 'Analytics',  icon: TrendingUp,        path: '/analytics', adminOnly: true },
];

const SETTINGS_ITEMS: NavItem[] = [
  { label: 'Company',    icon: Settings,          path: '/settings/company', adminOnly: true },
  { label: 'Users',      icon: User,              path: '/settings/users', adminOnly: true },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.summary().then(r => r.data),
    refetchInterval: 60000,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f1e]">
      {/* Sidebar */}
      <aside className={`
        flex flex-col bg-surface-card border-r border-surface-border
        transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Logo */}
        <div className={`flex items-center border-b border-surface-border h-16 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-600/30 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">BillPro</p>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5 truncate max-w-[120px]">
                  {user?.companyName}
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-600/30 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary-400" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`btn-icon flex-shrink-0 ${collapsed ? 'hidden' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="flex justify-center py-2 text-slate-500 hover:text-slate-300">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {!collapsed && <p className="text-[10px] text-slate-600 uppercase tracking-widest px-3 py-2">Menu</p>}
          {NAV_ITEMS.filter(item => !item.adminOnly || user?.role === 'ADMIN').map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={isActive(item.path) ? 'sidebar-link-active' : 'sidebar-link'}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.label === 'Inventory' && (summary?.lowStockProducts ?? 0) > 0 && (
                <span className="badge-red text-[10px] px-1.5">
                  {summary?.lowStockProducts}
                </span>
              )}
            </Link>
          ))}

          {user?.role === 'ADMIN' && (
            <>
              {!collapsed && <p className="text-[10px] text-slate-600 uppercase tracking-widest px-3 py-2 mt-4">Settings</p>}
              {SETTINGS_ITEMS.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={isActive(item.path) ? 'sidebar-link-active' : 'sidebar-link'}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-surface-border p-2">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary-300">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="btn-icon text-slate-500 hover:text-red-400" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="sidebar-link w-full justify-center text-red-400 hover:text-red-300" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 h-16 bg-[#0a0f1e]/80 backdrop-blur border-b border-surface-border flex items-center justify-between px-6">
          <div>
            <h2 className="text-sm font-medium text-slate-300 capitalize">
              {location.pathname.replace('/','').replace('/', ' › ') || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {(summary?.lowStockProducts ?? 0) > 0 && (
              <Link to="/inventory/low-stock" className="flex items-center gap-1.5 badge-yellow cursor-pointer text-xs">
                <AlertTriangle className="w-3 h-3" />
                {summary?.lowStockProducts} Low Stock
              </Link>
            )}
            <div className="text-xs text-slate-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
