// Generators for SKU, Invoice numbers, IDs

let invoiceCounter = parseInt(localStorage.getItem('invoiceCounter') || '8', 10);

export function generateInvoiceNo() {
  invoiceCounter++;
  localStorage.setItem('invoiceCounter', invoiceCounter.toString());
  return `INV-2026-${String(invoiceCounter).padStart(4, '0')}`;
}

export function generateSKU(category, metalType) {
  const catCode = (category || 'GEN').substring(0, 3).toUpperCase();
  const metalCode = metalType === 'gold' ? 'AU' : metalType === 'silver' ? 'AG' : 'PT';
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${catCode}-${metalCode}-${random}`;
}

export function generateId(prefix = 'item') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}
