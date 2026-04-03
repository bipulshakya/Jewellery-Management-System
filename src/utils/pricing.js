// Pricing Engine for Nepali Jewellery
// VAT: 13% (Nepal)
import { METAL_RATES, PURITY_OPTIONS } from '../data/seedData';

const VAT_RATE = 0.13; // 13% Nepal VAT

export function getMetalRatePerGram(metalType, purity) {
  const purityInfo = PURITY_OPTIONS.find(p => p.id === purity);
  if (!purityInfo) return 0;

  const rates = JSON.parse(localStorage.getItem('metalRates')) || METAL_RATES;

  if (metalType === 'gold') {
    const key = `gold_${purity}`;
    if (rates[key]) return rates[key];
    return rates.gold_24k * purityInfo.factor;
  }
  if (metalType === 'silver') {
    const key = purity === '925' ? 'silver_925' : 'silver_999';
    return rates[key] || rates.silver_999 * purityInfo.factor;
  }
  if (metalType === 'platinum') {
    return rates.platinum * purityInfo.factor;
  }
  return 0;
}

export function calculateItemPrice(item, rates = null) {
  const metalRate = getMetalRatePerGram(item.metalType, item.purity);
  const netWeight = item.netWeight || 0;

  // Base metal value
  const metalValue = netWeight * metalRate;

  // Wastage
  const wastageValue = metalValue * ((item.wastagePercent || 0) / 100);

  // Making charges
  let makingChargeValue = 0;
  if (item.makingChargeType === 'percentage') {
    makingChargeValue = metalValue * ((item.makingCharge || 0) / 100);
  } else {
    makingChargeValue = item.makingCharge || 0;
  }

  // Hallmarking
  const hallmarkingCharge = item.hallmarked ? 500 : 0;

  // Stone value
  const stoneValue = item.stoneValue || 0;

  // Subtotal before VAT
  const subtotal = metalValue + wastageValue + makingChargeValue + hallmarkingCharge + stoneValue;

  // VAT
  const vat = subtotal * VAT_RATE;

  // Total
  const total = subtotal + vat;

  return {
    metalValue: Math.round(metalValue),
    wastageValue: Math.round(wastageValue),
    makingChargeValue: Math.round(makingChargeValue),
    hallmarkingCharge,
    stoneValue,
    subtotal: Math.round(subtotal),
    vat: Math.round(vat),
    total: Math.round(total),
    metalRate,
  };
}

export function calculateCartTotal(cartItems, discount = 0, exchangeValue = 0) {
  let subtotal = 0;
  cartItems.forEach(item => {
    subtotal += item.lineTotal || 0;
  });

  const vat = Math.round(subtotal * VAT_RATE);
  const grandTotal = subtotal + vat - discount - exchangeValue;

  return {
    subtotal: Math.round(subtotal),
    vat,
    discount,
    exchangeValue,
    grandTotal: Math.max(0, Math.round(grandTotal)),
  };
}

export function calculateOldGoldValue(weight, purity) {
  const rate = getMetalRatePerGram('gold', purity);
  // Old gold is typically valued at 95-98% of current rate
  return Math.round(weight * rate * 0.96);
}

export { VAT_RATE };
