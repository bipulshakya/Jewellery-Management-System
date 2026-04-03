// Nepali Jewellery ERP — Seed Data
// All prices in NPR (रू), weights in grams

export const METAL_RATES = {
  gold_24k: 12500,
  gold_22k: 11458,
  gold_18k: 9375,
  gold_14k: 7292,
  silver_999: 135,
  silver_925: 125,
  platinum: 5200,
};

export const CATEGORIES = [
  { id: 'rings', name: 'Rings', icon: '💍', nameNp: 'औंठी' },
  { id: 'necklaces', name: 'Necklaces', icon: '📿', nameNp: 'हार' },
  { id: 'bangles', name: 'Bangles', icon: '⭕', nameNp: 'चुरा' },
  { id: 'earrings', name: 'Earrings', icon: '✨', nameNp: 'कानको झुम्का' },
  { id: 'pendants', name: 'Pendants', icon: '🔶', nameNp: 'पेन्डन्ट' },
  { id: 'bracelets', name: 'Bracelets', icon: '🔗', nameNp: 'ब्रेसलेट' },
  { id: 'chains', name: 'Chains', icon: '⛓️', nameNp: 'चेन' },
  { id: 'tilahari', name: 'Tilahari', icon: '📿', nameNp: 'तिलहरी' },
];

export const PURITY_OPTIONS = [
  { id: '24k', label: '24K (99.9%)', factor: 0.999, metal: 'gold' },
  { id: '22k', label: '22K (91.6%)', factor: 0.916, metal: 'gold' },
  { id: '18k', label: '18K (75.0%)', factor: 0.750, metal: 'gold' },
  { id: '14k', label: '14K (58.3%)', factor: 0.583, metal: 'gold' },
  { id: '10k', label: '10K (41.7%)', factor: 0.417, metal: 'gold' },
  { id: '925', label: '925 Silver', factor: 0.925, metal: 'silver' },
  { id: '999s', label: '999 Silver', factor: 0.999, metal: 'silver' },
  { id: 'pt950', label: 'Platinum 950', factor: 0.950, metal: 'platinum' },
];

export const PAYMENT_MODES = [
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'card', label: 'Card', icon: '💳' },
  { id: 'esewa', label: 'eSewa', icon: '📱' },
  { id: 'khalti', label: 'Khalti', icon: '📲' },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
  { id: 'cheque', label: 'Cheque', icon: '📄' },
];

export const STONE_TYPES = [
  { id: 'diamond', name: 'Diamond', nameNp: 'हिरा' },
  { id: 'ruby', name: 'Ruby', nameNp: 'माणिक' },
  { id: 'emerald', name: 'Emerald', nameNp: 'पन्ना' },
  { id: 'sapphire', name: 'Blue Sapphire', nameNp: 'नीलम' },
  { id: 'pearl', name: 'Pearl', nameNp: 'मोती' },
  { id: 'coral', name: 'Coral', nameNp: 'मुंगा' },
  { id: 'none', name: 'None', nameNp: 'छैन' },
];

let skuCounter = 1000;
function generateSKU(category, metal) {
  skuCounter++;
  const catCode = category.substring(0, 3).toUpperCase();
  const metalCode = metal === 'gold' ? 'AU' : metal === 'silver' ? 'AG' : 'PT';
  return `${catCode}-${metalCode}-${skuCounter}`;
}

