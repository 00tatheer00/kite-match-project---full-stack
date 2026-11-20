import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/auth';
import { parsePromotionRequest } from '../route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // Get existing for merging
    let existing = null;
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        const { data } = await sb.from('promotions').select('*').eq('id', id).single();
        if (data) existing = data;
      } catch {}
    }
    if (!existing) {
      try {
        const { getPromotionById } = await import('@/lib/store');
        existing = getPromotionById(id);
      } catch {}
    }

    if (existing) {
      if (!hasPrimaryUpload) {
        payload.image = payload.image || existing.image;
      }
      if (!hasGalleryUpload) {
        payload.images = Array.isArray(payload.images) && payload.images.length
          ? payload.images
          : existing.images || [];
      }
    }

    // Update in Supabase
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        const { data, error } = await sb
          .from('promotions')
          .update({ ...payload, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          try {
            const { updatePromotion } = await import('@/lib/store');
            updatePromotion(id, payload);
          } catch {}
          return NextResponse.json(data);
        }
        if (error) console.warn('Supabase update failed:', error.message);
      } catch (sbErr) {
        console.warn('Supabase error:', sbErr.message);
      }
    }

    // Fallback
    const { updatePromotion } = await import('@/lib/store');
    const updatedInStore = updatePromotion(id, payload);
    if (updatedInStore) return NextResponse.json(updatedInStore);
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

    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        await sb.from('promotions').delete().eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase delete failed:', sbErr.message);
      }
    }

    try {
      const { deletePromotion } = await import('@/lib/store');
      deletePromotion(id);
    } catch {}

    return NextResponse.json({ message: 'Promotion deleted' });
  } catch (err) {
    console.error('Error deleting promotion:', err);
    return NextResponse.json({ message: err.message || 'Failed to delete promotion' }, { status: 500 });
  }
}
