import emailjs from '@emailjs/nodejs';
import nodemailer from 'nodemailer';

const htmlEscapeMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => htmlEscapeMap[ch]);
}

function displayValue(value, fallback = "-") {
  return value == null || value === "" ? fallback : String(value);
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  });
}

function getOrderTypeLabel(order) {
  const isProduct = order.type === "product";
  const isCart = order.type === "cart";
  return isCart ? "Cart Order" : (isProduct ? "Product Order" : "Promotion Order");
}

function getItemName(order, productOrPromotion) {
  const isProduct = order.type === "product";
  const isCart = order.type === "cart";
  return isCart
    ? "Cart Order"
    : (isProduct
      ? productOrPromotion?.title || order.productId
      : productOrPromotion?.title || order.promotionId);
}

function buildOrderDetailsText(order, productOrPromotion) {
  const isProduct = order.type === "product";
  const isCart = order.type === "cart";
  const itemName = getItemName(order, productOrPromotion);
  const orderTypeLabel = getOrderTypeLabel(order);

  const lines = [];
  lines.push(`Order No.: ${displayValue(order.orderNumber || order._id || order.id || order.orderId)}`);
  lines.push(`Order Type: ${orderTypeLabel}`);
  if (isCart) {
    lines.push(`Cart Items:`);
    (order.items || []).forEach((item, i) => {
      if (item.itemType === 'promotion') {
        lines.push(`  ${i + 1}. Promotion: ${item.promotionId}`);
      } else {
        lines.push(`  ${i + 1}. Product: ${item.productId} ${item.brandName ? `(${item.brandName})` : ''}`);
        lines.push(`     Variant: ${item.selectedVariant || 'N/A'}`);
      }
      lines.push(`     Qty: ${item.quantity}`);
    });
  } else if (isProduct) {
    lines.push(`Product: ${itemName}`);
  } else {
    lines.push(`Promotion Package: ${itemName}`);
  }
  if (!isCart && order.selectedSkuOrSize) {
    lines.push(`Selected SKU/Size: ${order.selectedSkuOrSize}`);
  }
  if (!isCart) {
    lines.push(`Quantity: ${displayValue(order.quantity, 1)}`);
  }
  if (order.shippingCost != null) lines.push(`Shipping Cost: Rs ${order.shippingCost}`);
  if (order.totalAmount != null) lines.push(`Total Amount: Rs ${order.totalAmount}`);

  return lines.join("\n");
}

function createSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    const port = Number(process.env.SMTP_PORT || (process.env.SMTP_SECURE === 'true' ? 465 : 587));
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  const gmailUser = process.env.GMAIL_USER || (process.env.ADMIN_EMAIL?.includes('@gmail.com') ? process.env.ADMIN_EMAIL : null);
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

  return null;
}

async function sendViaResend({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const defaultFrom = process.env.RESEND_FROM || 'Kite FMCG Orders <orders@kitepk.com>';
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (recipients.length === 0) return false;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: defaultFrom,
        to: recipients,
        subject,
        html,
        text,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`[Resend] Successfully sent email to ${recipients.join(', ')}:`, data.id);
      return true;
    }

    console.warn(`[Resend Warning] ${res.status}:`, data.message || data);

    // If custom domain is awaiting DNS verification, deliver to registered owner
    if (res.status === 403 && data.message?.includes('verify a domain')) {
      const ownerRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Kite Orders <onboarding@resend.dev>',
          to: ['kitematchpk@gmail.com'],
          subject: `[Kite Order Alert] ${subject}`,
          html,
          text,
        }),
      });
      const ownerData = await ownerRes.json().catch(() => ({}));
      if (ownerRes.ok) {
        console.log(`[Resend] Successfully alerted owner kitematchpk@gmail.com:`, ownerData.id);
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error(`[Resend Error]:`, err.message);
    return false;
  }
}

async function sendViaEmailJS(templateId, templateParams) {
  if (!process.env.EMAILJS_SERVICE_ID || !templateId || !process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_PRIVATE_KEY) {
    return false;
  }

  try {
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      templateId,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );
    console.log(`[EmailJS] Successfully sent via template ${templateId}`);
    return true;
  } catch (error) {
    console.error(`[EmailJS Error] Failed via template ${templateId}:`, {
      status: error?.status,
      text: error?.text,
      message: error?.message,
    });
    return false;
  }
}

