import { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, Download, Edit3, Trash2, Eye,
  ChevronUp, ChevronDown, Package, AlertTriangle
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import { useStore, useToast } from '../store/useStore';
import { CATEGORIES, PURITY_OPTIONS, STONE_TYPES } from '../data/seedData';
import { formatCurrency, formatWeight, getStatusColor, getStatusLabel, getMetalLabel, getPurityLabel } from '../utils/formatters';
import { calculateItemPrice } from '../utils/pricing';
import { generateSKU, generateId } from '../utils/generators';

const EMPTY_ITEM = {
  name: '', category: 'rings', metalType: 'gold', purity: '22k',
  grossWeight: '', netWeight: '', stoneWeight: 0, stoneType: 'none', stoneValue: 0,
  makingChargeType: 'percentage', makingCharge: 12, wastagePercent: 3,
  hallmarked: true, quantity: 1, reorderPoint: 3, image: null,
};

export default function Inventory() {
  const { data: inventory, add, update, remove } = useStore('inventory');
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [metalFilter, setMetalFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_ITEM });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredItems = useMemo(() => {
    let items = [...inventory];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') items = items.filter(i => i.category === categoryFilter);
    if (metalFilter !== 'all') items = items.filter(i => i.metalType === metalFilter);

    items.sort((a, b) => {
      let aVal = a[sortField], bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [inventory, search, categoryFilter, metalFilter, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const openAddModal = () => {
    setEditItem(null);
    setForm({ ...EMPTY_ITEM });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setForm({ ...item });
    setShowModal(true);
  };

  const openDetailModal = (item) => {
    setDetailItem(item);
    setShowDetailModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.netWeight) {
      addToast('Please fill in required fields', 'error');
      return;
    }
    const pricing = calculateItemPrice(form);
    if (editItem) {
      update(editItem.id, { ...form, netWeight: parseFloat(form.netWeight), grossWeight: parseFloat(form.grossWeight), calculatedPrice: pricing.total });
      addToast('Item updated successfully', 'success');
    } else {
      const newItem = {
        ...form,
        id: generateId('inv'),
        sku: generateSKU(form.category, form.metalType),
        netWeight: parseFloat(form.netWeight),
        grossWeight: parseFloat(form.grossWeight),
        stoneWeight: parseFloat(form.stoneWeight) || 0,
        stoneValue: parseFloat(form.stoneValue) || 0,
        quantity: parseInt(form.quantity) || 1,
        calculatedPrice: pricing.total,
        status: parseInt(form.quantity) <= parseInt(form.reorderPoint) ? 'low_stock' : 'in_stock',
      };
      add(newItem);
      addToast('Item added successfully', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    remove(id);
    setDeleteConfirm(null);
    addToast('Item deleted', 'info');
  };

  const exportCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Metal', 'Purity', 'Gross Wt', 'Net Wt', 'Quantity', 'Price'];
    const rows = filteredItems.map(i => {
      const price = calculateItemPrice(i);
      return [i.sku, i.name, i.category, i.metalType, i.purity, i.grossWeight, i.netWeight, i.quantity, price.total];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inventory.csv'; a.click();
    addToast('Exported to CSV', 'success');
  };

  const lowStockCount = inventory.filter(i => i.quantity <= (i.reorderPoint || 3)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Inventory Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {inventory.length} items • {inventory.reduce((s, i) => s + i.quantity, 0)} total pieces
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={14} color="#EF4444" />
              <span className="text-xs font-semibold text-[#EF4444]">{lowStockCount} Low Stock</span>
            </div>
          )}
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
            <Download size={14} /> Export
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card-static p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-9 text-sm"
            />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="form-select" style={{ width: 'auto', minWidth: '140px' }}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select value={metalFilter} onChange={e => setMetalFilter(e.target.value)} className="form-select" style={{ width: 'auto', minWidth: '120px' }}>
            <option value="all">All Metals</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('sku')} className="cursor-pointer">
                  <span className="flex items-center gap-1">SKU <SortIcon field="sku" /></span>
                </th>
                <th onClick={() => handleSort('name')} className="cursor-pointer">
                  <span className="flex items-center gap-1">Item Name <SortIcon field="name" /></span>
                </th>
                <th>Category</th>
                <th>Metal / Purity</th>
                <th onClick={() => handleSort('netWeight')} className="cursor-pointer">
                  <span className="flex items-center gap-1">Net Wt <SortIcon field="netWeight" /></span>
                </th>
                <th>Price</th>
                <th onClick={() => handleSort('quantity')} className="cursor-pointer">
                  <span className="flex items-center gap-1">Qty <SortIcon field="quantity" /></span>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const pricing = calculateItemPrice(item);
                const isLow = item.quantity <= (item.reorderPoint || 3);
                return (
                  <tr key={item.id}>
                    <td><span className="font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.sku}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--bg-tertiary)' }}>
                          {CATEGORIES.find(c => c.id === item.category)?.icon || '💎'}
                        </div>
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                      </div>
                    </td>
                    <td className="text-xs capitalize">{item.category}</td>
                    <td>
                      <div>
                        <span className="text-xs font-semibold capitalize" style={{ color: item.metalType === 'gold' ? '#DAA520' : item.metalType === 'silver' ? '#C0C0C0' : '#B0C4DE' }}>{item.metalType}</span>
                        <span className="text-[10px] ml-1" style={{ color: 'var(--text-tertiary)' }}>{item.purity}</span>
                      </div>
                    </td>
                    <td><span className="font-mono text-sm">{formatWeight(item.netWeight)}</span></td>
                    <td><span className="font-mono text-sm font-semibold gold-text">{formatCurrency(pricing.total)}</span></td>
                    <td>
                      <span className={`font-mono text-sm font-bold ${isLow ? 'text-[#EF4444]' : ''}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${isLow ? 'ruby' : 'emerald'}`}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDetailModal(item)} className="btn btn-ghost btn-sm p-1.5" title="View">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => openEditModal(item)} className="btn btn-ghost btn-sm p-1.5" title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="btn btn-ghost btn-sm p-1.5 text-[#EF4444]" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <Package size={40} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No items found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Item' : 'Add New Item'} width="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Item Name *</label>
            <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Gold Diamond Ring" />
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Metal Type</label>
            <select className="form-select" value={form.metalType} onChange={e => setForm({ ...form, metalType: e.target.value })}>
              <option value="gold">Gold (सुन)</option>
              <option value="silver">Silver (चाँदी)</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>
          <div>
            <label className="form-label">Purity / Karat</label>
            <select className="form-select" value={form.purity} onChange={e => setForm({ ...form, purity: e.target.value })}>
              {PURITY_OPTIONS.filter(p => p.metal === form.metalType).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Gross Weight (grams) *</label>
            <input type="number" step="0.01" className="form-input" value={form.grossWeight} onChange={e => setForm({ ...form, grossWeight: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="form-label">Net Weight (grams) *</label>
            <input type="number" step="0.01" className="form-input" value={form.netWeight} onChange={e => setForm({ ...form, netWeight: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="form-label">Stone Type</label>
            <select className="form-select" value={form.stoneType} onChange={e => setForm({ ...form, stoneType: e.target.value })}>
              {STONE_TYPES.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nameNp})</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Stone Weight (grams)</label>
            <input type="number" step="0.01" className="form-input" value={form.stoneWeight} onChange={e => setForm({ ...form, stoneWeight: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="form-label">Stone Value (रू)</label>
            <input type="number" className="form-input" value={form.stoneValue} onChange={e => setForm({ ...form, stoneValue: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className="form-label">Making Charge Type</label>
            <select className="form-select" value={form.makingChargeType} onChange={e => setForm({ ...form, makingChargeType: e.target.value })}>
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat (रू)</option>
            </select>
          </div>
          <div>
            <label className="form-label">Making Charge {form.makingChargeType === 'percentage' ? '(%)' : '(रू)'}</label>
            <input type="number" step="0.01" className="form-input" value={form.makingCharge} onChange={e => setForm({ ...form, makingCharge: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Wastage %</label>
            <input type="number" step="0.1" className="form-input" value={form.wastagePercent} onChange={e => setForm({ ...form, wastagePercent: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Quantity</label>
            <input type="number" className="form-input" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Reorder Point</label>
            <input type="number" className="form-input" value={form.reorderPoint} onChange={e => setForm({ ...form, reorderPoint: e.target.value })} />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.hallmarked} onChange={e => setForm({ ...form, hallmarked: e.target.checked })} className="w-4 h-4 rounded accent-[#DAA520]" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Hallmarked</span>
            </label>
          </div>

          {/* Price Preview */}
          {form.netWeight && (
            <div className="md:col-span-2 p-4 rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>Price Breakdown</h4>
              {(() => {
                const p = calculateItemPrice({ ...form, netWeight: parseFloat(form.netWeight) || 0 });
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-xs block" style={{ color: 'var(--text-tertiary)' }}>Metal Value</span><span className="font-mono font-semibold">{formatCurrency(p.metalValue)}</span></div>
                    <div><span className="text-xs block" style={{ color: 'var(--text-tertiary)' }}>Wastage</span><span className="font-mono">{formatCurrency(p.wastageValue)}</span></div>
                    <div><span className="text-xs block" style={{ color: 'var(--text-tertiary)' }}>Making</span><span className="font-mono">{formatCurrency(p.makingChargeValue)}</span></div>
                    <div><span className="text-xs block" style={{ color: 'var(--text-tertiary)' }}>Stone</span><span className="font-mono">{formatCurrency(p.stoneValue)}</span></div>
                    <div><span className="text-xs block" style={{ color: 'var(--text-tertiary)' }}>Hallmark</span><span className="font-mono">{formatCurrency(p.hallmarkingCharge)}</span></div>
                    <div><span className="text-xs block" style={{ color: 'var(--text-tertiary)' }}>VAT (13%)</span><span className="font-mono">{formatCurrency(p.vat)}</span></div>
                    <div className="md:col-span-2">
                      <span className="text-xs block" style={{ color: 'var(--text-tertiary)' }}>Total Price</span>
                      <span className="font-mono text-xl font-bold gold-text">{formatCurrency(p.total)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-color-subtle)' }}>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Add Item'}</button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Item Details" width="max-w-xl">
        {detailItem && (() => {
          const p = calculateItemPrice(detailItem);
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  {CATEGORIES.find(c => c.id === detailItem.category)?.icon || '💎'}
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{detailItem.name}</h3>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{detailItem.sku}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Category', detailItem.category],
                  ['Metal', getMetalLabel(detailItem.metalType)],
                  ['Purity', getPurityLabel(detailItem.purity)],
                  ['Gross Weight', formatWeight(detailItem.grossWeight)],
                  ['Net Weight', formatWeight(detailItem.netWeight)],
                  ['Stone', `${detailItem.stoneType} (${formatWeight(detailItem.stoneWeight)})`],
                  ['Quantity', detailItem.quantity],
                  ['Hallmarked', detailItem.hallmarked ? 'Yes ✓' : 'No'],
                ].map(([label, val]) => (
                  <div key={label} className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                    <span className="text-[10px] uppercase font-bold block" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                    <span className="text-sm font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{val}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(218,165,32,0.05)', border: '1px solid rgba(218,165,32,0.15)' }}>
                <span className="text-xs uppercase font-bold block" style={{ color: 'var(--text-tertiary)' }}>Total Price (incl. 13% VAT)</span>
                <span className="text-2xl font-bold font-mono gold-text">{formatCurrency(p.total)}</span>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" width="max-w-sm">
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete this item? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
