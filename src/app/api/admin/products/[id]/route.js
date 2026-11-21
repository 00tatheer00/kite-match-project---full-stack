import { NextResponse } from 'next/server';
import { keepOnlySentFields, parseProductRequest } from '@/lib/admin-payloads';
import { createOne, deleteOne, getOne, updateOne } from '@/lib/admin-catalog';
import { handleRouteError, jsonError, requireAdmin, revalidateCatalog } from '@/lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PUT /api/admin/products/:id — update; creates the product if it does not exist yet (CSV import).
export async function PUT(request, context) {
  const { response } = requireAdmin(request);
  if (response) return response;

  const id = (await context.params)?.id;
  if (!id) return jsonError('Product ID required', 400);

  try {
    const { payload, sentKeys, uploadedKeys, hasBodyVariantImages } = await parseProductRequest(request, { requireId: false });
    const existing = await getOne('products', id);

    if (!existing) {
      const created = await createOne('products', { ...payload, id });
      revalidateCatalog();
      return NextResponse.json(created, { status: 201 });
    }

    // Keep existing images when the form did not send new ones.
    payload.image = payload.image || existing.image || '';
    payload.images = payload.images.length ? payload.images : existing.images || [];
    if (Array.isArray(existing.variantImages)) {
      if (payload.variantImages.length) {
        payload.variantImages = payload.variantImages.map((v, idx) => {
          const match =
            existing.variantImages.find((ev) => ev?.name?.trim().toLowerCase() === v?.name?.trim().toLowerCase()) ||
            existing.variantImages[idx];
          return { name: v?.name || match?.name || '', image: v?.image || match?.image || '' };
        });
      } else if (!hasBodyVariantImages) {
        payload.variantImages = existing.variantImages;
      }
    }

    // Fields the form did not send (e.g. sizes/skus) keep their current database values.
    keepOnlySentFields(payload, sentKeys, uploadedKeys);
    const updated = await updateOne('products', id, payload);
    revalidateCatalog();
    return NextResponse.json(updated);
  } catch (err) {
    return handleRouteError(err, 'update product');
  }
}

// DELETE /api/admin/products/:id
export async function DELETE(request, context) {
  const { response } = requireAdmin(request);
  if (response) return response;

  const id = (await context.params)?.id;
  if (!id) return jsonError('Product ID required', 400);

  try {
    await deleteOne('products', id);
    revalidateCatalog();
    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    return handleRouteError(err, 'delete product');
  }
}
