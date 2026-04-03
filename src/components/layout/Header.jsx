import { Sun, Moon, Bell, Search } from 'lucide-react';
import { useTheme } from '../../store/useStore';
import { METAL_RATES } from '../../data/seedData';
import { formatCurrency } from '../../utils/formatters';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const rates = JSON.parse(localStorage.getItem('metalRates')) || METAL_RATES;

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          placeholder="Search items, customers, invoices..."
          className="form-input pl-10 text-sm"
          style={{ background: 'var(--bg-primary)', borderRadius: '12px' }}
        />
      </div>

      {/* Metal Rates Ticker */}
      <div className="hidden md:flex items-center gap-4 mx-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(218, 165, 32, 0.08)', border: '1px solid rgba(218, 165, 32, 0.15)' }}>
          <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Gold 24K</span>
          <span className="text-xs font-mono font-semibold gold-text">{formatCurrency(rates.gold_24k)}/g</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(192, 192, 192, 0.06)', border: '1px solid rgba(192, 192, 192, 0.12)' }}>
          <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Silver</span>
          <span className="text-xs font-mono font-semibold" style={{ color: '#C0C0C0' }}>{formatCurrency(rates.silver_999)}/g</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-xl transition-colors duration-200 hover:bg-[var(--bg-tertiary)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl transition-colors duration-200 hover:bg-[var(--bg-tertiary)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 ml-2 pl-3 border-l" style={{ borderColor: 'var(--border-color-subtle)' }}>
          <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
            <span className="text-xs font-bold text-[#0F0F1A]">AD</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Admin</p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
