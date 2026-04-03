// Formatters for Nepali Jewellery ERP

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'रू 0';
  const num = Number(amount);
  if (isNaN(num)) return 'रू 0';
  
  // Nepali number formatting: 1,00,000 pattern
  const isNegative = num < 0;
  const absNum = Math.abs(Math.round(num));
  const str = absNum.toString();
  
  if (str.length <= 3) {
    return `${isNegative ? '-' : ''}रू ${str}`;
  }
  
  let result = str.slice(-3);
  let remaining = str.slice(0, -3);
  
  while (remaining.length > 0) {
    const chunk = remaining.slice(-2);
    remaining = remaining.slice(0, -2);
    result = chunk + ',' + result;
  }
  
  return `${isNegative ? '-' : ''}रू ${result}`;
}

export function formatWeight(grams) {
  if (grams === null || grams === undefined) return '0.00g';
  return `${Number(grams).toFixed(2)}g`;
}

export function formatWeightTola(grams) {
  // 1 tola = 11.6638 grams (Nepal standard)
  const tola = grams / 11.6638;
  return `${tola.toFixed(2)} tola`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-NP');
}

export function getMetalLabel(metalType) {
  const labels = {
    gold: 'Gold (सुन)',
    silver: 'Silver (चाँदी)',
    platinum: 'Platinum (प्लेटिनम)',
  };
  return labels[metalType] || metalType;
}

export function getPurityLabel(purityId) {
  const labels = {
    '24k': '24K Pure Gold',
    '22k': '22K Gold',
    '18k': '18K Gold',
    '14k': '14K Gold',
    '10k': '10K Gold',
    '925': '925 Silver',
    '999s': '999 Pure Silver',
    'pt950': 'Platinum 950',
  };
  return labels[purityId] || purityId;
}

export function getStatusColor(status) {
  const colors = {
    in_stock: 'emerald',
    low_stock: 'gold',
    out_of_stock: 'ruby',
    completed: 'emerald',
    in_progress: 'sapphire',
    pending: 'gold',
    cancelled: 'ruby',
    design: 'amethyst',
    in_production: 'sapphire',
    quality_check: 'gold',
  };
  return colors[status] || 'gold';
}

export function getStatusLabel(status) {
  const labels = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
    completed: 'Completed',
    in_progress: 'In Progress',
    pending: 'Pending',
    cancelled: 'Cancelled',
    design: 'Design',
    in_production: 'In Production',
    quality_check: 'QC Check',
    finished: 'Finished',
    casting: 'Casting',
    setting: 'Setting',
    polishing: 'Polishing',
  };
  return labels[status] || status;
}