export const SAMPLE_INVENTORY = [
  // Rings
  { id: 'inv001', sku: 'RIN-AU-1001', name: 'Classic Gold Band', category: 'rings', metalType: 'gold', purity: '22k', grossWeight: 8.5, netWeight: 8.2, stoneWeight: 0.3, stoneType: 'none', stoneValue: 0, makingChargeType: 'percentage', makingCharge: 12, wastagePercent: 3, hallmarked: true, quantity: 15, reorderPoint: 5, status: 'in_stock', image: null },
  { id: 'inv002', sku: 'RIN-AU-1002', name: 'Diamond Solitaire Ring', category: 'rings', metalType: 'gold', purity: '18k', grossWeight: 5.2, netWeight: 4.0, stoneWeight: 1.2, stoneType: 'diamond', stoneValue: 85000, makingChargeType: 'flat', makingCharge: 8500, wastagePercent: 2, hallmarked: true, quantity: 8, reorderPoint: 3, status: 'in_stock', image: null },
  { id: 'inv003', sku: 'RIN-AU-1003', name: 'Ruby Studded Ring', category: 'rings', metalType: 'gold', purity: '22k', grossWeight: 6.8, netWeight: 5.5, stoneWeight: 1.3, stoneType: 'ruby', stoneValue: 35000, makingChargeType: 'percentage', makingCharge: 14, wastagePercent: 3, hallmarked: true, quantity: 6, reorderPoint: 3, status: 'in_stock', image: null },
  { id: 'inv004', sku: 'RIN-AG-1004', name: 'Silver Filigree Ring', category: 'rings', metalType: 'silver', purity: '925', grossWeight: 12.0, netWeight: 12.0, stoneWeight: 0, stoneType: 'none', stoneValue: 0, makingChargeType: 'flat', makingCharge: 800, wastagePercent: 2, hallmarked: false, quantity: 25, reorderPoint: 10, status: 'in_stock', image: null },
  { id: 'inv005', sku: 'RIN-AU-1005', name: 'Emerald Gold Ring', category: 'rings', metalType: 'gold', purity: '22k', grossWeight: 7.5, netWeight: 6.0, stoneWeight: 1.5, stoneType: 'emerald', stoneValue: 45000, makingChargeType: 'percentage', makingCharge: 15, wastagePercent: 3, hallmarked: true, quantity: 4, reorderPoint: 3, status: 'low_stock', image: null },

  // Necklaces
  { id: 'inv006', sku: 'NEC-AU-1006', name: 'Traditional Rani Haar', category: 'necklaces', metalType: 'gold', purity: '22k', grossWeight: 55.0, netWeight: 52.0, stoneWeight: 3.0, stoneType: 'ruby', stoneValue: 120000, makingChargeType: 'percentage', makingCharge: 10, wastagePercent: 3, hallmarked: true, quantity: 3, reorderPoint: 2, status: 'in_stock', image: null },
  { id: 'inv007', sku: 'NEC-AU-1007', name: 'Delicate Chain Necklace', category: 'necklaces', metalType: 'gold', purity: '22k', grossWeight: 12.0, netWeight: 12.0, stoneWeight: 0, stoneType: 'none', stoneValue: 0, makingChargeType: 'percentage', makingCharge: 8, wastagePercent: 2, hallmarked: true, quantity: 10, reorderPoint: 5, status: 'in_stock', image: null },
  { id: 'inv008', sku: 'NEC-AG-1008', name: 'Silver Choker Set', category: 'necklaces', metalType: 'silver', purity: '925', grossWeight: 45.0, netWeight: 40.0, stoneWeight: 5.0, stoneType: 'pearl', stoneValue: 15000, makingChargeType: 'flat', makingCharge: 3500, wastagePercent: 2, hallmarked: false, quantity: 7, reorderPoint: 3, status: 'in_stock', image: null },
  { id: 'inv009', sku: 'NEC-AU-1009', name: 'Diamond Pendant Necklace', category: 'necklaces', metalType: 'gold', purity: '18k', grossWeight: 18.0, netWeight: 15.0, stoneWeight: 3.0, stoneType: 'diamond', stoneValue: 250000, makingChargeType: 'flat', makingCharge: 15000, wastagePercent: 2, hallmarked: true, quantity: 2, reorderPoint: 2, status: 'low_stock', image: null },

  // Bangles
  { id: 'inv010', sku: 'BAN-AU-1010', name: 'Traditional Gold Bangles (Pair)', category: 'bangles', metalType: 'gold', purity: '22k', grossWeight: 32.0, netWeight: 32.0, stoneWeight: 0, stoneType: 'none', stoneValue: 0, makingChargeType: 'percentage', makingCharge: 8, wastagePercent: 3, hallmarked: true, quantity: 12, reorderPoint: 5, status: 'in_stock', image: null },
  { id: 'inv011', sku: 'BAN-AU-1011', name: 'Stone Studded Bangle', category: 'bangles', metalType: 'gold', purity: '22k', grossWeight: 18.5, netWeight: 16.0, stoneWeight: 2.5, stoneType: 'ruby', stoneValue: 55000, makingChargeType: 'percentage', makingCharge: 14, wastagePercent: 3, hallmarked: true, quantity: 6, reorderPoint: 3, status: 'in_stock', image: null },
  { id: 'inv012', sku: 'BAN-AG-1012', name: 'Silver Kangan Set', category: 'bangles', metalType: 'silver', purity: '925', grossWeight: 60.0, netWeight: 60.0, stoneWeight: 0, stoneType: 'none', stoneValue: 0, makingChargeType: 'flat', makingCharge: 2500, wastagePercent: 2, hallmarked: false, quantity: 20, reorderPoint: 8, status: 'in_stock', image: null },
  { id: 'inv013', sku: 'BAN-AU-1013', name: 'Meenakari Bangle Pair', category: 'bangles', metalType: 'gold', purity: '22k', grossWeight: 28.0, netWeight: 26.0, stoneWeight: 2.0, stoneType: 'coral', stoneValue: 8000, makingChargeType: 'percentage', makingCharge: 18, wastagePercent: 3, hallmarked: true, quantity: 4, reorderPoint: 3, status: 'in_stock', image: null },

  // Earrings
  { id: 'inv014', sku: 'EAR-AU-1014', name: 'Gold Jhumka Pair', category: 'earrings', metalType: 'gold', purity: '22k', grossWeight: 14.0, netWeight: 12.5, stoneWeight: 1.5, stoneType: 'pearl', stoneValue: 5000, makingChargeType: 'percentage', makingCharge: 15, wastagePercent: 3, hallmarked: true, quantity: 9, reorderPoint: 4, status: 'in_stock', image: null },
  { id: 'inv015', sku: 'EAR-AU-1015', name: 'Diamond Studs', category: 'earrings', metalType: 'gold', purity: '18k', grossWeight: 4.0, netWeight: 2.5, stoneWeight: 1.5, stoneType: 'diamond', stoneValue: 120000, makingChargeType: 'flat', makingCharge: 6000, wastagePercent: 2, hallmarked: true, quantity: 5, reorderPoint: 2, status: 'in_stock', image: null },
  { id: 'inv016', sku: 'EAR-AG-1016', name: 'Silver Hoop Earrings', category: 'earrings', metalType: 'silver', purity: '925', grossWeight: 8.0, netWeight: 8.0, stoneWeight: 0, stoneType: 'none', stoneValue: 0, makingChargeType: 'flat', makingCharge: 600, wastagePercent: 2, hallmarked: false, quantity: 30, reorderPoint: 10, status: 'in_stock', image: null },

  // Pendants
  { id: 'inv017', sku: 'PEN-AU-1017', name: 'Gold Ganesh Pendant', category: 'pendants', metalType: 'gold', purity: '22k', grossWeight: 6.0, netWeight: 6.0, stoneWeight: 0, stoneType: 'none', stoneValue: 0, makingChargeType: 'percentage', makingCharge: 12, wastagePercent: 3, hallmarked: true, quantity: 8, reorderPoint: 4, status: 'in_stock', image: null },
  { id: 'inv018', sku: 'PEN-AU-1018', name: 'Sapphire Drop Pendant', category: 'pendants', metalType: 'gold', purity: '18k', grossWeight: 5.5, netWeight: 3.8, stoneWeight: 1.7, stoneType: 'sapphire', stoneValue: 65000, makingChargeType: 'flat', makingCharge: 5500, wastagePercent: 2, hallmarked: true, quantity: 3, reorderPoint: 2, status: 'in_stock', image: null },
  { id: 'inv019', sku: 'PEN-AG-1019', name: 'Silver Om Pendant', category: 'pendants', metalType: 'silver', purity: '925', grossWeight: 10.0, netWeight: 10.0, stoneWeight: 0, stoneType: 'none', stoneValue: 0, makingChargeType: 'flat', makingCharge: 500, wastagePercent: 2, hallmarked: false, quantity: 18, reorderPoint: 8, status: 'in_stock', image: null },

  // Tilahari
  { id: 'inv020', sku: 'TIL-AU-1020', name: 'Traditional Gold Tilahari', category: 'tilahari', metalType: 'gold', purity: '24k', grossWeight: 20.0, netWeight: 18.5, stoneWeight: 1.5, stoneType: 'coral', stoneValue: 12000, makingChargeType: 'percentage', makingCharge: 10, wastagePercent: 3, hallmarked: true, quantity: 5, reorderPoint: 2, status: 'in_stock', image: null },
  { id: 'inv021', sku: 'TIL-AU-1021', name: 'Pote Mala with Gold', category: 'tilahari', metalType: 'gold', purity: '22k', grossWeight: 15.0, netWeight: 12.0, stoneWeight: 3.0, stoneType: 'coral', stoneValue: 8000, makingChargeType: 'percentage', makingCharge: 12, wastagePercent: 3, hallmarked: true, quantity: 7, reorderPoint: 3, status: 'in_stock', image: null },
];

