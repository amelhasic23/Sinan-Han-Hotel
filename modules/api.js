/**
 * modules/api.js
 * Centralised API layer — all fetch calls go through here.
 * API keys live in .env on the server; the frontend never sees them.
 */

'use strict';

// ─── CSRF token (cached per session) ────────────────────────────────────────
let _csrfToken = null;

export async function getCSRFToken() {
    if (_csrfToken) return _csrfToken;
    try {
        const res = await fetch('/api/csrf-token', { credentials: 'include' });
        if (!res.ok) throw new Error('CSRF fetch failed');
        const data = await res.json();
        _csrfToken = data.token;
        return _csrfToken;
    } catch (err) {
        console.error('[api] CSRF token error:', err.message);
        return null;
    }
}

// ─── Shared auth headers ─────────────────────────────────────────────────────
async function authHeaders() {
    const token = await getCSRFToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRF-Token': token } : {})
    };
}

// ─── Availability ─────────────────────────────────────────────────────────────
export async function checkAvailability(params) {
    try {
        const res = await fetch('/api/bookings/availability', {
            method: 'POST',
            headers: await authHeaders(),
            credentials: 'include',
            body: JSON.stringify(params)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('[api] checkAvailability:', err.message);
        return null;
    }
}

// ─── Create booking ───────────────────────────────────────────────────────────
export async function createBooking(bookingData) {
    const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: await authHeaders(),
        credentials: 'include',
        body: JSON.stringify(bookingData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json;
}

// ─── Process payment ──────────────────────────────────────────────────────────
export async function processPayment(paymentData) {
    const res = await fetch('/api/payments', {
        method: 'POST',
        headers: await authHeaders(),
        credentials: 'include',
        body: JSON.stringify(paymentData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
    return json;
}

// ─── Verify payment ───────────────────────────────────────────────────────────
export async function verifyPayment(transactionId) {
    try {
        const res = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: await authHeaders(),
            credentials: 'include',
            body: JSON.stringify({ transactionId })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('[api] verifyPayment:', err.message);
        return null;
    }
}

// ─── Refund ───────────────────────────────────────────────────────────────────
export async function refundPayment(transactionId, amount) {
    try {
        const res = await fetch('/api/payments/refund', {
            method: 'POST',
            headers: await authHeaders(),
            credentials: 'include',
            body: JSON.stringify({ transactionId, amount })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('[api] refundPayment:', err.message);
        return null;
    }
}

// ─── Azure SAS URL ───────────────────────────────────────────────────────────
// Always fetches a fresh token; throws if Azure returns an already-expired one.
export async function getAzureSasUrl({ container, blob = null } = {}) {
    if (!container) throw new Error('[api] getAzureSasUrl: container is required');
    const params = new URLSearchParams({ container });
    if (blob) params.set('blob', blob);

    const res = await fetch(`/api/azure/sas?${params}`, {
        credentials: 'include',
        cache: 'no-store'
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(`[api] SAS fetch failed (${res.status}): ${body.error || body.message || ''}`);
    }

    const data = await res.json();
    // Reject tokens that have already expired or expire within the next 60 seconds
    const expiresAt = new Date(data.expiresOn).getTime();
    if (Date.now() >= expiresAt - 60_000) {
        throw new Error(`[api] Received an already-expired SAS token (expiresOn: ${data.expiresOn})`);
    }

    return data.sasUrl;
}
