const REMOTE_API = (process.env.REMOTE_API_BASE_URL || 'https://kite-backend-eux7.onrender.com/api').replace(/\/+$/, '');

export async function fetchRemoteFallback(endpoint, headers = {}) {
  try {
    const res = await fetch(`${REMOTE_API}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Remote fallback for ${endpoint} failed:`, err.message);
  }
  return null;
}

export async function postRemoteFallback(endpoint, body, headers = {}) {
  try {
    const res = await fetch(`${REMOTE_API}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || `Remote request failed with status ${res.status}`);
  } catch (err) {
    console.warn(`Remote POST fallback for ${endpoint} failed:`, err.message);
    throw err;
  }
}

export async function forwardRemoteRequest(endpoint, { method = 'GET', headers = {}, body = null } = {}) {
  try {
    const reqHeaders = {
      'Accept': 'application/json',
      ...headers,
    };
    let reqBody = body;
    if (body && typeof body === 'object' && !(body instanceof FormData) && !Buffer.isBuffer(body)) {
      reqHeaders['Content-Type'] = 'application/json';
      reqBody = JSON.stringify(body);
    }
    const res = await fetch(`${REMOTE_API}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
      method,
      cache: 'no-store',
      headers: reqHeaders,
      body: reqBody,
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.warn(`Remote forward ${method} for ${endpoint} failed:`, err.message);
    return { ok: false, status: 502, data: null };
  }
}

