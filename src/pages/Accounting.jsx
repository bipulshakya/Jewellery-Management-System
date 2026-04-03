import { Calculator, BookOpen, CreditCard, Wallet } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';

export default function Accounting() {
  const { data: sales } = useStore('sales');
  const { data: customers } = useStore('customers');
  const { data: suppliers } = useStore('suppliers');

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalVAT = sales.reduce((sum, s) => sum + s.vat, 0);
  const totalReceivable = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
  const totalPayable = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Accounting & Finance</h1>
        <p className="text-sm mt-1 text-text-tertiary">Financial overview and ledger management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: Wallet, color: '#10B981' },
          { label: 'VAT Collected', value: formatCurrency(totalVAT), icon: Calculator, color: '#3B82F6' },
          { label: 'Receivable', value: formatCurrency(totalReceivable), icon: CreditCard, color: '#F59E0B' },
          { label: 'Payable', value: formatCurrency(totalPayable), icon: BookOpen, color: '#EF4444' },
        ].map((stat, i) => (
          <div key={i} className="glass-card-static p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{stat.label}</p>
            <p className="text-xl font-bold font-mono mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'General Ledger', desc: 'Complete double-entry bookkeeping system with journal entries and account management.' },
          { title: 'Cash Book', desc: 'Daily cash receipts and payments with running balance tracking.' },
          { title: 'Trial Balance', desc: 'Automated trial balance generation from all ledger accounts.' },
          { title: 'P&L Statement', desc: 'Profit and loss statement with revenue, cost of goods sold, and expense tracking.' },
        ].map((section, i) => (
          <div key={i} className="glass-card-static p-6 text-center">
            <Calculator size={32} className="mx-auto mb-3 text-text-tertiary" />
            <h3 className="text-sm font-bold mb-2 text-text-primary">{section.title}</h3>
            <p className="text-xs text-text-tertiary">{section.desc}</p>
            <div className="mt-3">
              <span className="badge badge-gold">Coming Soon</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
