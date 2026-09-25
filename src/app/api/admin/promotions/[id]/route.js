import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import PromotionPackage from '@/lib/models/PromotionPackage';
import { verifyAdminAuth } from '@/lib/auth';
import { parsePromotionRequest } from '../route';

// PUT /api/admin/promotions/:id
export async function PUT(request, context) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { params } = context;
    const id = (await params)?.id;
    if (!id) {
      return NextResponse.json({ message: 'Promotion ID required' }, { status: 400 });
    }

    const { payload, hasPrimaryUpload, hasGalleryUpload } = await parsePromotionRequest(request);

    // Update in local persistent store
    const { updatePromotion, getPromotionById } = await import('@/lib/store');
    const existingInStore = getPromotionById(id);

    if (existingInStore) {
      if (!hasPrimaryUpload) {
        payload.image = payload.image || existingInStore.image;
      }
      if (!hasGalleryUpload) {
        payload.images = Array.isArray(payload.images) && payload.images.length
          ? payload.images
          : existingInStore.images || [];
      }
    }

    const updatedInStore = updatePromotion(id, payload);

    // Also attempt updating in MongoDB if available
    try {
      await connectToDatabase();
      const existingDb = await PromotionPackage.findOne({ id });
      if (existingDb) {
        await PromotionPackage.findOneAndUpdate({ id }, payload, { new: true });
      }
    } catch (dbErr) {
      console.warn('Could not update MongoDB, updated local store:', dbErr.message);
    }

    if (updatedInStore) {
      return NextResponse.json(updatedInStore);
    }

    return NextResponse.json({ message: 'Promotion updated successfully', ...payload });
  } catch (err) {
    console.error('Error updating promotion:', err);
    return NextResponse.json({ message: err.message || 'Failed to update promotion' }, { status: 500 });
  }
}

// DELETE /api/admin/promotions/:id
export async function DELETE(request, context) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { params } = context;
    const id = (await params)?.id;
    if (!id) {
      return NextResponse.json({ message: 'Promotion ID required' }, { status: 400 });
    }

    // Delete from local persistent store
    const { deletePromotion } = await import('@/lib/store');
    deletePromotion(id);

    // Also attempt deletion in MongoDB if available
    try {
      await connectToDatabase();
      await PromotionPackage.findOneAndDelete({ id });
    } catch (dbErr) {
      console.warn('Could not delete from MongoDB, deleted from local store:', dbErr.message);
    }

    return NextResponse.json({ message: 'Promotion deleted' });
  } catch (err) {
    console.error('Error deleting promotion:', err);
    return NextResponse.json({ message: err.message || 'Failed to delete promotion' }, { status: 500 });
  }
}
