import { NextResponse } from 'next/server';
import { sendOrderEmail } from '@/lib/email';
import { pusher } from '@/lib/pusher';
import { quoteOrder } from '@/lib/pricing';
import { validateCustomer } from '@/lib/validation';
import { insertOrder, toPublicOrder } from '@/lib/orders';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { handleRouteError, jsonError, readJson } from '@/lib/http';
import { PAYMENT_METHODS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function normalizePaymentMethod(value) {
  const v = String(value || 'COD').trim().toLowerCase();
  return PAYMENT_METHODS.find((m) => m.toLowerCase() === v) || null;
}

// POST /api/orders — place an order (Cash on Delivery)
export async function POST(request) {
  const ip = getClientIp(request);
  // Generous limit: Pakistani mobile carriers put many customers behind one IP (CGNAT).
  const limit = rateLimit(`order:${ip}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { message: 'Too many orders from this connection. Please wait a few minutes or call us.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  try {
    const body = await readJson(request);

    // Accept both flat fields and the nested `customer` object.
    const customerInput = {
      customerName: body.customerName ?? body.customer?.name,
      phone: body.phone ?? body.customer?.phone,
      email: body.email ?? body.customer?.email,
      address: body.address ?? body.customer?.address,
      city: body.city ?? body.customer?.city,
      note: body.note,
    };
    const customer = validateCustomer(customerInput);
    if (!customer.ok) return jsonError(customer.errors[0], 400, { errors: customer.errors });

    const paymentMethod = normalizePaymentMethod(body.paymentMethod);
    if (!paymentMethod) return jsonError('Invalid payment method', 400);

    // Authoritative pricing from the database (client prices/totals are ignored).
    const quote = await quoteOrder(body);

    const order = await insertOrder({
      type: quote.type,
      productId: quote.productId ?? null,
      promotionId: quote.promotionId ?? null,
      selectedSkuOrSize: quote.selectedSkuOrSize ?? null,
      quantity: quote.quantity ?? null,
      items: quote.items,
      ...customer.value,
      paymentMethod,
      totalAmount: quote.totalAmount,
      shippingCost: quote.shippingCost,
    });

    // Must be awaited: serverless functions freeze once the response is returned.
    const emailResult = await sendOrderEmail(order).catch((err) => {
      console.error('[orders] sendOrderEmail failed:', err);
      return { admin: false, customer: false };
    });
    if (!emailResult.admin) {
      console.error(`[orders] ADMIN EMAIL NOT DELIVERED for ${order.orderNumber} — check RESEND_API_KEY / Resend dashboard.`);
    }

    if (pusher) {
      // Public channel → send only non-sensitive fields; the admin UI re-fetches full details.
      await pusher
        .trigger('admin-notifications', 'new-order', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: String(order.customerName || '').split(' ')[0],
          totalAmount: order.totalAmount,
          type: order.type,
          createdAt: order.createdAt,
        })
        .catch((err) => console.error('[orders] Pusher error:', err.message));
    }

    // The person who just placed the order can see their own details on the confirmation page;
    // the public GET /api/orders/:id lookup stays reduced.
    return NextResponse.json(
      { ...toPublicOrder(order), phone: order.phone, email: order.email, address: order.address, note: order.note },
      { status: 201 }
    );
  } catch (err) {
    return handleRouteError(err, 'create order');
  }
}
