import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import PromotionPackage from '@/lib/models/PromotionPackage';
import { sendOrderEmail } from '@/lib/email';
import { pusher } from '@/lib/pusher';

const PHONE_REGEX = /^(?:\+92|92|0)3\d{9}$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const {
      type,
      productId,
      promotionId,
      selectedSkuOrSize,
      quantity,
      customerName,
      phone,
      email,
      address,
      city,
      note,
      paymentMethod,
      items,
      totalAmount,
      shippingCost,
    } = body;

    if (!['product', 'promotion', 'cart'].includes(type)) {
      return NextResponse.json({ message: 'Invalid order type' }, { status: 400 });
    }

    const parsedQuantity = quantity ? Number(quantity) : undefined;
    if (type !== 'cart' && (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 1000)) {
      return NextResponse.json({ message: 'Quantity must be an integer between 1 and 1000' }, { status: 400 });
    }

    if (type === 'cart' && (!Array.isArray(items) || items.length === 0)) {
      return NextResponse.json({ message: 'Cart orders must contain at least one item' }, { status: 400 });
    }

    const normalizedCustomerName = String(customerName || '').trim();
    const normalizedAddress = String(address || '').trim();
    const normalizedCity = String(city || '').trim();
    const normalizedPhone = String(phone || '').replace(/[\s()-]/g, '');

    if (!PHONE_REGEX.test(normalizedPhone)) {
      return NextResponse.json({ message: 'Invalid phone number format' }, { status: 400 });
    }

    if (!normalizedCustomerName || !normalizedAddress || !normalizedCity || !paymentMethod || !email) {
      return NextResponse.json({ message: 'Missing required customer fields (including email)' }, { status: 400 });
    }

    if (!['COD', 'Easypaisa', 'JazzCash'].includes(paymentMethod)) {
      return NextResponse.json({ message: 'Invalid payment method' }, { status: 400 });
    }

    let productOrPromotion = null;
    if (type === 'product') {
      if (!productId) {
        return NextResponse.json({ message: 'productId is required for product orders' }, { status: 400 });
      }
      productOrPromotion = await Product.findOne({ id: productId }).lean();
      if (!productOrPromotion) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }
    } else if (type === 'promotion') {
      if (!promotionId) {
        return NextResponse.json({ message: 'promotionId is required for promotion orders' }, { status: 400 });
      }
      productOrPromotion = await PromotionPackage.findOne({ id: promotionId }).lean();
      if (!productOrPromotion) {
        return NextResponse.json({ message: 'Promotion not found' }, { status: 404 });
      }
    }

    // Generate sequential order number (KT-001, KT-002, ...)
    const orderCount = await Order.countDocuments();
    const orderNumber = `KT-${String(orderCount + 1).padStart(3, '0')}`;

    const order = await Order.create({
      orderNumber,
      type,
      productId: type === 'product' ? productId : undefined,
      promotionId: type === 'promotion' ? promotionId : undefined,
      selectedSkuOrSize,
      quantity: parsedQuantity,
      items: type === 'cart' ? items : undefined,
      customerName: normalizedCustomerName,
      phone: normalizedPhone,
      email,
      address: normalizedAddress,
      city: normalizedCity,
      note,
      paymentMethod,
      totalAmount,
      shippingCost,
    });

    // Also save in local store
    try {
      const { createOrder: saveInStore } = await import('@/lib/store');
      saveInStore(order.toObject ? order.toObject() : order);
    } catch {}

    // Fire-and-forget email notification
    sendOrderEmail(order.toObject ? order.toObject() : order, productOrPromotion).catch((err) => {
      console.error('[Email Error] sendOrderEmail failed:', err);
    });

    // Fire-and-forget Pusher notification
    if (pusher) {
      pusher.trigger('admin-notifications', 'new-order', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        type: order.type,
      }).catch((err) => console.error('Failed to trigger Pusher event:', err));
    }

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.warn('Local order creation failed, checking store or remote fallback:', err.message);

    // Save directly to local persistent store so order is not lost
    try {
      if (body) {
        const { createOrder: saveInStore } = await import('@/lib/store');
        const storedOrder = saveInStore(body);
        if (storedOrder) {
          // Also try remote fallback asynchronously
          import('@/lib/api-fallback').then(({ postRemoteFallback }) => {
            postRemoteFallback('/orders', body).catch(() => {});
          });
          return NextResponse.json(storedOrder, { status: 201 });
        }
      }
    } catch (storeErr) {
      console.warn('Store save failed:', storeErr.message);
    }

    try {
      const { postRemoteFallback } = await import('@/lib/api-fallback');
      if (body) {
        const remoteOrder = await postRemoteFallback('/orders', body);
        if (remoteOrder) {
          return NextResponse.json(remoteOrder, { status: 201 });
        }
      }
    } catch (fallbackErr) {
      console.error('Remote fallback also failed for /api/orders:', fallbackErr.message);
    }
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
  }
}
