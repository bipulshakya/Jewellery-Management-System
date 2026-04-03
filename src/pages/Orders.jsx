import { useState } from 'react';
import { ClipboardList, Clock, CheckCircle, AlertCircle, Hammer, Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SAMPLE_ORDERS } from '../data/seedData';
import { formatCurrency, formatWeight, formatDate, getStatusColor, getStatusLabel } from '../utils/formatters';

const STAGES = ['pending', 'design', 'casting', 'setting', 'polishing', 'quality_check', 'finished'];

export default function Orders() {
  const { data: orders } = useStore('orders');
  const { data: customers } = useStore('customers');

  const getCustomerName = (id) => customers.find(c => c.id === id)?.name || 'Unknown';

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    in_production: orders.filter(o => o.status === 'in_production' || o.status === 'design').length,
    quality_check: orders.filter(o => o.status === 'quality_check').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Orders & Production</h1>
        <p className="text-sm mt-1 text-text-tertiary">Custom order and karigar job tracking</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: statusCounts.pending, icon: Clock, color: '#F59E0B' },
          { label: 'In Production', value: statusCounts.in_production, icon: Hammer, color: '#3B82F6' },
          { label: 'QC Check', value: statusCounts.quality_check, icon: AlertCircle, color: '#8B5CF6' },
          { label: 'Completed', value: statusCounts.completed, icon: CheckCircle, color: '#10B981' },
        ].map((stat, i) => (
          <div key={i} className="glass-card-static p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} style={{ color: stat.color }} />
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="glass-card-static p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-text-primary">{order.description}</h3>
                <p className="text-xs mt-0.5 text-text-tertiary">
                  Customer: {getCustomerName(order.customer)} • Karigar: {order.karigar || 'Unassigned'}
                </p>
              </div>
              <span className={`badge badge-${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {[
                ['Metal', `${order.metalType} ${order.purity}`],
                ['Est. Weight', formatWeight(order.estimatedWeight)],
                ['Metal Issued', formatWeight(order.metalIssued)],
                ['Returned', formatWeight(order.metalReturned)],
                ['Advance', formatCurrency(order.advance)],
              ].map(([label, val]) => (
                <div key={label} className="p-2 rounded-lg bg-bg-primary">
                  <p className="text-[10px] uppercase font-bold text-text-tertiary">{label}</p>
                  <p className="text-xs font-semibold capitalize text-text-primary">{val}</p>
                </div>
              ))}
            </div>

            {/* Stage Progress */}
            <div className="flex items-center gap-1">
              {STAGES.map((stage, i) => {
                const currentIdx = STAGES.indexOf(order.stage);
                const isCompleted = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={stage} className="flex items-center flex-1">
                    <div className={`flex-1 h-1.5 rounded-full ${isCompleted ? 'gold-gradient' : ''}`}
                      style={{ background: isCompleted ? undefined : 'var(--bg-tertiary)' }}>
                    </div>
                    {i < STAGES.length - 1 && <div className="w-1"></div>}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1 text-[9px] uppercase tracking-wider text-text-tertiary">
              {STAGES.map(s => <span key={s} className={STAGES.indexOf(s) <= STAGES.indexOf(order.stage) ? 'gold-text font-bold' : ''}>{s.replace('_', ' ')}</span>)}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-color-subtle">
              <span className="text-xs text-text-tertiary">Started: {formatDate(order.startDate)}</span>
              <span className="text-xs text-text-tertiary">Expected: {formatDate(order.expectedDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
