import { useState, useMemo } from 'react';
import {
  BarChart3, Download, Calendar, TrendingUp, Package,
  Users, FileText, Printer
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { useStore } from '../store/useStore';
import { CATEGORIES, MONTHLY_SALES_DATA, DAILY_SALES_DATA, METAL_RATES } from '../data/seedData';
import { formatCurrency, formatWeight, formatDate } from '../utils/formatters';
import { calculateItemPrice } from '../utils/pricing';

const CHART_COLORS = ['#DAA520', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899', '#06B6D4'];

const REPORT_TABS = [
  { id: 'sales', label: 'Sales Report', icon: TrendingUp },
  { id: 'stock', label: 'Stock Report', icon: Package },
  { id: 'category', label: 'Category Analysis', icon: BarChart3 },
  { id: 'customer', label: 'Customer Report', icon: Users },
  { id: 'tax', label: 'VAT Summary', icon: FileText },
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-static p-3 text-xs" style={{ minWidth: '140px' }}>
        <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-mono">
            {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Reports() {
  const { data: inventory } = useStore('inventory');
  const { data: sales } = useStore('sales');
  const { data: customers } = useStore('customers');
  const [activeTab, setActiveTab] = useState('sales');

  // Sales Report Data
  const salesReport = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalVat = sales.reduce((sum, s) => sum + s.vat, 0);
    const totalDiscount = sales.reduce((sum, s) => sum + (s.discount || 0), 0);
    const avgTransaction = sales.length > 0 ? totalSales / sales.length : 0;

    const byPayment = {};
    sales.forEach(s => {
      byPayment[s.paymentMode] = (byPayment[s.paymentMode] || 0) + s.total;
    });
    const paymentData = Object.entries(byPayment).map(([mode, total]) => ({
      name: mode.charAt(0).toUpperCase() + mode.slice(1),
      value: total,
    }));

    return { totalSales, totalVat, totalDiscount, avgTransaction, paymentData };
  }, [sales]);

  // Stock Report Data
  const stockReport = useMemo(() => {
    const goldItems = inventory.filter(i => i.metalType === 'gold');
    const silverItems = inventory.filter(i => i.metalType === 'silver');

    const goldByPurity = {};
    goldItems.forEach(i => {
      goldByPurity[i.purity] = (goldByPurity[i.purity] || 0) + (i.netWeight * i.quantity);
    });

    const silverByPurity = {};
    silverItems.forEach(i => {
      silverByPurity[i.purity] = (silverByPurity[i.purity] || 0) + (i.netWeight * i.quantity);
    });

    const totalGoldWeight = goldItems.reduce((sum, i) => sum + (i.netWeight * i.quantity), 0);
    const totalSilverWeight = silverItems.reduce((sum, i) => sum + (i.netWeight * i.quantity), 0);
    const totalGoldValue = totalGoldWeight * METAL_RATES.gold_22k;
    const totalSilverValue = totalSilverWeight * METAL_RATES.silver_925;

    const metalStockData = [
      { name: 'Gold 24K', weight: goldByPurity['24k'] || 0, value: (goldByPurity['24k'] || 0) * METAL_RATES.gold_24k },
      { name: 'Gold 22K', weight: goldByPurity['22k'] || 0, value: (goldByPurity['22k'] || 0) * METAL_RATES.gold_22k },
      { name: 'Gold 18K', weight: goldByPurity['18k'] || 0, value: (goldByPurity['18k'] || 0) * METAL_RATES.gold_18k },
      { name: 'Silver 925', weight: silverByPurity['925'] || 0, value: (silverByPurity['925'] || 0) * METAL_RATES.silver_925 },
    ].filter(d => d.weight > 0);

    return { totalGoldWeight, totalSilverWeight, totalGoldValue, totalSilverValue, metalStockData, goldByPurity, silverByPurity };
  }, [inventory]);

  // Category Data
  const categoryReport = useMemo(() => {
    return CATEGORIES.map(cat => {
      const items = inventory.filter(i => i.category === cat.id);
      const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
      const totalWeight = items.reduce((sum, i) => sum + (i.netWeight * i.quantity), 0);
      let totalValue = 0;
      items.forEach(i => {
        const p = calculateItemPrice(i);
        totalValue += p.total * i.quantity;
      });
      return { name: cat.name, icon: cat.icon, qty: totalQty, weight: totalWeight, value: totalValue };
    }).filter(c => c.qty > 0).sort((a, b) => b.value - a.value);
  }, [inventory]);

  // Top Selling Items
  const topItems = useMemo(() => {
    const itemSales = {};
    sales.forEach(s => {
      s.items.forEach(item => {
        if (!itemSales[item.inventoryId]) {
          itemSales[item.inventoryId] = { name: item.name || item.inventoryId, qty: 0, revenue: 0 };
        }
        itemSales[item.inventoryId].qty += item.quantity;
        itemSales[item.inventoryId].revenue += item.lineTotal || (item.unitPrice * item.quantity);
      });
    });
    return Object.values(itemSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [sales]);

  // Customer Report
  const customerReport = useMemo(() => {
    return customers.map(c => {
      const custSales = sales.filter(s => s.customerId === c.id);
      const totalSpent = custSales.reduce((sum, s) => sum + s.total, 0);
      return { ...c, salesCount: custSales.length, totalSpent };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, sales]);

  // VAT Summary
  const vatSummary = useMemo(() => {
    const totalTaxable = sales.reduce((sum, s) => sum + s.subtotal - (s.discount || 0), 0);
    const totalVat = sales.reduce((sum, s) => sum + s.vat, 0);
    const totalCollection = sales.reduce((sum, s) => sum + s.total, 0);
    return { totalTaxable, totalVat, totalCollection, transactionCount: sales.length };
  }, [sales]);

  const exportCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => row[h]).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.csv`; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reports & Analytics</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Comprehensive business insights</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
          <Printer size={14} /> Print Report
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {REPORT_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.id ? 'gold-gradient text-[#0F0F1A]' : ''}`}
            style={activeTab !== tab.id ? { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color-subtle)' } : {}}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sales Report */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Sales', value: formatCurrency(salesReport.totalSales), color: '#10B981' },
              { label: 'Total VAT', value: formatCurrency(salesReport.totalVat), color: '#3B82F6' },
              { label: 'Total Discounts', value: formatCurrency(salesReport.totalDiscount), color: '#EF4444' },
              { label: 'Avg Transaction', value: formatCurrency(salesReport.avgTransaction), color: '#8B5CF6' },
            ].map((stat, i) => (
              <div key={i} className="glass-card-static p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                <p className="text-xl font-bold font-mono mt-1" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="glass-card-static p-5">
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Daily Sales Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={DAILY_SALES_DATA}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DAA520" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#DAA520" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-subtle)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="sales" stroke="#DAA520" strokeWidth={2} fill="url(#salesGrad)" dot={{ fill: '#DAA520', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card-static p-5">
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Payment Mode Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={salesReport.paymentData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                    {salesReport.paymentData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="glass-card-static p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Monthly Revenue</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => exportCSV(MONTHLY_SALES_DATA, 'monthly_sales')}>
                <Download size={12} /> Export
              </button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MONTHLY_SALES_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-subtle)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]} fill="#DAA520" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Sales Table */}
          <div className="glass-card-static overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th>Invoice</th><th>Date</th><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th>
                </tr></thead>
                <tbody>
                  {sales.slice().reverse().slice(0, 10).map(s => {
                    const cust = customers.find(c => c.id === s.customerId);
                    return (
                      <tr key={s.id}>
                        <td><span className="font-mono text-xs">{s.invoiceNo}</span></td>
                        <td className="text-xs">{formatDate(s.date)}</td>
                        <td className="text-xs">{cust?.name || s.customerName || 'Walk-in'}</td>
                        <td className="text-xs">{s.items.length} items</td>
                        <td><span className="badge badge-gold capitalize">{s.paymentMode}</span></td>
                        <td><span className="font-mono font-semibold text-sm gold-text">{formatCurrency(s.total)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stock Report */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Gold', value: formatWeight(stockReport.totalGoldWeight), sub: `≈ ${formatCurrency(stockReport.totalGoldValue)}`, color: '#DAA520' },
              { label: 'Total Silver', value: formatWeight(stockReport.totalSilverWeight), sub: `≈ ${formatCurrency(stockReport.totalSilverValue)}`, color: '#C0C0C0' },
              { label: 'Total Items', value: inventory.length, sub: `${inventory.reduce((s, i) => s + i.quantity, 0)} pcs`, color: '#3B82F6' },
              { label: 'Low Stock Alerts', value: inventory.filter(i => i.quantity <= (i.reorderPoint || 3)).length, color: '#EF4444' },
            ].map((stat, i) => (
              <div key={i} className="glass-card-static p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                <p className="text-xl font-bold font-mono mt-1" style={{ color: stat.color }}>{stat.value}</p>
                {stat.sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{stat.sub}</p>}
              </div>
            ))}
          </div>

          <div className="glass-card-static p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Metal Stock by Purity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockReport.metalStockData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-subtle)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickFormatter={v => `${v.toFixed(0)}g`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} width={90} />
                <Tooltip formatter={v => `${v.toFixed(2)}g`} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="weight" radius={[0, 6, 6, 0]}>
                  {stockReport.metalStockData.map((entry, i) => (
                    <Cell key={i} fill={entry.name.includes('Gold') ? '#DAA520' : '#C0C0C0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Low stock items */}
          <div className="glass-card-static overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Low Stock Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>SKU</th><th>Item</th><th>Metal</th><th>Current Qty</th><th>Reorder Point</th><th>Status</th></tr></thead>
                <tbody>
                  {inventory.filter(i => i.quantity <= (i.reorderPoint || 3)).map(i => (
                    <tr key={i.id}>
                      <td className="font-mono text-xs">{i.sku}</td>
                      <td className="font-semibold text-sm">{i.name}</td>
                      <td className="text-xs capitalize">{i.metalType} {i.purity}</td>
                      <td className="font-mono font-bold text-[#EF4444]">{i.quantity}</td>
                      <td className="font-mono text-sm">{i.reorderPoint}</td>
                      <td><span className="badge badge-ruby">Low Stock</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category Analysis */}
      {activeTab === 'category' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="glass-card-static p-5">
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Category Value Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryReport} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                    {categoryReport.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card-static p-5">
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Stock Quantity by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryReport}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-subtle)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="qty" name="Quantity" radius={[6, 6, 0, 0]}>
                    {categoryReport.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Table */}
          <div className="glass-card-static overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Category Breakdown</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => exportCSV(categoryReport.map(c => ({ Category: c.name, Quantity: c.qty, Weight: c.weight.toFixed(2), Value: c.value })), 'category_report')}>
                <Download size={12} /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Category</th><th>Items</th><th>Total Weight</th><th>Total Value</th></tr></thead>
                <tbody>
                  {categoryReport.map(c => (
                    <tr key={c.name}>
                      <td><span className="font-semibold">{c.icon} {c.name}</span></td>
                      <td className="font-mono">{c.qty} pcs</td>
                      <td className="font-mono">{formatWeight(c.weight)}</td>
                      <td className="font-mono font-semibold gold-text">{formatCurrency(c.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Selling */}
          {topItems.length > 0 && (
            <div className="glass-card-static overflow-hidden">
              <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Top Selling Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>#</th><th>Item</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {topItems.map((item, i) => (
                      <tr key={i}>
                        <td><span className="w-6 h-6 inline-flex items-center justify-center rounded-full text-[10px] font-bold" style={{ background: 'var(--bg-tertiary)' }}>{i + 1}</span></td>
                        <td className="font-semibold text-sm">{item.name}</td>
                        <td className="font-mono">{item.qty}</td>
                        <td className="font-mono font-semibold gold-text">{formatCurrency(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Report */}
      {activeTab === 'customer' && (
        <div className="space-y-6">
          <div className="glass-card-static overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Customer Purchase Report</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => exportCSV(customerReport.map(c => ({ Name: c.name, Phone: c.phone, Transactions: c.salesCount, TotalSpent: c.totalSpent, Outstanding: c.outstandingBalance, LoyaltyPoints: c.loyaltyPoints })), 'customer_report')}>
                <Download size={12} /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Customer</th><th>Phone</th><th>Transactions</th><th>Total Spent</th><th>Outstanding</th><th>Points</th></tr></thead>
                <tbody>
                  {customerReport.map(c => (
                    <tr key={c.id}>
                      <td className="font-semibold text-sm">{c.name}</td>
                      <td className="text-xs font-mono">{c.phone}</td>
                      <td className="font-mono text-center">{c.salesCount}</td>
                      <td className="font-mono font-semibold gold-text">{formatCurrency(c.totalSpent)}</td>
                      <td className={`font-mono ${c.outstandingBalance > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>{formatCurrency(c.outstandingBalance)}</td>
                      <td className="font-mono" style={{ color: '#DAA520' }}>{c.loyaltyPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VAT Summary */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Taxable Amount', value: formatCurrency(vatSummary.totalTaxable), color: '#3B82F6' },
              { label: 'Total VAT (13%)', value: formatCurrency(vatSummary.totalVat), color: '#EF4444' },
              { label: 'Total Collection', value: formatCurrency(vatSummary.totalCollection), color: '#10B981' },
              { label: 'Transactions', value: vatSummary.transactionCount, color: '#8B5CF6' },
            ].map((stat, i) => (
              <div key={i} className="glass-card-static p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                <p className="text-xl font-bold font-mono mt-1" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="glass-card-static p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>VAT Summary Report</h3>
            <div className="space-y-3">
              {[
                ['Gross Sales (before discount)', formatCurrency(sales.reduce((s, sale) => s + sale.subtotal, 0))],
                ['Less: Discounts', `- ${formatCurrency(vatSummary.totalTaxable - sales.reduce((s, sale) => s + sale.subtotal, 0) + sales.reduce((s, sale) => s + (sale.discount || 0), 0))}`],
                ['Taxable Sales', formatCurrency(vatSummary.totalTaxable)],
                ['VAT @ 13%', formatCurrency(vatSummary.totalVat)],
                ['Total Sales (incl. VAT)', formatCurrency(vatSummary.totalCollection)],
              ].map(([label, val], i) => (
                <div key={i} className={`flex justify-between p-3 rounded-lg ${i === 4 ? 'font-bold text-lg' : 'text-sm'}`}
                  style={{ background: i === 4 ? 'rgba(218,165,32,0.08)' : 'var(--bg-primary)', border: i === 4 ? '1px solid rgba(218,165,32,0.2)' : 'none' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span className="font-mono" style={{ color: i === 4 ? '#DAA520' : 'var(--text-primary)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
