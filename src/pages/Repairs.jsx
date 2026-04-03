import { useState } from 'react';
import { Wrench, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../utils/formatters';

export default function Repairs() {
  const { data: repairs } = useStore('repairs');
  const { data: customers } = useStore('customers');
  const [filter, setFilter] = useState('all');

  const getCustomerName = (id) => customers.find(c => c.id === id)?.name || 'Unknown';

  const filtered = filter === 'all' ? repairs : repairs.filter(r => r.status === filter);

  const counts = {
    all: repairs.length,
    pending: repairs.filter(r => r.status === 'pending').length,
    in_progress: repairs.filter(r => r.status === 'in_progress').length,
    completed: repairs.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Repair & Service</h1>
        <p className="text-sm mt-1 text-text-tertiary">Track repair jobs and service requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: counts.all, color: '#3B82F6' },
          { label: 'Pending', value: counts.pending, color: '#F59E0B' },
          { label: 'In Progress', value: counts.in_progress, color: '#8B5CF6' },
          { label: 'Completed', value: counts.completed, color: '#10B981' },
        ].map((stat, i) => (
          <div key={i} className="glass-card-static p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{stat.label}</p>
            <p className="text-2xl font-bold font-mono mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'pending', 'in_progress', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filter === f ? 'gold-gradient text-[#0F0F1A]' : ''}`}
            style={filter !== f ? { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color-subtle)' } : {}}
          >
            {f.replace('_', ' ')} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Repair Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(repair => (
          <div key={repair.id} className="glass-card-static p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(218,165,32,0.1)' }}>
                  <Wrench size={16} style={{ color: '#DAA520' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">{repair.itemDescription}</h3>
                  <p className="text-[10px] flex items-center gap-1 text-text-tertiary">
                    <User size={9} /> {getCustomerName(repair.customer)}
                  </p>
                </div>
              </div>
              <span className={`badge badge-${getStatusColor(repair.status)}`}>{getStatusLabel(repair.status)}</span>
            </div>

            <p className="text-xs mb-3 p-2 rounded-lg" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
              {repair.complaint}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-bg-primary">
                <span className="text-[9px] uppercase font-bold block text-text-tertiary">Estimated</span>
                <span className="font-mono font-semibold" style={{ color: '#DAA520' }}>{formatCurrency(repair.estimatedCost)}</span>
              </div>
              <div className="p-2 rounded-lg bg-bg-primary">
                <span className="text-[9px] uppercase font-bold block text-text-tertiary">Actual</span>
                <span className="font-mono font-semibold" style={{ color: repair.actualCost ? '#10B981' : 'var(--text-tertiary)' }}>
                  {repair.actualCost ? formatCurrency(repair.actualCost) : 'TBD'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t text-[10px]" style={{ borderColor: 'var(--border-color-subtle)', color: 'var(--text-tertiary)' }}>
              <span>Received: {formatDate(repair.dateReceived)}</span>
              <span>Expected: {formatDate(repair.expectedDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
