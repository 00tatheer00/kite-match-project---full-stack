import { NextResponse } from 'next/server';
import { parsePromotionRequest } from '@/lib/admin-payloads';
import { createOne, deleteOne, getOne, updateOne } from '@/lib/admin-catalog';
import { handleRouteError, jsonError, requireAdmin, revalidateCatalog } from '@/lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PUT /api/admin/promotions/:id — update; creates the promotion if it does not exist yet (CSV import).
export async function PUT(request, context) {
  const { response } = requireAdmin(request);
  if (response) return response;

  const id = (await context.params)?.id;
  if (!id) return jsonError('Promotion ID required', 400);

  try {
    const { payload, hasPrimaryUpload, hasGalleryUpload } = await parsePromotionRequest(request, { requireId: false });
    const existing = await getOne('promotions', id);

    if (!existing) {
      const created = await createOne('promotions', { ...payload, id });
      revalidateCatalog();
      return NextResponse.json(created, { status: 201 });
    }

    if (!hasPrimaryUpload) payload.image = payload.image || existing.image || '';
    if (!hasGalleryUpload) payload.images = payload.images.length ? payload.images : existing.images || [];

    const updated = await updateOne('promotions', id, payload);
    revalidateCatalog();
    return NextResponse.json(updated);
  } catch (err) {
    return handleRouteError(err, 'update promotion');
  }
}

// DELETE /api/admin/promotions/:id
export async function DELETE(request, context) {
  const { response } = requireAdmin(request);
  if (response) return response;

  const id = (await context.params)?.id;
  if (!id) return jsonError('Promotion ID required', 400);

  try {
    await deleteOne('promotions', id);
    revalidateCatalog();
    return NextResponse.json({ message: 'Promotion deleted' });
  } catch (err) {
    return handleRouteError(err, 'delete promotion');
  }
}
