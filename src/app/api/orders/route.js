import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { sendOrderEmail } from '@/lib/email';
import { pusher } from '@/lib/pusher';
import { getProductById, getPromotionById, getSettings, createOrder as saveInStore } from '@/lib/store';

const PHONE_REGEX = /^(?:\+92|92|0)3\d{9}$/;

async function fetchPromotionRecord(id) {
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const { data } = await sb.from('promotions').select('*').eq('id', id).single();
      if (data) return data;
    } catch {}
  }
  try { return getPromotionById(id); } catch {}
  return null;
}

async function fetchProductRecord(id) {
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const { data } = await sb.from('products').select('*').eq('id', id).single();
      if (data) return data;
    } catch {}
  }
  try { return getProductById(id); } catch {}
  return null;
}

async function fetchSettingsRecord() {
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const { data } = await sb.from('settings').select('*').eq('id', 1).single();
      if (data) return data;
    } catch {}
  }
  try { return getSettings(); } catch {}
  return { defaultShippingCost: 150 };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    let {
      type, productId, promotionId, selectedSkuOrSize, quantity,
      customerName, phone, email, address, city, note, paymentMethod, items,
    } = body;

    type = type || (Array.isArray(items) && items.length > 0 ? 'cart' : (productId ? 'product' : (promotionId ? 'promotion' : null)));
    customerName = customerName || body.customer?.name;
    phone = phone || body.customer?.phone;
    email = email || body.customer?.email;
    address = address || body.customer?.address;
    city = city || body.customer?.city;

    if (typeof paymentMethod === 'string') {
      const pmLower = paymentMethod.trim().toLowerCase();
      if (pmLower === 'cod') paymentMethod = 'COD';
      else if (pmLower === 'easypaisa') paymentMethod = 'Easypaisa';
      else if (pmLower === 'jazzcash') paymentMethod = 'JazzCash';
    }

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
    let computedSubtotal = 0;
    let computedShippingCost = 0;
    let validatedItems = items;

    const settingsData = await fetchSettingsRecord();
    const defaultShipping = Number(settingsData?.defaultShippingCost) || 200;
    const freeShippingBundles = Array.isArray(settingsData?.freeShippingBundleIds) && settingsData.freeShippingBundleIds.length > 0
      ? settingsData.freeShippingBundleIds
      : ['pkg-glow-family-pack', 'pkg-glow-bachat-mega', 'pkg-vero-family-pack'];

    if (type === 'product') {
      if (!productId) return NextResponse.json({ message: 'productId is required for product orders' }, { status: 400 });
      productOrPromotion = await fetchProductRecord(productId);
      if (!productOrPromotion) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

      let unitPrice = 0;
      if (selectedSkuOrSize && Array.isArray(productOrPromotion.variants)) {
        const variant = productOrPromotion.variants.find((v) => v.name === selectedSkuOrSize);
        unitPrice = variant?.price || 0;
      }
      if (!unitPrice && Array.isArray(productOrPromotion.variants) && productOrPromotion.variants.length > 0) {
        unitPrice = productOrPromotion.variants[0].price || 0;
      }
      computedSubtotal = unitPrice * parsedQuantity;
      computedShippingCost = productOrPromotion.shippingCost !== null && productOrPromotion.shippingCost !== undefined
        ? Number(productOrPromotion.shippingCost) : defaultShipping;
    } else if (type === 'promotion') {
      if (!promotionId) return NextResponse.json({ message: 'promotionId is required for promotion orders' }, { status: 400 });
      productOrPromotion = await fetchPromotionRecord(promotionId);
      if (!productOrPromotion) return NextResponse.json({ message: 'Promotion not found' }, { status: 404 });

      const unitPrice = Number(productOrPromotion.totalPrice) || 0;
      computedSubtotal = unitPrice * parsedQuantity;
      const isFreeShippingBundle = freeShippingBundles.includes(productOrPromotion.id);
      if (isFreeShippingBundle) {
        computedShippingCost = 0;
      } else {
        computedShippingCost = productOrPromotion.shippingCost !== null && productOrPromotion.shippingCost !== undefined
          ? Number(productOrPromotion.shippingCost) : 200;
      }
    } else if (type === 'cart') {
      let anyItemRequiresShipping = false;
      let maxApplicableShipping = 0;
      let calculatedCartTotal = 0;

      validatedItems = await Promise.all(items.map(async (item) => {
        const qty = Math.max(1, Math.min(1000, Number(item.quantity) || 1));
        let itemPrice = Number(item.price) || 0;
        let itemShipping = defaultShipping;

        const isPromo = item.itemType === 'promotion' || item.isPackage || Boolean(item.promotionId);
        const promoLookupId = item.promotionId || item.id;
        const prodLookupId = item.productId || item.id;

        if (isPromo && promoLookupId) {
          const promo = await fetchPromotionRecord(promoLookupId);
          if (promo) {
            itemPrice = Number(promo.totalPrice) || itemPrice;
            const isFreeShippingBundle = freeShippingBundles.includes(promo.id);
            if (isFreeShippingBundle) { itemShipping = 0; }
            else {
              itemShipping = promo.shippingCost !== null && promo.shippingCost !== undefined
                ? Number(promo.shippingCost) : 200;
            }
          }
        } else if (prodLookupId) {
          const prod = await fetchProductRecord(prodLookupId);
          if (prod && Array.isArray(prod.variants) && item.selectedVariant) {
            const variant = prod.variants.find((v) => v.name === item.selectedVariant);
            if (variant?.price) itemPrice = Number(variant.price);
          }
          itemShipping = prod && prod.shippingCost !== null && prod.shippingCost !== undefined
            ? Number(prod.shippingCost) : defaultShipping;
        }

        if (itemShipping > 0) {
          anyItemRequiresShipping = true;
          if (itemShipping > maxApplicableShipping) maxApplicableShipping = itemShipping;
        }
        calculatedCartTotal += itemPrice * qty;

        return { ...item, quantity: qty, price: itemPrice, shippingCost: itemShipping };
      }));

      computedSubtotal = calculatedCartTotal;
      computedShippingCost = anyItemRequiresShipping ? maxApplicableShipping : 0;
    }

    const finalTotalAmount = computedSubtotal + computedShippingCost;

    // Generate order number
    let orderNumber = `KT-${Date.now().toString().slice(-4)}`;
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        const { count } = await sb.from('orders').select('id', { count: 'exact', head: true });
        orderNumber = `KT-${String((count || 0) + 1).padStart(3, '0')}`;
      } catch {}
    }

    const orderPayload = {
      orderNumber,
      type,
      productId: type === 'product' ? productId : undefined,
      promotionId: type === 'promotion' ? promotionId : undefined,
      selectedSkuOrSize,
      quantity: parsedQuantity,
      items: type === 'cart' ? validatedItems : undefined,
      customerName: normalizedCustomerName,
      phone: normalizedPhone,
      email,
      address: normalizedAddress,
      city: normalizedCity,
      note,
      paymentMethod,
      totalAmount: finalTotalAmount,
      shippingCost: computedShippingCost,
    };

    let order = null;

    // Save to Supabase
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        const { data, error } = await sb
          .from('orders')
          .insert({
            ...orderPayload,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .select()
          .single();
        if (!error && data) order = data;
        else if (error) console.warn('Supabase order insert failed:', error.message);
      } catch (sbErr) {
        console.warn('Supabase error:', sbErr.message);
      }
    }

    // Also save to local store
    try {
      const storeOrder = saveInStore(order || orderPayload);
      if (!order) order = storeOrder;
    } catch {}

    // Mirror to remote backend
    try {
      const { postRemoteFallback } = await import('@/lib/api-fallback');
      postRemoteFallback('/orders', orderPayload).catch(() => {});
    } catch {}

    // Fire-and-forget email
    sendOrderEmail(order, productOrPromotion).catch((err) => {
      console.error('[Email Error] sendOrderEmail failed:', err);
    });

    // Fire-and-forget Pusher
    if (pusher) {
      pusher.trigger('admin-notifications', 'new-order', {
        ...order,
        orderId: order.id || order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        type: order.type,
      }).catch((err) => console.error('Pusher error:', err));
    }

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ message: err.message || 'Failed to create order' }, { status: 500 });
  }
}
