import { getSupabaseAdmin } from './supabase';
import { DataError } from './data';

/**
 * Shared create / update / delete logic for the admin products & promotions tables.
 * Every Supabase error is surfaced (no silent "success" responses).
 */

function db() {
  const sb = getSupabaseAdmin();
  if (!sb) throw new DataError('Database is not configured');
  return sb;
}

export async function listAll(table, orderColumn = 'displayOrder') {
  const { data, error } = await db()
    .from(table)
    .select('*')
    .order(orderColumn, { ascending: true })
    .order('createdAt', { ascending: false });
  if (error) {
    console.error(`[admin/${table}] list failed:`, error.message);
    throw new DataError(`Failed to load ${table}`);
  }
  return data || [];
}

export async function getOne(table, id) {
  const { data, error } = await db().from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw new DataError(`Failed to load ${table}`);
  return data || null;
}

export async function createOne(table, payload) {
  const now = new Date().toISOString();
  const { data, error } = await db()
    .from(table)
    .insert({ ...payload, createdAt: now, updatedAt: now })
    .select()
    .single();
  if (error) {
    if (error.code === '23505') {
      const err = new Error(`An item with ID "${payload.id}" already exists.`);
      err.status = 409;
      throw err;
    }
    console.error(`[admin/${table}] insert failed:`, error.message);
    throw new DataError(`Failed to save: ${error.message}`, 400);
  }
  return data;
}

export async function updateOne(table, id, payload) {
  const { id: _ignored, ...fields } = payload;
  const { data, error } = await db()
    .from(table)
    .update({ ...fields, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) {
    console.error(`[admin/${table}] update failed:`, error.message);
    throw new DataError(`Failed to save: ${error.message}`, 400);
  }
  if (!data) {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
  return data;
}

export async function deleteOne(table, id) {
  const { data, error } = await db().from(table).delete().eq('id', id).select('id');
  if (error) {
    console.error(`[admin/${table}] delete failed:`, error.message);
    throw new DataError('Failed to delete. Please try again.');
  }
  if (!data || data.length === 0) {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
  return true;
}
