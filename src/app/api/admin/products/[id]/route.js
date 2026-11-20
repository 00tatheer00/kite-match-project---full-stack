import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/lib/models/Product';
import { verifyAdminAuth } from '@/lib/auth';
import { parseProductRequest } from '../route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PUT /api/admin/products/:id
export async function PUT(request, context) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { params } = context;
    const id = (await params)?.id;
    if (!id) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }

    const { payload, hasBodyVariantImages } = await parseProductRequest(request);

    // Update in local persistent store
    const { updateProduct, getProductById } = await import('@/lib/store');
    const existingInStore = getProductById(id);

    if (existingInStore) {
      payload.image = payload.image || existingInStore.image || "";
      payload.images = Array.isArray(payload.images) && payload.images.length
        ? payload.images
        : existingInStore.images || [];

      if (Array.isArray(payload.variantImages) && Array.isArray(existingInStore.variantImages)) {
        payload.variantImages = payload.variantImages.map((v, idx) => {
          const match =
            existingInStore.variantImages.find(
              (ev) =>
                ev?.name?.trim().toLowerCase() === v?.name?.trim().toLowerCase()
            ) || existingInStore.variantImages[idx];
          return {
            name: v?.name || match?.name || "",
            image: v?.image || match?.image || "",
          };
        });
      } else if (!hasBodyVariantImages && (!payload.variantImages || !payload.variantImages.length)) {
        payload.variantImages = existingInStore.variantImages || [];
      }
    }

    const updatedInStore = updateProduct(id, payload);

    // Also attempt updating in MongoDB if available
    try {
      await connectToDatabase();
      await Product.findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        { $set: payload },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn('Could not update MongoDB, updated local store:', dbErr.message);
    }

    if (updatedInStore) {
      return NextResponse.json(updatedInStore);
    }

    return NextResponse.json({ message: 'Product updated successfully', ...payload });
  } catch (err) {
    console.error('Error updating product:', err);
    return NextResponse.json({ message: err.message || 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/admin/products/:id
export async function DELETE(request, context) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { params } = context;
    const id = (await params)?.id;
    if (!id) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }

    // Delete from local persistent store
    const { deleteProduct } = await import('@/lib/store');
    deleteProduct(id);

    // Also attempt deletion in MongoDB if available
    try {
      await connectToDatabase();
      await Product.findOneAndDelete({ $or: [{ id }, { _id: id }] });
    } catch (dbErr) {
      console.warn('Could not delete from MongoDB, deleted from local store:', dbErr.message);
    }

    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return NextResponse.json({ message: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
