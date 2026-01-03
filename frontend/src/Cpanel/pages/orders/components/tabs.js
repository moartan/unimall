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
  const payment = (order.paymentStatus || order.status || '').toLowerCase();
  const fulfill = (order.fulfillmentStatus || order.fulfillment || '').toLowerCase();

  if (payment.includes('fail') || payment.includes('hold')) return 'failed';
  if (fulfill.includes('cancel')) return 'cancelled';
  if (fulfill.includes('return') || fulfill === 'refund_requested') return 'return-refund';
  if (fulfill === 'delivered') return 'delivered';
  if (fulfill === 'shipped') return 'shipped-transit';
  if (fulfill.includes('out') || fulfill.includes('delivery')) return 'shipped-transit';
  if (fulfill === 'processing') return 'awaiting-fulfillment';
  if (fulfill === 'pending') return payment !== 'paid' ? 'awaiting-payment' : 'awaiting-fulfillment';
  if (payment && payment !== 'paid') return 'awaiting-payment';
  return 'awaiting-fulfillment';
};
