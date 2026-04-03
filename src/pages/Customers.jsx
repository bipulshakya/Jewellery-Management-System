import { useState, useMemo } from 'react';
import {
  Search, Plus, Edit3, Trash2, User, Phone, Mail, MapPin,
  Gift, Award, FileText, Eye, X
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import { useStore, useToast } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateId } from '../utils/generators';

const EMPTY_CUSTOMER = {
  name: '', phone: '', email: '', address: '',
  pan: '', citizenship: 'No', loyaltyPoints: 0,
  totalPurchases: 0, outstandingBalance: 0,
  birthday: '', anniversary: '',
};

export default function Customers() {
  const { data: customers, add, update, remove } = useStore('customers');
  const { data: sales } = useStore('sales');
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_CUSTOMER });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  }, [customers, search]);

  const openAdd = () => { setEditCustomer(null); setForm({ ...EMPTY_CUSTOMER }); setShowModal(true); };
  const openEdit = (c) => { setEditCustomer(c); setForm({ ...c }); setShowModal(true); };
  const openDetail = (c) => { setDetailCustomer(c); setShowDetail(true); };

  const handleSave = () => {
    if (!form.name || !form.phone) {
      addToast('Name and phone are required', 'error');
      return;
    }
    if (editCustomer) {
      update(editCustomer.id, { ...form });
      addToast('Customer updated', 'success');
    } else {
      add({ ...form, id: generateId('cust'), joinDate: new Date().toISOString().split('T')[0] });
      addToast('Customer added', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    remove(id);
    setDeleteConfirm(null);
    addToast('Customer deleted', 'info');
  };

  const getCustomerSales = (customerId) => {
    return sales.filter(s => s.customerId === customerId);
  };

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Customer Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {customers.length} customers • Outstanding: {formatCurrency(totalOutstanding)}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, color: '#8B5CF6' },
          { label: 'Total Purchases', value: formatCurrency(customers.reduce((s, c) => s + c.totalPurchases, 0)), color: '#10B981' },
          { label: 'Loyalty Points', value: customers.reduce((s, c) => s + c.loyaltyPoints, 0).toLocaleString(), color: '#DAA520' },
          { label: 'Outstanding', value: formatCurrency(totalOutstanding), color: '#EF4444' },
        ].map((stat, i) => (
          <div key={i} className="glass-card-static p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
            <p className="text-lg font-bold font-mono mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input pl-9 text-sm"
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="glass-card p-5 cursor-pointer" onClick={() => openDetail(customer)}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[#0F0F1A]">
                  {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{customer.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone size={10} style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{customer.phone}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); openEdit(customer); }} className="btn btn-ghost btn-sm p-1.5">
                  <Edit3 size={13} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(customer.id); }} className="btn btn-ghost btn-sm p-1.5 text-[#EF4444]">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-tertiary)' }}>Purchases</p>
                <p className="text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(customer.totalPurchases)}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-tertiary)' }}>Points</p>
                <p className="text-xs font-mono font-bold" style={{ color: '#DAA520' }}>{customer.loyaltyPoints}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-tertiary)' }}>Balance</p>
                <p className={`text-xs font-mono font-bold ${customer.outstandingBalance > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                  {formatCurrency(customer.outstandingBalance)}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {customer.pan && <span className="badge badge-emerald">PAN ✓</span>}
              {customer.citizenship === 'Yes' && <span className="badge badge-sapphire">KYC ✓</span>}
              {customer.birthday && <span className="badge badge-amethyst">🎂 {new Date(customer.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <User size={40} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No customers found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCustomer ? 'Edit Customer' : 'Add Customer'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Full Name *</label>
            <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Sita Sharma" />
          </div>
          <div>
            <label className="form-label">Phone *</label>
            <input type="tel" className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="98XXXXXXXX" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Address</label>
            <input type="text" className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="e.g., Thamel, Kathmandu" />
          </div>
          <div>
            <label className="form-label">PAN Number</label>
            <input type="text" className="form-input" value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value })} placeholder="PAN Number" />
          </div>
          <div>
            <label className="form-label">Citizenship on File</label>
            <select className="form-select" value={form.citizenship} onChange={e => setForm({ ...form, citizenship: e.target.value })}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div>
            <label className="form-label">Birthday</label>
            <input type="date" className="form-input" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Anniversary</label>
            <input type="date" className="form-input" value={form.anniversary} onChange={e => setForm({ ...form, anniversary: e.target.value })} />
          </div>
          {editCustomer && (
            <>
              <div>
                <label className="form-label">Loyalty Points</label>
                <input type="number" className="form-input" value={form.loyaltyPoints} onChange={e => setForm({ ...form, loyaltyPoints: Number(e.target.value) })} />
              </div>
              <div>
                <label className="form-label">Outstanding Balance</label>
                <input type="number" className="form-input" value={form.outstandingBalance} onChange={e => setForm({ ...form, outstandingBalance: Number(e.target.value) })} />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-color-subtle)' }}>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editCustomer ? 'Update' : 'Add Customer'}</button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Customer Profile" width="max-w-xl">
        {detailCustomer && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-color-subtle)' }}>
              <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center">
                <span className="text-xl font-bold text-[#0F0F1A]">
                  {detailCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{detailCustomer.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <span className="flex items-center gap-1"><Phone size={10} /> {detailCustomer.phone}</span>
                  {detailCustomer.email && <span className="flex items-center gap-1"><Mail size={10} /> {detailCustomer.email}</span>}
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <MapPin size={10} /> {detailCustomer.address}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['Total Purchases', formatCurrency(detailCustomer.totalPurchases), '#10B981'],
                ['Loyalty Points', detailCustomer.loyaltyPoints.toLocaleString(), '#DAA520'],
                ['Outstanding', formatCurrency(detailCustomer.outstandingBalance), detailCustomer.outstandingBalance > 0 ? '#EF4444' : '#10B981'],
                ['Member Since', formatDate(detailCustomer.joinDate), '#3B82F6'],
                ['PAN', detailCustomer.pan || 'Not provided', '#8B5CF6'],
                ['KYC (Citizenship)', detailCustomer.citizenship === 'Yes' ? 'Verified ✓' : 'Not on file', detailCustomer.citizenship === 'Yes' ? '#10B981' : '#EF4444'],
              ].map(([label, val, color]) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                  <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
                  <p className="text-sm font-bold mt-1" style={{ color }}>{val}</p>
                </div>
              ))}
            </div>

            {(detailCustomer.birthday || detailCustomer.anniversary) && (
              <div className="flex gap-3">
                {detailCustomer.birthday && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                    <Gift size={14} color="#8B5CF6" />
                    <div>
                      <p className="text-[10px] uppercase font-bold" style={{ color: '#8B5CF6' }}>Birthday</p>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{formatDate(detailCustomer.birthday)}</p>
                    </div>
                  </div>
                )}
                {detailCustomer.anniversary && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1" style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)' }}>
                    <Award size={14} color="#EC4899" />
                    <div>
                      <p className="text-[10px] uppercase font-bold" style={{ color: '#EC4899' }}>Anniversary</p>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{formatDate(detailCustomer.anniversary)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Purchase History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>Purchase History</h4>
              {(() => {
                const custSales = getCustomerSales(detailCustomer.id);
                if (custSales.length === 0) {
                  return <p className="text-xs text-center py-4" style={{ color: 'var(--text-tertiary)' }}>No purchase history</p>;
                }
                return (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {custSales.map(sale => (
                      <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{sale.invoiceNo}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{formatDate(sale.date)} • {sale.paymentMode}</p>
                        </div>
                        <span className="text-sm font-mono font-bold gold-text">{formatCurrency(sale.total)}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" width="max-w-sm">
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete this customer?</p>
        <div className="flex justify-end gap-3">
          <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
