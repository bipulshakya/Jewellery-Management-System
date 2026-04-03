import { Truck, Building, Phone, Mail } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';

export default function Purchases() {
  const { data: suppliers } = useStore('suppliers');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Purchases & Suppliers</h1>
        <p className="text-sm mt-1 text-text-tertiary">Manage supplier relationships and purchase orders</p>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(218,165,32,0.1)', border: '1px solid rgba(218,165,32,0.2)' }}>
                <Building size={20} style={{ color: '#DAA520' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">{supplier.name}</h3>
                <span className="badge badge-gold text-[9px]">{supplier.type}</span>
              </div>
            </div>
            <div className="space-y-2 text-xs text-text-secondary">
              <p className="flex items-center gap-2"><Phone size={12} /> {supplier.phone}</p>
              <p className="flex items-center gap-2"><Mail size={12} /> {supplier.email}</p>
              <p className="flex items-center gap-2"><Truck size={12} /> {supplier.address}</p>
            </div>
            <div className="mt-4 pt-3 border-t flex justify-between items-center border-border-color-subtle">
              <span className="text-xs text-text-tertiary">Outstanding</span>
              <span className={`font-mono font-bold text-sm ${supplier.balance > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                {formatCurrency(supplier.balance)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="glass-card-static p-8 text-center">
        <Truck size={48} className="mx-auto mb-3 text-text-tertiary" />
        <h3 className="text-lg font-bold mb-2 text-text-primary">Purchase Orders</h3>
        <p className="text-sm text-text-tertiary">
          Purchase order management, consignment tracking, and supplier ledger coming in the next update.
        </p>
      </div>
    </div>
  );
}
