/**
 * Transactional email via Resend (https://resend.com).
 *
 * Required env:
 *   RESEND_API_KEY       — Resend API key (never hardcode it)
 * Optional env:
 *   RESEND_FROM          — default "Kite FMCG Orders <orders@send.kitepk.com>" (verified domain)
 *   ADMIN_ORDER_EMAIL    — comma-separated extra admin recipients
 *   ADMIN_PANEL_URL      — link in admin emails
 *
 * IMPORTANT (serverless): always `await` these functions inside route handlers,
 * otherwise the function may be frozen before the HTTP request to Resend finishes.
 */

const DEFAULT_FROM = 'Kite FMCG Orders <orders@send.kitepk.com>';
const REPLY_TO = 'sales@kitepk.com';
// Every order must reach both inboxes (business requirement).
const REQUIRED_ADMIN_RECIPIENTS = ['sales@kitepk.com', 'kitematchpk@gmail.com'];

const htmlEscapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => htmlEscapeMap[ch]);
}

function formatMoney(value) {
  const n = Number(value) || 0;
  return `Rs ${n.toLocaleString('en-PK')}`;
}

function formatDateTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Karachi' });
}

export function getAdminRecipients() {
  const extra = String(process.env.ADMIN_ORDER_EMAIL || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.includes('@'));
  return Array.from(new Set([...REQUIRED_ADMIN_RECIPIENTS, ...extra]));
}

/**
 * Send one email through Resend. Retries once on network errors / 5xx / 429.
 * @returns {Promise<boolean>}
 */
async function sendViaResend({ to, subject, html, text, replyTo }) {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    console.error('[email] RESEND_API_KEY is not configured — email not sent:', subject);
    return false;
  }
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (recipients.length === 0) return false;

  const payload = {
    from: (process.env.RESEND_FROM || DEFAULT_FROM).trim(),
    to: recipients,
    subject,
    html,
    text,
    ...(replyTo && { reply_to: replyTo }),
  };

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return true;
      const data = await res.json().catch(() => ({}));
      console.error(`[email] Resend rejected "${subject}" (${res.status}):`, data?.message || data);
      if (res.status < 500 && res.status !== 429) return false; // permanent error — don't retry
    } catch (err) {
      console.error(`[email] Resend request failed (attempt ${attempt}):`, err.message);
    }
  }
  return false;
}

function orderTypeLabel(order) {
  if (order.type === 'cart') return 'Cart Order';
  if (order.type === 'product') return 'Product Order';
  return 'Package Order';
}

function itemLines(order) {
  return (Array.isArray(order.items) ? order.items : []).map((item) => {
    const name = item.title || item.productId || item.promotionId || 'Item';
    const details = [item.brandName, item.selectedVariant].filter(Boolean).join(' · ');
    return {
      name: details ? `${name} (${details})` : name,
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      lineTotal: Number(item.lineTotal) || (Number(item.price) || 0) * (Number(item.quantity) || 1),
    };
  });
}