export async function sendOrderEmail(order, productOrPromotion) {
  const adminOrderEmail = process.env.ADMIN_ORDER_EMAIL || process.env.CLIENT_ORDER_EMAIL || process.env.ADMIN_EMAIL || 'admin@kitepk.com';
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || `Kite FMCG Orders <orders@kitepk.com>`;

  const isCart = order.type === "cart";
  const itemName = getItemName(order, productOrPromotion);
  const orderTypeLabel = getOrderTypeLabel(order);
  const orderNumber = order.orderNumber || order._id || order.id || 'N/A';
  const subject = `[New Order ${orderNumber}] ${order.customerName} - Rs. ${order.totalAmount} (${orderTypeLabel})`;

  const createdAt = formatDateTime(order.createdAt);
  const paymentMethod = displayValue(order.paymentMethod);
  const adminPanelUrl = process.env.ADMIN_PANEL_URL || process.env.FRONTEND_URL || 'https://www.kitepk.com/admin/orders';

  const orderDetailsText = buildOrderDetailsText(order, productOrPromotion);

  const buildHtml = (title, showAdminBtn) => `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #fafafa; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
          <h2 style="margin-top: 0; color: #111;">${escapeHtml(title)}</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.5;">
            <strong>Order No:</strong> ${escapeHtml(orderNumber)}<br>
            <strong>Order Type:</strong> ${escapeHtml(orderTypeLabel)}<br>
            <strong>Status:</strong> ${escapeHtml(order.status || 'pending')}<br>
            <strong>Payment:</strong> ${escapeHtml(paymentMethod)}<br>
            <strong>Date:</strong> ${escapeHtml(createdAt)}
          </p>
          
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">
          
          <h3 style="margin-top: 0; color: #111;">Order Summary</h3>
          <pre style="background: #f9f9f9; padding: 15px; border-radius: 6px; font-family: inherit; font-size: 14px; color: #444; border: 1px solid #eee; overflow-x: auto; white-space: pre-wrap;">${escapeHtml(orderDetailsText)}</pre>
          
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">
          
          <h3 style="margin-top: 0; color: #111;">Customer Details</h3>
          <p style="color: #555; font-size: 15px; line-height: 1.5;">
            <strong>Name:</strong> ${escapeHtml(order.customerName)}<br>
            <strong>Phone:</strong> ${escapeHtml(order.phone)}<br>
            ${order.email ? `<strong>Email:</strong> ${escapeHtml(order.email)}<br>` : ''}
            <strong>City:</strong> ${escapeHtml(order.city)}<br>
            <strong>Address:</strong> ${escapeHtml(order.address)}<br>
            ${order.note ? `<strong>Note:</strong> ${escapeHtml(order.note)}` : ''}
          </p>
          
          ${showAdminBtn && adminPanelUrl ? `
          <div style="margin-top: 30px; text-align: center;">
            <a href="${escapeHtml(adminPanelUrl)}" style="background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; display: inline-block;">
              View in Admin Panel
            </a>
          </div>
          ` : ''}
        </div>
      </body>
    </html>
  `;

  const adminHtml = buildHtml("New Order Received #" + orderNumber, true);
  const customerSubject = `Order Confirmation #${orderNumber} - Kite FMCG`;
  const customerHtml = buildHtml("Your Order is Confirmed (#" + orderNumber + ")", false);

  // 1. Try Resend
  let resendSent = await sendViaResend({
    to: adminOrderEmail,
    subject: subject,
    html: adminHtml,
    text: `New Order Received\n\n${orderDetailsText}\n\nCustomer: ${order.customerName} (${order.phone})\nAddress: ${order.address}, ${order.city}`,
  });

  if (order.email) {
    await sendViaResend({
      to: order.email,
      subject: customerSubject,
      html: customerHtml,
      text: `Thank you for your order!\n\n${orderDetailsText}\n\nWe will deliver your order soon via Cash on Delivery.`,
    });
  }

  if (resendSent) {
    return;
  }

  // 2. Try Nodemailer SMTP / Gmail
  const smtp = createSmtpTransporter();
  if (smtp) {
    try {
      await smtp.sendMail({
        from: fromEmail,
        to: adminOrderEmail,
        subject: subject,
        text: `New Order Received\n\n${orderDetailsText}\n\nCustomer: ${order.customerName} (${order.phone})\nAddress: ${order.address}, ${order.city}`,
        html: adminHtml,
      });
      console.log(`[SMTP] Successfully sent admin order email to ${adminOrderEmail}`);
    } catch (err) {
      console.error(`[SMTP Error] Failed sending admin email:`, err.message);
    }

    if (order.email) {
      try {
        await smtp.sendMail({
          from: fromEmail,
          to: order.email,
          subject: customerSubject,
          text: `Thank you for your order!\n\n${orderDetailsText}\n\nWe will deliver your order soon via Cash on Delivery.`,
          html: customerHtml,
        });
        console.log(`[SMTP] Successfully sent customer confirmation email to ${order.email}`);
      } catch (err) {
        console.error(`[SMTP Error] Failed sending customer email:`, err.message);
      }
    }
    return;
  }

  // 2. Try EmailJS
  if (process.env.EMAILJS_TEMPLATE_ID_ADMIN) {
    await sendViaEmailJS(process.env.EMAILJS_TEMPLATE_ID_ADMIN, {
      to_name: "Admin",
      to_email: adminOrderEmail,
      subject: subject,
      html_content: adminHtml,
    });
  }

  if (order.email && process.env.EMAILJS_TEMPLATE_ID_CUSTOMER) {
    await sendViaEmailJS(process.env.EMAILJS_TEMPLATE_ID_CUSTOMER, {
      to_email: order.email,
      subject: customerSubject,
      html_content: customerHtml,
    });
  }
}

