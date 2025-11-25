export const orderPlacedTemplate = (order) =>
  `
  <div style="font-family: Arial, sans-serif; color:#222;">
    <h2>Thanks for your order</h2>
    <p>Order: <strong>${order.orderCode}</strong></p>
    <p>Total: <strong>${order.grandTotal}</strong></p>
    <p>We’ll notify you as it moves through processing and delivery.</p>
  </div>
`;

export const orderStatusTemplate = (order) =>
  `
  <div style="font-family: Arial, sans-serif; color:#222;">
    <h2>Status Update</h2>
    <p>Order: <strong>${order.orderCode}</strong></p>
    <p>Status: <strong>${order.fulfillmentStatus}</strong></p>
  </div>
`;

export const refundRequestedTemplate = (order) =>
  `
  <div style="font-family: Arial, sans-serif; color:#222;">
    <h2>Refund Requested</h2>
    <p>Order: <strong>${order.orderCode}</strong></p>
    <p>We received your request and will review it shortly.</p>
  </div>
`;