export const SAMPLE_CUSTOMERS = [
  { id: 'cust001', name: 'Sita Sharma', phone: '9841234567', email: 'sita.sharma@gmail.com', address: 'Durbar Marg, Kathmandu', pan: '123456789', citizenship: 'Yes', loyaltyPoints: 2500, totalPurchases: 485000, outstandingBalance: 0, joinDate: '2024-03-15', birthday: '1990-05-12', anniversary: '2015-11-20' },
  { id: 'cust002', name: 'Ram Bahadur Thapa', phone: '9851234567', email: 'ram.thapa@yahoo.com', address: 'Lazimpat, Kathmandu', pan: '987654321', citizenship: 'Yes', loyaltyPoints: 4200, totalPurchases: 1250000, outstandingBalance: 35000, joinDate: '2023-01-10', birthday: '1985-08-25', anniversary: '2012-02-14' },
  { id: 'cust003', name: 'Anita Gurung', phone: '9861234567', email: 'anita.g@gmail.com', address: 'Lakeside, Pokhara', pan: '', citizenship: 'No', loyaltyPoints: 800, totalPurchases: 125000, outstandingBalance: 0, joinDate: '2025-06-20', birthday: '1995-12-03', anniversary: '' },
  { id: 'cust004', name: 'Bikash Shrestha', phone: '9801234567', email: 'bikash.s@hotmail.com', address: 'New Road, Kathmandu', pan: '456789123', citizenship: 'Yes', loyaltyPoints: 6800, totalPurchases: 2450000, outstandingBalance: 120000, joinDate: '2022-09-05', birthday: '1978-03-18', anniversary: '2005-06-30' },
  { id: 'cust005', name: 'Pramila Rai', phone: '9811234567', email: 'pramila.rai@gmail.com', address: 'Dharan, Sunsari', pan: '321654987', citizenship: 'Yes', loyaltyPoints: 1500, totalPurchases: 350000, outstandingBalance: 0, joinDate: '2024-11-12', birthday: '1992-07-22', anniversary: '2018-04-10' },
  { id: 'cust006', name: 'Deepak Adhikari', phone: '9821234567', email: 'deepak.a@gmail.com', address: 'Biratnagar, Morang', pan: '', citizenship: 'Yes', loyaltyPoints: 300, totalPurchases: 68000, outstandingBalance: 0, joinDate: '2025-12-01', birthday: '1998-01-30', anniversary: '' },
  { id: 'cust007', name: 'Kamala Devi Joshi', phone: '9741234567', email: '', address: 'Butwal, Rupandehi', pan: '654321789', citizenship: 'Yes', loyaltyPoints: 3800, totalPurchases: 890000, outstandingBalance: 55000, joinDate: '2023-07-22', birthday: '1982-11-08', anniversary: '2008-12-25' },
  { id: 'cust008', name: 'Sujan Tamang', phone: '9871234567', email: 'sujan.t@gmail.com', address: 'Boudha, Kathmandu', pan: '789123456', citizenship: 'Yes', loyaltyPoints: 1200, totalPurchases: 275000, outstandingBalance: 0, joinDate: '2025-02-14', birthday: '1993-09-14', anniversary: '2020-01-05' },
  { id: 'cust009', name: 'Gita Magar', phone: '9831234567', email: 'gita.m@gmail.com', address: 'Hetauda, Makwanpur', pan: '', citizenship: 'No', loyaltyPoints: 500, totalPurchases: 95000, outstandingBalance: 15000, joinDate: '2025-08-30', birthday: '1996-04-05', anniversary: '' },
  { id: 'cust010', name: 'Rajesh Kumar Yadav', phone: '9851234890', email: 'rajesh.y@gmail.com', address: 'Birgunj, Parsa', pan: '147258369', citizenship: 'Yes', loyaltyPoints: 5500, totalPurchases: 1800000, outstandingBalance: 0, joinDate: '2022-04-18', birthday: '1980-06-21', anniversary: '2007-09-15' },
];