export async function sendStatusUpdateEmail(order) {
  if (!order.email) return;

  const orderNumber = order.orderNumber || order._id || order.id || 'N/A';
  const subject = `Update on your Kite Order (${orderNumber})`;
  const orderDetailsText = buildOrderDetailsText(order, null);
  const paymentMethod = displayValue(order.paymentMethod);
  const createdAt = formatDateTime(order.createdAt);
  const orderTypeLabel = getOrderTypeLabel(order);

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #fafafa; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
          <h2 style="margin-top: 0; color: #111;">Order Status Update</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Hi ${escapeHtml(order.customerName)},
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            The status of your order (<strong>${escapeHtml(orderNumber)}</strong>) has been updated to:
          </p>
          <div style="background: #f0f0f0; padding: 15px; border-radius: 6px; text-align: center; font-size: 18px; font-weight: bold; color: #111; text-transform: uppercase; margin: 20px 0;">
            ${escapeHtml(order.status)}
          </div>
          
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">
          
          <h3 style="margin-top: 0; color: #111;">Order Summary</h3>
          <p style="color: #555; font-size: 15px; line-height: 1.5;">
            <strong>Order Type:</strong> ${escapeHtml(orderTypeLabel)}<br>
            <strong>Payment:</strong> ${escapeHtml(paymentMethod)}<br>
            <strong>Date:</strong> ${escapeHtml(createdAt)}
          </p>
          <pre style="background: #f9f9f9; padding: 15px; border-radius: 6px; font-family: inherit; font-size: 14px; color: #444; border: 1px solid #eee; overflow-x: auto; white-space: pre-wrap;">${escapeHtml(orderDetailsText)}</pre>
          
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">

          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            If you have any questions, feel free to reply to this email.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.5; margin-top: 30px;">
            Thank you,<br>
            Kite FMCG
          </p>
        </div>
      </body>
    </html>
  `;

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || `Kite FMCG <orders@kitepk.com>`;

  // 1. Try Resend
  const resendSent = await sendViaResend({
    to: order.email,
    subject,
    html,
    text: `Update on your Kite Order (${orderNumber}): ${order.status}`,
  });
  if (resendSent) return;

  // 2. Try Nodemailer SMTP / Gmail
  const smtp = createSmtpTransporter();
  if (smtp) {
    try {
      await smtp.sendMail({
        from: fromEmail,
        to: order.email,
        subject,
        html,
      });
      console.log(`[SMTP] Successfully sent status update email to ${order.email}`);
    } catch (err) {
      console.error(`[SMTP Error] Failed sending status update email:`, err.message);
    }
    return;
  }

  if (process.env.EMAILJS_TEMPLATE_ID_CUSTOMER) {
    await sendViaEmailJS(process.env.EMAILJS_TEMPLATE_ID_CUSTOMER, {
      to_email: order.email,
      subject: subject,
      html_content: html,
    });
  }
}
