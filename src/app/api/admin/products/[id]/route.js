import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
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

    // Get existing product for merging
    let existing = null;
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        const { data } = await sb.from('products').select('*').eq('id', id).single();
        if (data) existing = data;
      } catch {}
    }
    if (!existing) {
      try {
        const { getProductById } = await import('@/lib/store');
        existing = getProductById(id);
      } catch {}
    }

    if (existing) {
      payload.image = payload.image || existing.image || '';
      payload.images = Array.isArray(payload.images) && payload.images.length
        ? payload.images
        : existing.images || [];

      if (Array.isArray(payload.variantImages) && Array.isArray(existing.variantImages)) {
        payload.variantImages = payload.variantImages.map((v, idx) => {
          const match =
            existing.variantImages.find(
              (ev) => ev?.name?.trim().toLowerCase() === v?.name?.trim().toLowerCase()
            ) || existing.variantImages[idx];
          return {
            name: v?.name || match?.name || '',
            image: v?.image || match?.image || '',
          };
        });
      } else if (!hasBodyVariantImages && (!payload.variantImages || !payload.variantImages.length)) {
        payload.variantImages = existing.variantImages || [];
      }
    }

    // Update in Supabase
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        const { data, error } = await sb
          .from('products')
          .update({ ...payload, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          try {
            const { updateProduct } = await import('@/lib/store');
            updateProduct(id, payload);
          } catch {}
          return NextResponse.json(data);
        }
        if (error) console.warn('Supabase update failed:', error.message);
      } catch (sbErr) {
        console.warn('Supabase error:', sbErr.message);
      }
    }

    // Fallback: local store
    const { updateProduct } = await import('@/lib/store');
    const updatedInStore = updateProduct(id, payload);
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

    // Delete from Supabase
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        await sb.from('products').delete().eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase delete failed:', sbErr.message);
      }
    }

    // Also delete from local store
    try {
      const { deleteProduct } = await import('@/lib/store');
      deleteProduct(id);
    } catch {}

    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return NextResponse.json({ message: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
