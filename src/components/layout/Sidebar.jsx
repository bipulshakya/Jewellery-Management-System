import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  ClipboardList, Truck, Wrench, Calculator, Settings,
  ChevronLeft, ChevronRight, Gem
} from 'lucide-react';

const navItems = [
  { label: 'Core', items: [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/pos', icon: ShoppingCart, label: 'POS / Billing' },
    { path: '/customers', icon: Users, label: 'Customers' },
  ]},
  { label: 'Operations', items: [
    { path: '/orders', icon: ClipboardList, label: 'Orders' },
    { path: '/purchases', icon: Truck, label: 'Purchases' },
    { path: '/repairs', icon: Wrench, label: 'Repairs' },
  ]},
  { label: 'Finance', items: [
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/accounting', icon: Calculator, label: 'Accounting' },
  ]},
  { label: 'System', items: [
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out flex flex-col ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
          <Gem size={20} color="#0F0F1A" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-[11px] font-bold gold-text whitespace-nowrap">Shreehans RKS Khushi</h1>
            <p className="text-[10px] whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>Jewellers • ERP System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                {group.label}
              </span>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'sidebar-active'
                        : 'hover:bg-[var(--bg-tertiary)]'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'rgba(218, 165, 32, 0.1)' : undefined,
                    color: isActive ? '#DAA520' : 'var(--text-secondary)',
                  })}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={20} strokeWidth={1.8} className="flex-shrink-0" />
                  {!collapsed && <span className="sidebar-text">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center p-3 mx-3 mb-4 rounded-xl transition-all duration-200 hover:bg-[var(--bg-tertiary)]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
      </button>
    </aside>
  );
}
