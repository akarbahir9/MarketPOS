import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { t } from '../../constants/translations';
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Truck,
  Wallet,
  LogOut,
  Store,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const navLinks = [
  { href: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
  { href: '/invoices', label: t.invoices, icon: FileText },
  { href: '/products', label: t.products, icon: Package },
  { href: '/customers', label: t.customers, icon: Users },
  { href: '/suppliers', label: t.suppliers, icon: Truck },
  { href: '/expenses', label: t.expenses, icon: Wallet },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col border-s border-border bg-surface md:flex">
      <div className="flex h-16 flex-shrink-0 items-center px-6">
        <a href="/dashboard" className="flex items-center gap-3">
          <Store className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-text-primary">{t.posSystem}</span>
        </a>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-gray-700 hover:text-text-primary'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-border p-4">
        <div className="mb-4">
            <p className="text-sm font-medium text-text-primary truncate">{profile?.username || '...'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-700 hover:text-text-primary"
        >
          <LogOut className="h-5 w-5" />
          <span>{t.logout}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