export const SAMPLE_SUPPLIERS = [
  { id: 'sup001', name: 'Nepal Gold House Pvt. Ltd.', type: 'Gold Supplier', contact: 'Suresh Golchha', phone: '01-4245678', email: 'info@nepalgoldhouse.com', address: 'New Road, Kathmandu', pan: 'SUP123456', balance: 250000 },
  { id: 'sup002', name: 'Himalayan Silver Traders', type: 'Silver Supplier', contact: 'Binod Agrawal', phone: '01-4345678', email: 'sales@himsilver.com', address: 'Thamel, Kathmandu', pan: 'SUP654321', balance: 45000 },
  { id: 'sup003', name: 'Kathmandu Diamond Co.', type: 'Diamond & Gems', contact: 'Rajiv Manandhar', phone: '01-4445678', email: 'info@ktmdiamond.com', address: 'Durbarmarg, Kathmandu', pan: 'SUP789012', balance: 580000 },
];

export const SAMPLE_SALES = [
  { id: 'sale001', invoiceNo: 'INV-2026-0001', date: '2026-04-03', customerId: 'cust001', items: [{ inventoryId: 'inv001', quantity: 1, unitPrice: 124500 }], subtotal: 124500, vat: 16185, discount: 0, exchangeValue: 0, total: 140685, paymentMode: 'cash', status: 'completed' },
  { id: 'sale002', invoiceNo: 'INV-2026-0002', date: '2026-04-03', customerId: 'cust002', items: [{ inventoryId: 'inv002', quantity: 1, unitPrice: 145000 }, { inventoryId: 'inv015', quantity: 1, unitPrice: 155000 }], subtotal: 300000, vat: 39000, discount: 5000, exchangeValue: 80000, total: 254000, paymentMode: 'bank', status: 'completed' },
  { id: 'sale003', invoiceNo: 'INV-2026-0003', date: '2026-04-02', customerId: 'cust004', items: [{ inventoryId: 'inv006', quantity: 1, unitPrice: 850000 }], subtotal: 850000, vat: 110500, discount: 15000, exchangeValue: 0, total: 945500, paymentMode: 'card', status: 'completed' },
  { id: 'sale004', invoiceNo: 'INV-2026-0004', date: '2026-04-02', customerId: 'cust005', items: [{ inventoryId: 'inv017', quantity: 1, unitPrice: 89000 }], subtotal: 89000, vat: 11570, discount: 0, exchangeValue: 25000, total: 75570, paymentMode: 'esewa', status: 'completed' },
  { id: 'sale005', invoiceNo: 'INV-2026-0005', date: '2026-04-01', customerId: 'cust003', items: [{ inventoryId: 'inv014', quantity: 1, unitPrice: 195000 }], subtotal: 195000, vat: 25350, discount: 3000, exchangeValue: 0, total: 217350, paymentMode: 'khalti', status: 'completed' },
  { id: 'sale006', invoiceNo: 'INV-2026-0006', date: '2026-04-01', customerId: 'cust007', items: [{ inventoryId: 'inv010', quantity: 1, unitPrice: 425000 }], subtotal: 425000, vat: 55250, discount: 10000, exchangeValue: 150000, total: 320250, paymentMode: 'cash', status: 'completed' },
  { id: 'sale007', invoiceNo: 'INV-2026-0007', date: '2026-03-31', customerId: 'cust010', items: [{ inventoryId: 'inv020', quantity: 1, unitPrice: 275000 }, { inventoryId: 'inv021', quantity: 1, unitPrice: 185000 }], subtotal: 460000, vat: 59800, discount: 8000, exchangeValue: 0, total: 511800, paymentMode: 'bank', status: 'completed' },
  { id: 'sale008', invoiceNo: 'INV-2026-0008', date: '2026-03-30', customerId: 'cust008', items: [{ inventoryId: 'inv004', quantity: 2, unitPrice: 2300 }], subtotal: 4600, vat: 598, discount: 0, exchangeValue: 0, total: 5198, paymentMode: 'cash', status: 'completed' },
];

