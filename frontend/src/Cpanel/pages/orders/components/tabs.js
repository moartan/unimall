export const orderTabs = [
  { key: 'all', label: 'All' },
  { key: 'awaiting-payment', label: 'Awaiting Payment' },
  { key: 'awaiting-fulfillment', label: 'Awaiting Fulfillment' },
  { key: 'shipped-transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'return-refund', label: 'Returns / Refund' },
  { key: 'failed', label: 'Fail / Hold' },
  { key: 'cancelled', label: 'Cancelled' },
];

export const deriveStage = (order) => {
  if (order.stage) return order.stage;
  const payment = (order.paymentStatus || '').toLowerCase();
  const status = (order.status || '').toLowerCase();

  if (payment.includes('fail') || payment.includes('hold')) return 'failed';
  if (status === 'canceled') return 'cancelled';
  if (status === 'return') return 'return-refund';
  if (status === 'delivered') return 'delivered';
  if (status === 'in_transit') return 'shipped-transit';
  if (status === 'preparing') return 'awaiting-fulfillment';
  if (status === 'confirm' || status === 'request') return payment === 'paid' ? 'awaiting-fulfillment' : 'awaiting-payment';
  if (status === 'pending') return payment === 'paid' ? 'awaiting-fulfillment' : 'awaiting-payment';
  if (payment && payment !== 'paid') return 'awaiting-payment';
  return 'awaiting-fulfillment';
};