function buildText(order, heading) {
  const lines = [
    heading,
    '',
    `Order No.: ${order.orderNumber}`,
    `Order Type: ${orderTypeLabel(order)}`,
    `Date: ${formatDateTime(order.createdAt)}`,
    `Payment: ${order.paymentMethod}`,
    '',
    'Items:',
    ...itemLines(order).map((l, i) => `  ${i + 1}. ${l.name} — ${l.quantity} × ${formatMoney(l.price)} = ${formatMoney(l.lineTotal)}`),
    '',
    `Shipping: ${formatMoney(order.shippingCost)}`,
    `Total: ${formatMoney(order.totalAmount)}`,
    '',
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Address: ${order.address}, ${order.city}`,
  ];
  if (order.note) lines.push(`Note: ${order.note}`);
  return lines.join('\n');
}

function buildHtml(order, { heading, intro, adminUrl }) {
  const rows = itemLines(order)
    .map(
      (l) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(l.name)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${l.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(formatMoney(l.lineTotal))}</td>
        </tr>`
    )
    .join('');

  return `<!doctype html>
<html>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${escapeHtml(heading)}</title></head>
  <body style="margin:0;padding:20px;font-family:Arial,sans-serif;background:#fafafa;color:#333;">
    <div style="max-width:600px;margin:0 auto;background:#fff;padding:28px;border-radius:8px;border:1px solid #eaeaea;">
      <h2 style="margin-top:0;color:#111;">${escapeHtml(heading)}</h2>
      ${intro ? `<p style="color:#555;font-size:15px;line-height:1.5;">${escapeHtml(intro)}</p>` : ''}
      <p style="color:#555;font-size:14px;line-height:1.6;">
        <strong>Order No:</strong> ${escapeHtml(order.orderNumber)}<br>
        <strong>Order Type:</strong> ${escapeHtml(orderTypeLabel(order))}<br>
        <strong>Status:</strong> ${escapeHtml(order.status || 'pending')}<br>
        <strong>Payment:</strong> ${escapeHtml(order.paymentMethod)}<br>
        <strong>Date:</strong> ${escapeHtml(formatDateTime(order.createdAt))}
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px;">
        <thead><tr>
          <th style="text-align:left;padding-bottom:6px;border-bottom:2px solid #ddd;">Item</th>
          <th style="text-align:center;padding-bottom:6px;border-bottom:2px solid #ddd;">Qty</th>
          <th style="text-align:right;padding-bottom:6px;border-bottom:2px solid #ddd;">Amount</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align:right;font-size:14px;line-height:1.7;margin-top:12px;">
        Shipping: ${escapeHtml(formatMoney(order.shippingCost))}<br>
        <strong style="font-size:16px;">Total: ${escapeHtml(formatMoney(order.totalAmount))}</strong>
      </p>
      <hr style="border:0;border-top:1px solid #eaeaea;margin:20px 0;">
      <h3 style="margin-top:0;color:#111;">Delivery Details</h3>
      <p style="color:#555;font-size:14px;line-height:1.6;">
        <strong>Name:</strong> ${escapeHtml(order.customerName)}<br>
        <strong>Phone:</strong> ${escapeHtml(order.phone)}<br>
        <strong>Email:</strong> ${escapeHtml(order.email)}<br>
        <strong>Address:</strong> ${escapeHtml(order.address)}, ${escapeHtml(order.city)}
        ${order.note ? `<br><strong>Note:</strong> ${escapeHtml(order.note)}` : ''}
      </p>
      ${
        adminUrl
          ? `<div style="margin-top:28px;text-align:center;"><a href="${escapeHtml(adminUrl)}" style="background:#000;color:#fff;text-decoration:none;padding:12px 24px;border-radius:4px;font-weight:bold;display:inline-block;">View in Admin Panel</a></div>`
          : ''
      }
    </div>
  </body>
</html>`;
}

/**
 * Sends the admin alert (sales@kitepk.com + kitematchpk@gmail.com + ADMIN_ORDER_EMAIL)
 * and the customer receipt in parallel.
 * @returns {Promise<{ admin: boolean, customer: boolean }>}
 */
export async function sendOrderEmail(order) {
  const adminUrl = process.env.ADMIN_PANEL_URL || 'https://www.kitepk.com/admin/orders';
  const adminSubject = `[New Order ${order.orderNumber}] ${order.customerName} - ${formatMoney(order.totalAmount)} (${orderTypeLabel(order)})`;
  const customerSubject = `Order Confirmation #${order.orderNumber} - Kite FMCG`;

  const [admin, customer] = await Promise.all([
    sendViaResend({
      to: getAdminRecipients(),
      subject: adminSubject,
      html: buildHtml(order, { heading: `New Order Received #${order.orderNumber}`, adminUrl }),
      text: buildText(order, 'New Order Received'),
      replyTo: order.email,
    }),
    order.email
      ? sendViaResend({
          to: order.email,
          subject: customerSubject,
          html: buildHtml(order, {
            heading: `Your Order is Confirmed (#${order.orderNumber})`,
            intro: `Thank you, ${order.customerName}! Our team will call you on ${order.phone} to confirm delivery. Payment: Cash on Delivery.`,
          }),
          text: buildText(order, 'Thank you for your order! We will deliver soon via Cash on Delivery.'),
          replyTo: REPLY_TO,
        })
      : Promise.resolve(false),
  ]);

  return { admin, customer };
}

export async function sendStatusUpdateEmail(order) {
  if (!order?.email) return false;
  const subject = `Update on your Kite Order (${order.orderNumber})`;
  const html = buildHtml(order, {
    heading: `Order Status: ${String(order.status || '').toUpperCase()}`,
    intro: `Hi ${order.customerName}, the status of your order ${order.orderNumber} has been updated to "${order.status}". Reply to this email if you have any questions.`,
  });
  return sendViaResend({
    to: order.email,
    subject,
    html,
    text: buildText(order, `Your order status is now: ${order.status}`),
    replyTo: REPLY_TO,
  });
}