export const SAMPLE_REPAIRS = [
  { id: 'rep001', customer: 'cust001', itemDescription: 'Gold Ring - resizing', complaint: 'Ring too tight, needs to go from size 16 to 18', status: 'in_progress', estimatedCost: 1500, actualCost: null, dateReceived: '2026-04-01', expectedDate: '2026-04-05', completedDate: null },
  { id: 'rep002', customer: 'cust002', itemDescription: 'Gold Chain - broken clasp', complaint: 'Clasp broken, needs replacement', status: 'completed', estimatedCost: 2500, actualCost: 2200, dateReceived: '2026-03-28', expectedDate: '2026-04-02', completedDate: '2026-04-01' },
  { id: 'rep003', customer: 'cust004', itemDescription: 'Diamond Ring - stone reset', complaint: 'Diamond loose in setting', status: 'pending', estimatedCost: 3500, actualCost: null, dateReceived: '2026-04-02', expectedDate: '2026-04-08', completedDate: null },
  { id: 'rep004', customer: 'cust005', itemDescription: 'Silver Bangle - polish', complaint: 'Tarnished, needs professional polishing', status: 'in_progress', estimatedCost: 800, actualCost: null, dateReceived: '2026-04-01', expectedDate: '2026-04-04', completedDate: null },
  { id: 'rep005', customer: 'cust007', itemDescription: 'Gold Earring - hook repair', complaint: 'One earring hook bent', status: 'pending', estimatedCost: 1200, actualCost: null, dateReceived: '2026-04-03', expectedDate: '2026-04-07', completedDate: null },
  { id: 'rep006', customer: 'cust003', itemDescription: 'Tilahari - restringing', complaint: 'Pote mala thread worn out', status: 'in_progress', estimatedCost: 2000, actualCost: null, dateReceived: '2026-03-30', expectedDate: '2026-04-04', completedDate: null },
  { id: 'rep007', customer: 'cust010', itemDescription: 'Gold Chain - lengthening', complaint: 'Add 2 inches to chain length', status: 'pending', estimatedCost: 5000, actualCost: null, dateReceived: '2026-04-03', expectedDate: '2026-04-10', completedDate: null },
  { id: 'rep008', customer: 'cust006', itemDescription: 'Silver Ring - engraving', complaint: 'Add name engraving inside band', status: 'completed', estimatedCost: 600, actualCost: 600, dateReceived: '2026-03-29', expectedDate: '2026-04-01', completedDate: '2026-03-31' },
  { id: 'rep009', customer: 'cust009', itemDescription: 'Gold Bangle - dent repair', complaint: 'Small dent on surface', status: 'in_progress', estimatedCost: 1800, actualCost: null, dateReceived: '2026-04-02', expectedDate: '2026-04-06', completedDate: null },
  { id: 'rep010', customer: 'cust008', itemDescription: 'Pendant - chain replacement', complaint: 'Original chain lost, needs new chain', status: 'pending', estimatedCost: 8500, actualCost: null, dateReceived: '2026-04-03', expectedDate: '2026-04-08', completedDate: null },
  { id: 'rep011', customer: 'cust001', itemDescription: 'Necklace - clasp upgrade', complaint: 'Wants safety clasp upgrade', status: 'pending', estimatedCost: 3000, actualCost: null, dateReceived: '2026-04-03', expectedDate: '2026-04-09', completedDate: null },
  { id: 'rep012', customer: 'cust004', itemDescription: 'Gold Ring - rhodium plating', complaint: 'White gold ring needs replating', status: 'in_progress', estimatedCost: 2500, actualCost: null, dateReceived: '2026-04-01', expectedDate: '2026-04-05', completedDate: null },
];

