import { Sun, Moon, Bell, Search, LogOut } from 'lucide-react';
import { useAuth, useTheme, useStore } from '../../store/useStore';
import { METAL_RATES } from '../../data/seedData';
import { formatCurrency } from '../../utils/formatters';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { data: apiRates } = useStore('metalRates');
  const rates = apiRates && Object.keys(apiRates).length > 0 ? apiRates : METAL_RATES;
  const initials = (user?.username || 'US').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b bg-bg-secondary border-border-primary backdrop-blur-xl">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          placeholder="Search items, customers, invoices..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-bg-primary border border-border-subtle rounded-xl focus:outline-none focus:border-border-primary transition-colors text-text-primary placeholder:text-text-tertiary"
        />
      </div>

      {/* Metal Rates Ticker */}
      <div className="hidden md:flex items-center gap-4 mx-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-[rgba(218,165,32,0.08)] border-[rgba(218,165,32,0.15)]">
          <span className="text-[10px] font-bold uppercase text-text-tertiary">Gold 24K</span>
          <span className="text-xs font-mono font-semibold gold-text">{formatCurrency(rates.gold_24k)}/g</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-[rgba(192,192,192,0.06)] border-[rgba(192,192,192,0.12)]">
          <span className="text-[10px] font-bold uppercase text-text-tertiary">Silver</span>
          <span className="text-xs font-mono font-semibold text-[#C0C0C0]">{formatCurrency(rates.silver_999)}/g</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl transition-colors duration-200 hover:bg-bg-tertiary text-text-secondary">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-ruby-500"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl transition-colors duration-200 hover:bg-bg-tertiary text-text-secondary"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-border-subtle">
          <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center shadow-lg">
            <span className="text-xs font-bold text-dark-900">{initials}</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-text-primary">{user?.username || 'User'}</p>
            <p className="text-[10px] text-text-tertiary">{user?.role === 'admin' ? 'Administrator' : 'Staff'}</p>
          </div>
          <button
            onClick={logout}
            className="ml-2 p-2 rounded-lg transition-colors hover:bg-bg-tertiary text-text-tertiary"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
