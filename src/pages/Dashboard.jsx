import { useMemo } from 'react';
import {
  TrendingUp, Package, Wrench, ShoppingCart, ArrowUpRight,
  ArrowDownRight, Clock, DollarSign, Users, Gem, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { useStore } from '../store/useStore';
import { DAILY_SALES_DATA, MONTHLY_SALES_DATA, CATEGORIES, METAL_RATES } from '../data/seedData';
import { formatCurrency, formatWeight, getStatusLabel, getStatusColor } from '../utils/formatters';

const CHART_COLORS = ['#DAA520', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899', '#06B6D4'];

function KPICard({ icon: Icon, label, value, subValue, trend, trendUp, color, delay }) {
  return (
    <div className={`glass-card p-5 animate-fade-in animate-fade-in-delay-${delay} border border-border-subtle hover:border-border-primary transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${trendUp ? 'text-[#10B981]' : 'text-[#EF4444]'}`}
            style={{ background: trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-text-tertiary">{label}</p>
      <p className="text-2xl font-bold font-mono text-text-primary">{value}</p>
      {subValue && <p className="text-xs mt-1 text-text-tertiary">{subValue}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-static p-3 text-xs bg-bg-card border border-border-primary rounded-xl shadow-lg" style={{ minWidth: '140px' }}>
        <p className="font-semibold mb-1 text-text-primary">{label}</p>
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

export default function Dashboard() {
  const { data: inventory } = useStore('inventory');
  const { data: sales } = useStore('sales');
  const { data: repairs } = useStore('repairs');
  const { data: orders } = useStore('orders');
  const { data: customers } = useStore('customers');

  const stats = useMemo(() => {
    const todaySales = sales.filter(s => s.date === '2026-04-03');
    const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

    const goldStock = inventory
      .filter(i => i.metalType === 'gold')
      .reduce((sum, i) => sum + (i.netWeight * i.quantity), 0);

    const silverStock = inventory
      .filter(i => i.metalType === 'silver')
      .reduce((sum, i) => sum + (i.netWeight * i.quantity), 0);

    const pendingRepairs = repairs.filter(r => r.status !== 'completed').length;
    const activeOrders = orders.filter(o => o.status !== 'completed').length;
    const totalCustomers = customers.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

    return { todayTotal, goldStock, silverStock, pendingRepairs, activeOrders, totalCustomers, totalRevenue };
  }, [sales, inventory, repairs, orders, customers]);

  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: cat.name,
      value: inventory.filter(i => i.category === cat.id).reduce((sum, i) => sum + i.quantity, 0),
    })).filter(c => c.value > 0);
  }, [inventory]);

  const recentActivity = useMemo(() => {
    const activities = [];
    sales.slice(-5).reverse().forEach(s => {
      const customer = customers.find(c => c.id === s.customerId);
      activities.push({
        id: s.id,
        type: 'sale',
        icon: ShoppingCart,
        title: `Sale ${s.invoiceNo}`,
        subtitle: customer ? customer.name : 'Walk-in',
        value: formatCurrency(s.total),
        time: s.date,
        color: '#10B981',
      });
    });
    repairs.filter(r => r.status === 'pending').slice(0, 3).forEach(r => {
      const customer = customers.find(c => c.id === r.customer);
      activities.push({
        id: r.id,
        type: 'repair',
        icon: Wrench,
        title: r.itemDescription,
        subtitle: customer ? customer.name : 'Unknown',
        value: formatCurrency(r.estimatedCost),
        time: r.dateReceived,
        color: '#F59E0B',
      });
    });
    return activities.slice(0, 8);
  }, [sales, repairs, customers]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm mt-1 text-text-tertiary">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-subtle)' }}>
          <Clock size={14} className="text-text-tertiary" />
          <span className="text-xs font-mono text-text-secondary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={TrendingUp} label="Today's Sales" value={formatCurrency(stats.todayTotal)} subValue="2 transactions" trend="+12.5%" trendUp={true} color="#10B981" delay={1} />
        <KPICard icon={Gem} label="Gold Stock" value={formatWeight(stats.goldStock)} subValue={`Silver: ${formatWeight(stats.silverStock)}`} trend="+2.3%" trendUp={true} color="#DAA520" delay={2} />
        <KPICard icon={Wrench} label="Pending Repairs" value={stats.pendingRepairs} subValue="3 urgent" trend="" trendUp={false} color="#F59E0B" delay={3} />
        <KPICard icon={ShoppingCart} label="Active Orders" value={stats.activeOrders} subValue="2 due this week" trend="" trendUp={false} color="#3B82F6" delay={4} />
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard icon={Users} label="Total Customers" value={stats.totalCustomers} subValue="2 new this month" color="#8B5CF6" delay={1} />
        <KPICard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats.totalRevenue)} subValue="This fiscal year" trend="+18.2%" trendUp={true} color="#10B981" delay={2} />
        <KPICard icon={Activity} label="Avg. Transaction" value={formatCurrency(Math.round(stats.totalRevenue / (sales.length || 1)))} subValue={`${sales.length} transactions`} color="#EC4899" delay={3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Trend */}
        <div className="xl:col-span-2 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-primary">Sales Trend (7 Days)</h3>
            <span className="badge badge-gold">Daily</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={DAILY_SALES_DATA}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DAA520" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DAA520" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-subtle)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sales" stroke="#DAA520" strokeWidth={2.5} fill="url(#salesGradient)" dot={{ fill: '#DAA520', r: 4, strokeWidth: 2, stroke: 'var(--bg-primary)' }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="glass-card-static p-5">
          <h3 className="text-sm font-bold mb-4 text-text-primary">Stock by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} pcs`, 'Stock']} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Sales + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly Revenue */}
        <div className="xl:col-span-2 glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-primary">Monthly Revenue</h3>
            <span className="badge badge-emerald">This Year</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MONTHLY_SALES_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                {MONTHLY_SALES_DATA.map((_, i) => (
                  <Cell key={i} fill={i === MONTHLY_SALES_DATA.length - 1 ? '#DAA520' : 'rgba(218, 165, 32, 0.3)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="glass-card-static p-5">
          <h3 className="text-sm font-bold mb-4 text-text-primary">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-[var(--bg-tertiary)]">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${activity.color}15`, border: `1px solid ${activity.color}20` }}>
                  <activity.icon size={16} style={{ color: activity.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-text-primary">{activity.title}</p>
                  <p className="text-[10px] text-text-tertiary">{activity.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-semibold" style={{ color: activity.color }}>{activity.value}</p>
                  <p className="text-[10px] text-text-tertiary">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Gold Rate (24K/tola)', value: formatCurrency(METAL_RATES.gold_24k * 11.6638), color: '#DAA520' },
          { label: 'Silver Rate/tola', value: formatCurrency(METAL_RATES.silver_999 * 11.6638), color: '#C0C0C0' },
          { label: 'Items in Stock', value: inventory.reduce((s, i) => s + i.quantity, 0), color: '#10B981' },
          { label: 'Outstanding Balance', value: formatCurrency(customers.reduce((s, c) => s + c.outstandingBalance, 0)), color: '#EF4444' },
        ].map((stat, i) => (
          <div key={i} className="glass-card-static p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{stat.label}</p>
            <p className="text-lg font-bold font-mono mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