export const SAMPLE_ORDERS = [
  { id: 'ord001', customer: 'cust002', description: 'Custom Gold Necklace with Ruby', status: 'in_production', karigar: 'Hari Sunar', metalType: 'gold', purity: '22k', estimatedWeight: 35, metalIssued: 38, metalReturned: 0, stage: 'setting', startDate: '2026-03-25', expectedDate: '2026-04-10', advance: 200000 },
  { id: 'ord002', customer: 'cust004', description: 'Engagement Ring Set (Pair)', status: 'design', karigar: 'Bishnu Sunar', metalType: 'gold', purity: '18k', estimatedWeight: 12, metalIssued: 0, metalReturned: 0, stage: 'design', startDate: '2026-04-01', expectedDate: '2026-04-20', advance: 50000 },
  { id: 'ord003', customer: 'cust010', description: 'Heavy Gold Chain 24K', status: 'in_production', karigar: 'Hari Sunar', metalType: 'gold', purity: '24k', estimatedWeight: 50, metalIssued: 55, metalReturned: 0, stage: 'polishing', startDate: '2026-03-20', expectedDate: '2026-04-05', advance: 350000 },
  { id: 'ord004', customer: 'cust001', description: 'Silver Dinner Set', status: 'in_production', karigar: 'Ganesh Tamrakar', metalType: 'silver', purity: '925', estimatedWeight: 500, metalIssued: 520, metalReturned: 0, stage: 'casting', startDate: '2026-03-28', expectedDate: '2026-04-15', advance: 25000 },
  { id: 'ord005', customer: 'cust007', description: 'Gold Tilahari with Pote', status: 'quality_check', karigar: 'Bishnu Sunar', metalType: 'gold', purity: '22k', estimatedWeight: 18, metalIssued: 20, metalReturned: 1.5, stage: 'quality_check', startDate: '2026-03-22', expectedDate: '2026-04-04', advance: 100000 },
  { id: 'ord006', customer: 'cust005', description: 'Diamond Earring Pair', status: 'pending', karigar: '', metalType: 'gold', purity: '18k', estimatedWeight: 6, metalIssued: 0, metalReturned: 0, stage: 'pending', startDate: '2026-04-03', expectedDate: '2026-04-25', advance: 80000 },
  { id: 'ord007', customer: 'cust003', description: 'Pearl Necklace Restringing', status: 'completed', karigar: 'Ganesh Tamrakar', metalType: 'gold', purity: '22k', estimatedWeight: 5, metalIssued: 5.5, metalReturned: 0.4, stage: 'finished', startDate: '2026-03-15', expectedDate: '2026-03-28', advance: 15000 },
  { id: 'ord008', customer: 'cust006', description: 'Baby Gold Bangles (Pair)', status: 'in_production', karigar: 'Hari Sunar', metalType: 'gold', purity: '22k', estimatedWeight: 8, metalIssued: 9, metalReturned: 0, stage: 'casting', startDate: '2026-04-02', expectedDate: '2026-04-12', advance: 45000 },
];

