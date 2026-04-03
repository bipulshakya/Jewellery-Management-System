import { useState, useMemo } from 'react';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, User, Receipt,
  CreditCard, Smartphone, Building, FileText, Printer, X, Check
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import { useStore, useToast } from '../store/useStore';
import { CATEGORIES, PURITY_OPTIONS, PAYMENT_MODES } from '../data/seedData';
import { formatCurrency, formatWeight, getPurityLabel } from '../utils/formatters';
import { calculateItemPrice, calculateOldGoldValue, VAT_RATE } from '../utils/pricing';
import { generateInvoiceNo, generateId } from '../utils/generators';

export default function POS() {
  const { data: inventory, update: updateInventory } = useStore('inventory');
  const { data: customers } = useStore('customers');
  const { data: sales, add: addSale } = useStore('sales');
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('flat');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  // Old gold exchange
  const [showExchange, setShowExchange] = useState(false);
  const [exchangeWeight, setExchangeWeight] = useState('');
  const [exchangePurity, setExchangePurity] = useState('22k');
  const [exchangeValue, setExchangeValue] = useState(0);

  const searchResults = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return inventory.filter(i =>
      i.quantity > 0 && (
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q)
      )
    ).slice(0, 8);
  }, [search, inventory]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers.slice(0, 5);
    const q = customerSearch.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q)
    ).slice(0, 5);
  }, [customerSearch, customers]);

  const addToCart = (item) => {
    const existing = cart.find(c => c.inventoryId === item.id);
    if (existing) {
      if (existing.quantity >= item.quantity) {
        addToast('No more stock available', 'error');
        return;
      }
      setCart(cart.map(c =>
        c.inventoryId === item.id ? { ...c, quantity: c.quantity + 1, lineTotal: (c.quantity + 1) * c.unitPrice } : c
      ));
    } else {
      const pricing = calculateItemPrice(item);
      setCart([...cart, {
        id: generateId('cart'),
        inventoryId: item.id,
        name: item.name,
        sku: item.sku,
        metalType: item.metalType,
        purity: item.purity,
        netWeight: item.netWeight,
        grossWeight: item.grossWeight,
        quantity: 1,
        maxQty: item.quantity,
        unitPrice: pricing.subtotal,
        lineTotal: pricing.subtotal,
        pricing,
      }]);
    }
    setSearch('');
    addToast(`${item.name} added to cart`, 'success');
  };

  const updateCartQty = (cartId, delta) => {
    setCart(cart.map(c => {
      if (c.id === cartId) {
        const newQty = Math.max(1, Math.min(c.maxQty, c.quantity + delta));
        return { ...c, quantity: newQty, lineTotal: newQty * c.unitPrice };
      }
      return c;
    }));
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(c => c.id !== cartId));
  };

  const calculateExchange = () => {
    const w = parseFloat(exchangeWeight) || 0;
    const value = calculateOldGoldValue(w, exchangePurity);
    setExchangeValue(value);
  };

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, c) => sum + c.lineTotal, 0);
    const discountAmount = discountType === 'percentage' ? Math.round(subtotal * discount / 100) : discount;
    const taxable = subtotal - discountAmount;
    const vat = Math.round(taxable * VAT_RATE);
    const grandTotal = taxable + vat - exchangeValue;
    return {
      subtotal,
      discountAmount,
      vat,
      exchangeValue,
      grandTotal: Math.max(0, grandTotal),
      itemCount: cart.reduce((s, c) => s + c.quantity, 0),
    };
  }, [cart, discount, discountType, exchangeValue]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      addToast('Cart is empty', 'error');
      return;
    }

    const invoiceNo = generateInvoiceNo();
    const sale = {
      id: generateId('sale'),
      invoiceNo,
      date: new Date().toISOString().split('T')[0],
      customerId: selectedCustomer?.id || null,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      items: cart.map(c => ({
        inventoryId: c.inventoryId,
        name: c.name,
        sku: c.sku,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        lineTotal: c.lineTotal,
        pricing: c.pricing,
      })),
      subtotal: cartTotals.subtotal,
      discount: cartTotals.discountAmount,
      vat: cartTotals.vat,
      exchangeValue: cartTotals.exchangeValue,
      total: cartTotals.grandTotal,
      paymentMode,
      status: 'completed',
    };

    // Update inventory quantities
    cart.forEach(c => {
      const invItem = inventory.find(i => i.id === c.inventoryId);
      if (invItem) {
        const newQty = invItem.quantity - c.quantity;
        updateInventory(c.inventoryId, {
          quantity: newQty,
          status: newQty <= (invItem.reorderPoint || 3) ? (newQty === 0 ? 'out_of_stock' : 'low_stock') : 'in_stock',
        });
      }
    });

    addSale(sale);
    setLastInvoice(sale);
    setShowInvoice(true);

    // Reset
    setCart([]);
    setDiscount(0);
    setExchangeValue(0);
    setExchangeWeight('');
    setSelectedCustomer(null);

    addToast(`Invoice ${invoiceNo} generated!`, 'success');
  };

  const paymentIcons = {
    cash: '💵', card: '💳', esewa: '📱', khalti: '📲', bank: '🏦', cheque: '📄',
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Left: Item Search & Selection */}
      <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Point of Sale</h1>
          <p className="text-sm mt-1 text-text-tertiary">Search and add items to bill</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by item name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-10 text-sm"
            style={{ fontSize: '1rem' }}
          />
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20 shadow-xl"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              {searchResults.map(item => {
                const pricing = calculateItemPrice(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-(--bg-tertiary)"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-bg-tertiary">
                      {CATEGORIES.find(c => c.id === item.category)?.icon || '💎'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                      <p className="text-[10px] text-text-tertiary">
                        {item.sku} • {item.metalType} {item.purity} • {formatWeight(item.netWeight)} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold gold-text">{formatCurrency(pricing.total)}</p>
                      <p className="text-[10px] text-text-tertiary">incl. VAT</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
              <ShoppingCart size={48} className="mb-3 opacity-30" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs">Search for items to add to the bill</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={item.id} className="glass-card-static p-4 flex items-center gap-4">
                <div className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-text-primary">{item.name}</p>
                  <p className="text-[10px] text-text-tertiary">
                    {item.sku} • {item.metalType} {item.purity} • {formatWeight(item.netWeight)}
                  </p>
                  <p className="text-xs mt-1 font-mono text-text-secondary">
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateCartQty(item.id, -1)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-(--bg-tertiary)" style={{ border: '1px solid var(--border-color-subtle)', color: 'var(--text-secondary)' }}>
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-sm text-text-primary">{item.quantity}</span>
                  <button onClick={() => updateCartQty(item.id, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-(--bg-tertiary)" style={{ border: '1px solid var(--border-color-subtle)', color: 'var(--text-secondary)' }}>
                    <Plus size={12} />
                  </button>
                </div>
                <div className="text-right min-w-25">
                  <p className="text-sm font-mono font-bold gold-text">{formatCurrency(item.lineTotal)}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-1.5 rounded-lg text-ruby-500 transition-colors hover:bg-[rgba(239,68,68,0.1)]">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Bill Summary */}
      <div className="w-95 shrink-0 flex flex-col glass-card-static overflow-hidden">
        {/* Customer */}
        <div className="p-4 border-b border-border-color-subtle">
          <label className="form-label">Customer</label>
          {selectedCustomer ? (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-bg-primary">
              <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-dark-900">{selectedCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-text-primary">{selectedCustomer.name}</p>
                <p className="text-[10px] text-text-tertiary">{selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-ruby-500"><X size={14} /></button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="Search customer..."
                value={customerSearch}
                onFocus={() => setShowCustomerSelect(true)}
                onChange={e => { setCustomerSearch(e.target.value); setShowCustomerSelect(true); }}
                className="form-input text-sm"
              />
              {showCustomerSelect && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 max-h-48 overflow-y-auto"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                  {filteredCustomers.map(c => (
                    <button key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustomerSelect(false); setCustomerSearch(''); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-(--bg-tertiary) transition-colors">
                      <User size={12} className="text-text-tertiary" />
                      <span className="text-text-primary">{c.name}</span>
                      <span className="text-text-tertiary">{c.phone}</span>
                    </button>
                  ))}
                  <button onClick={() => setShowCustomerSelect(false)}
                    className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-(--bg-tertiary) transition-colors"
                    style={{ color: '#DAA520' }}>
                    + Walk-in Customer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <div className="space-y-2">
            {[
              ['Items', `${cartTotals.itemCount} pcs`],
              ['Subtotal', formatCurrency(cartTotals.subtotal)],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-text-tertiary">{label}</span>
                <span className="font-mono text-text-secondary">{val}</span>
              </div>
            ))}
          </div>

          {/* Discount */}
          <div className="p-3 rounded-xl bg-bg-primary">
            <label className="form-label">Discount</label>
            <div className="flex gap-2">
              <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)} className="form-input text-sm flex-1" placeholder="0" />
              <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="form-select text-sm" style={{ width: '80px' }}>
                <option value="flat">रू</option>
                <option value="percentage">%</option>
              </select>
            </div>
            {cartTotals.discountAmount > 0 && (
              <p className="text-xs mt-1 text-emerald-500">-{formatCurrency(cartTotals.discountAmount)}</p>
            )}
          </div>

          {/* Old Gold Exchange */}
          <div className="p-3 rounded-xl bg-bg-primary">
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0">Old Gold Exchange</label>
              <button onClick={() => setShowExchange(!showExchange)} className="text-[10px] font-semibold gold-text">
                {showExchange ? 'Hide' : 'Add'}
              </button>
            </div>
            {showExchange && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input type="number" step="0.01" value={exchangeWeight} onChange={e => setExchangeWeight(e.target.value)} className="form-input text-sm flex-1" placeholder="Weight (g)" />
                  <select value={exchangePurity} onChange={e => setExchangePurity(e.target.value)} className="form-select text-sm" style={{ width: '80px' }}>
                    <option value="24k">24K</option>
                    <option value="22k">22K</option>
                    <option value="18k">18K</option>
                  </select>
                </div>
                <button onClick={calculateExchange} className="btn btn-secondary w-full mt-2">Calculate Value</button>
                {exchangeValue > 0 && (
                  <p className="text-xs text-emerald-500 font-semibold">Exchange value: -{formatCurrency(exchangeValue)}</p>
                )}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-3 border-t border-border-color-subtle">
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">VAT (13%)</span>
              <span className="font-mono text-text-secondary">{formatCurrency(cartTotals.vat)}</span>
            </div>
            {cartTotals.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-tertiary">Discount</span>
                <span className="font-mono text-emerald-500">-{formatCurrency(cartTotals.discountAmount)}</span>
              </div>
            )}
            {cartTotals.exchangeValue > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-tertiary">Exchange</span>
                <span className="font-mono text-emerald-500">-{formatCurrency(cartTotals.exchangeValue)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border-color">
              <span className="text-sm font-bold text-text-primary">Grand Total</span>
              <span className="text-xl font-bold font-mono gold-text">{formatCurrency(cartTotals.grandTotal)}</span>
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="form-label">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setPaymentMode(mode.id)}
                  className={`p-2 rounded-lg text-center text-xs font-semibold transition-all ${paymentMode === mode.id ? 'ring-2 ring-gold-500' : ''}`}
                  style={{
                    background: paymentMode === mode.id ? 'rgba(218,165,32,0.1)' : 'var(--bg-primary)',
                    border: `1px solid ${paymentMode === mode.id ? 'rgba(218,165,32,0.3)' : 'var(--border-color-subtle)'}`,
                    color: paymentMode === mode.id ? '#DAA520' : 'var(--text-secondary)',
                  }}
                >
                  <span className="text-lg block">{mode.icon}</span>
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="p-4 border-t border-border-color bg-bg-card">
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="btn btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Receipt size={18} />
            Complete Sale • {formatCurrency(cartTotals.grandTotal)}
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      <Modal isOpen={showInvoice} onClose={() => setShowInvoice(false)} title="Invoice Generated" width="max-w-2xl">
        {lastInvoice && (
          <div id="invoice-print">
            <div className="text-center mb-6 pb-4 border-b border-border-color">
              <h2 className="text-[16px] font-bold gold-text">Shreehans RKS Khushi Jewellers</h2>
              <p className="text-[10px] text-text-tertiary">श्रीहंस आर.के.एस. खुशी ज्वेलर्स</p>
              <p className="text-[10px] mt-1 text-text-tertiary">Nepal | 01-xxxxxxx</p>
              <p className="text-[10px] text-text-tertiary">PAN: 000000000 | VAT: VAT-000000000</p>
            </div>
            <div className="flex justify-between mb-4 text-xs">
              <div>
                <p><strong>Invoice:</strong> {lastInvoice.invoiceNo}</p>
                <p><strong>Date:</strong> {lastInvoice.date}</p>
              </div>
              <div className="text-right">
                <p><strong>Customer:</strong> {lastInvoice.customerName}</p>
                <p><strong>Payment:</strong> {lastInvoice.paymentMode}</p>
              </div>
            </div>
            <table className="w-full text-xs mb-4">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {lastInvoice.items.map((item, i) => (
                  <tr key={i} className="border-b border-border-color-subtle">
                    <td className="py-2">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-text-tertiary">{item.sku}</p>
                    </td>
                    <td className="text-right font-mono">{item.quantity}</td>
                    <td className="text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right font-mono font-semibold">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1 text-sm pt-3 border-t border-border-color">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{formatCurrency(lastInvoice.subtotal)}</span></div>
              {lastInvoice.discount > 0 && <div className="flex justify-between text-emerald-500"><span>Discount</span><span className="font-mono">-{formatCurrency(lastInvoice.discount)}</span></div>}
              <div className="flex justify-between"><span>VAT (13%)</span><span className="font-mono">{formatCurrency(lastInvoice.vat)}</span></div>
              {lastInvoice.exchangeValue > 0 && <div className="flex justify-between text-emerald-500"><span>Old Gold Exchange</span><span className="font-mono">-{formatCurrency(lastInvoice.exchangeValue)}</span></div>}
              <div className="flex justify-between pt-2 border-t text-lg font-bold border-border-color">
                <span>Grand Total</span>
                <span className="font-mono gold-text">{formatCurrency(lastInvoice.total)}</span>
              </div>
            </div>
            <p className="text-center text-[10px] mt-6 pt-3 border-t" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-color-subtle)' }}>
              Thank you for shopping with us! • धन्यवाद!
            </p>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-4 pt-3 border-t no-print border-border-color-subtle">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowInvoice(false)}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
            <Printer size={14} /> Print Invoice
          </button>
        </div>
      </Modal>
    </div>
  );
}
