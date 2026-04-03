import { useState } from 'react';
import { Settings as SettingsIcon, Store, Users, DollarSign, Bell, Database, Save } from 'lucide-react';
import { useStore, useToast, useTheme } from '../store/useStore';
import { METAL_RATES, STORE_INFO } from '../data/seedData';
import { formatCurrency } from '../utils/formatters';

const TABS = [
  { id: 'store', label: 'Store Info', icon: Store },
  { id: 'rates', label: 'Metal Rates', icon: DollarSign },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'backup', label: 'Data', icon: Database },
];

export default function Settings() {
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('store');

  const [storeInfo, setStoreInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jerp_storeInfo')) || STORE_INFO; }
    catch { return STORE_INFO; }
  });

  const [rates, setRates] = useState(() => {
    try { return JSON.parse(localStorage.getItem('metalRates')) || METAL_RATES; }
    catch { return METAL_RATES; }
  });

  const saveStoreInfo = () => {
    localStorage.setItem('jerp_storeInfo', JSON.stringify(storeInfo));
    addToast('Store information saved', 'success');
  };

  const saveRates = () => {
    localStorage.setItem('metalRates', JSON.stringify(rates));
    addToast('Metal rates updated', 'success');
  };

  const resetData = () => {
    if (window.confirm('This will reset ALL data to defaults. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('jerp_') || key === 'metalRates') {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'jewellery-erp-backup.json'; a.click();
    addToast('Backup exported', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm mt-1 text-text-tertiary">Configure your store and system preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Settings Nav */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${activeTab === tab.id ? 'sidebar-active' : ''}`}
              style={{
                background: activeTab === tab.id ? 'rgba(218,165,32,0.1)' : 'transparent',
                color: activeTab === tab.id ? '#DAA520' : 'var(--text-secondary)',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Store Info */}
          {activeTab === 'store' && (
            <div className="glass-card-static p-6 space-y-4">
              <h3 className="text-lg font-bold text-text-primary">Store Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Store Name (English)</label>
                  <input type="text" className="form-input" value={storeInfo.name} onChange={e => setStoreInfo({ ...storeInfo, name: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Store Name (नेपाली)</label>
                  <input type="text" className="form-input" value={storeInfo.nameNp} onChange={e => setStoreInfo({ ...storeInfo, nameNp: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-input" value={storeInfo.address} onChange={e => setStoreInfo({ ...storeInfo, address: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-input" value={storeInfo.phone} onChange={e => setStoreInfo({ ...storeInfo, phone: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Mobile</label>
                  <input type="text" className="form-input" value={storeInfo.mobile} onChange={e => setStoreInfo({ ...storeInfo, mobile: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Email</label>
                  <input type="text" className="form-input" value={storeInfo.email} onChange={e => setStoreInfo({ ...storeInfo, email: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">PAN Number</label>
                  <input type="text" className="form-input" value={storeInfo.pan} onChange={e => setStoreInfo({ ...storeInfo, pan: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">VAT Number</label>
                  <input type="text" className="form-input" value={storeInfo.vatNo} onChange={e => setStoreInfo({ ...storeInfo, vatNo: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-color-subtle">
                <button className="btn btn-primary" onClick={saveStoreInfo}>
                  <Save size={14} /> Save Store Info
                </button>
              </div>
            </div>
          )}

          {/* Metal Rates */}
          {activeTab === 'rates' && (
            <div className="glass-card-static p-6 space-y-4">
              <h3 className="text-lg font-bold text-text-primary">Metal Rates (per gram)</h3>
              <p className="text-xs text-text-tertiary">Update current market rates. Changes will affect all price calculations.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'gold_24k', label: 'Gold 24K (Pure)', color: '#DAA520' },
                  { key: 'gold_22k', label: 'Gold 22K', color: '#DAA520' },
                  { key: 'gold_18k', label: 'Gold 18K', color: '#DAA520' },
                  { key: 'gold_14k', label: 'Gold 14K', color: '#DAA520' },
                  { key: 'silver_999', label: 'Silver 999', color: '#C0C0C0' },
                  { key: 'silver_925', label: 'Silver 925', color: '#C0C0C0' },
                  { key: 'platinum', label: 'Platinum', color: '#B0C4DE' },
                ].map(rate => (
                  <div key={rate.key}>
                    <label className="form-label" style={{ color: rate.color }}>{rate.label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-tertiary">रू</span>
                      <input
                        type="number"
                        className="form-input pl-8 font-mono"
                        value={rates[rate.key]}
                        onChange={e => setRates({ ...rates, [rate.key]: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-color-subtle">
                <button className="btn btn-secondary" onClick={() => { setRates(METAL_RATES); addToast('Rates reset to defaults', 'info'); }}>
                  Reset to Default
                </button>
                <button className="btn btn-primary" onClick={saveRates}>
                  <Save size={14} /> Save Rates
                </button>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div className="glass-card-static p-6">
              <h3 className="text-lg font-bold mb-4 text-text-primary">User Roles & Permissions</h3>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>User</th><th>Role</th><th>Access</th><th>Status</th></tr></thead>
                  <tbody>
                    {[
                      { name: 'Admin', role: 'Administrator', access: 'Full Access', active: true },
                      { name: 'Ram Countersales', role: 'Sales Staff', access: 'POS, Inventory (view)', active: true },
                      { name: 'Sita Accountant', role: 'Accountant', access: 'Reports, Accounting', active: true },
                      { name: 'Hari Manager', role: 'Karigar Manager', access: 'Orders, Repairs', active: false },
                    ].map((user, i) => (
                      <tr key={i}>
                        <td className="font-semibold text-sm">{user.name}</td>
                        <td><span className="badge badge-gold">{user.role}</span></td>
                        <td className="text-xs">{user.access}</td>
                        <td><span className={`badge ${user.active ? 'badge-emerald' : 'badge-ruby'}`}>{user.active ? 'Active' : 'Inactive'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4"><span className="badge badge-gold">User management coming soon</span></div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="glass-card-static p-6 space-y-4">
              <h3 className="text-lg font-bold text-text-primary">Notification Settings</h3>
              <div className="space-y-3">
                {[
                  { label: 'Low stock alerts', desc: 'Get notified when items fall below reorder point', enabled: true },
                  { label: 'Order completion', desc: 'Notify when custom orders are ready', enabled: true },
                  { label: 'Customer birthdays', desc: 'Daily reminder for upcoming customer birthdays', enabled: false },
                  { label: 'Payment reminders', desc: 'Remind about outstanding customer balances', enabled: true },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-bg-primary">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{notif.label}</p>
                      <p className="text-xs text-text-tertiary">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
                      <div className="w-10 h-5 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                        style={{ background: notif.enabled ? '#DAA520' : 'var(--bg-tertiary)' }}></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data */}
          {activeTab === 'backup' && (
            <div className="glass-card-static p-6 space-y-4">
              <h3 className="text-lg font-bold text-text-primary">Data Management</h3>

              <div className="p-4 rounded-xl flex items-center justify-between bg-bg-primary">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Theme</p>
                  <p className="text-xs text-text-tertiary">Current: {theme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>Toggle Theme</button>
              </div>

              <div className="p-4 rounded-xl flex items-center justify-between bg-bg-primary">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Export Backup</p>
                  <p className="text-xs text-text-tertiary">Download all data as JSON</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={exportData}>Export</button>
              </div>

              <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div>
                  <p className="text-sm font-semibold text-[#EF4444]">Reset All Data</p>
                  <p className="text-xs text-text-tertiary">Reset to default sample data (cannot be undone)</p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={resetData}>Reset</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