export const STORE_INFO = {
  name: 'Shreehans RKS Khushi Jewellers',
  nameNp: 'श्रीहंस आर.के.एस. खुशी ज्वेलर्स',
  address: 'Nepal',
  phone: '01-xxxxxxx',
  mobile: '98xxxxxxxx',
  email: 'info@shreehanskhushi.com.np',
  pan: '000000000',
  vatNo: 'VAT-000000000',
  tagline: 'Trusted Jewellers',
};

export const DAILY_SALES_DATA = [
  { date: 'Chaitra 14', sales: 485000 },
  { date: 'Chaitra 15', sales: 320000 },
  { date: 'Chaitra 16', sales: 750000 },
  { date: 'Chaitra 17', sales: 190000 },
  { date: 'Chaitra 18', sales: 610000 },
  { date: 'Chaitra 19', sales: 437500 },
  { date: 'Chaitra 20', sales: 524500 },
];

export const MONTHLY_SALES_DATA = [
  { month: 'Shrawan', sales: 4500000 },
  { month: 'Bhadra', sales: 3800000 },
  { month: 'Ashwin', sales: 8500000 },
  { month: 'Kartik', sales: 12000000 },
  { month: 'Mangsir', sales: 6200000 },
  { month: 'Poush', sales: 5100000 },
  { month: 'Magh', sales: 4800000 },
  { month: 'Falgun', sales: 7200000 },
  { month: 'Chaitra', sales: 5245000 },
];
