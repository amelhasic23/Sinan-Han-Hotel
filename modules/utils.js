/**
 * modules/utils.js
 * Shared utilities: validation, sanitisation, formatting, spinner, analytics.
 */

'use strict';

// ─── Input validation ────────────────────────────────────────────────────────
export const validate = {
    email(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    phone(phone) {
        return /^[\d\s\-+]{10,}$/.test(phone.replace(/\s/g, ''));
    },

    dates(checkIn, checkOut) {
        const inD = new Date(checkIn);
        const outD = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(inD) || isNaN(outD))
            return { valid: false, error: 'Invalid date format' };
        if (inD < today)
            return { valid: false, error: 'Check-in date cannot be in the past' };
        if (outD <= inD)
            return { valid: false, error: 'Check-out must be after check-in' };
        return { valid: true };
    },

    guests(count) {
        const n = parseInt(count, 10);
        if (isNaN(n) || n < 1 || n > 8)
            return { valid: false, error: 'Guest count must be between 1 and 8' };
        return { valid: true };
    },

    cardNumber(num) {
        const digits = num.replace(/\s/g, '');
        return /^\d{13,19}$/.test(digits);
    },

    cvv(cvv) {
        return /^\d{3,4}$/.test(cvv);
    },

    expiry(exp) {
        if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
        const [mm, yy] = exp.split('/').map(Number);
        const now = new Date();
        const expDate = new Date(2000 + yy, mm - 1, 1);
        return mm >= 1 && mm <= 12 && expDate > now;
    }
};

// ─── Sanitisation ────────────────────────────────────────────────────────────
export function sanitize(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .trim();
}

// ─── Format helpers ──────────────────────────────────────────────────────────
export function formatDate(dateStr) {
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

export function nightsBetween(checkIn, checkOut) {
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatCurrency(amount, currency = 'BAM') {
    const rates = { BAM: 1, EUR: 0.51 };
    const converted = amount * (rates[currency] || 1);
    return `${currency} ${converted.toFixed(2)}`;
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export const spinner = {
    show(message = 'Processing...') {
        const el = document.getElementById('loadingSpinner');
        const txt = el?.querySelector('.spinner-text');
        if (el) {
            if (txt) txt.textContent = message;
            el.style.display = 'flex';
        }
    },
    hide() {
        const el = document.getElementById('loadingSpinner');
        if (el) el.style.display = 'none';
    }
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analytics = {
    _send(event, params) {
        if (typeof gtag === 'function') gtag('event', event, params);
    },

    roomView(roomId, roomName, price) {
        this._send('view_item', {
            currency: 'BAM',
            value: price,
            items: [{ item_id: roomId, item_name: roomName, item_category: 'room', price }]
        });
    },

    beginCheckout(roomType, nights, totalPrice) {
        this._send('begin_checkout', {
            currency: 'BAM',
            value: totalPrice,
            items: [{ item_id: roomType, quantity: nights, price: totalPrice / Math.max(nights, 1) }]
        });
    },

    purchase(bookingId, totalPrice, roomType) {
        this._send('purchase', {
            transaction_id: bookingId,
            value: totalPrice,
            currency: 'BAM',
            items: [{ item_id: roomType, quantity: 1, price: totalPrice }]
        });
    },

    languageChange(lang) {
        this._send('language_change', { language: lang });
    },

    formError(field, errorMsg) {
        this._send('form_validation_error', { field, error: errorMsg });
    }
};

// ─── Inline field validation helper ─────────────────────────────────────────
export function showFieldError(inputId, message) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.classList.add('is-invalid');
    el.classList.remove('is-valid');
    let errEl = el.parentElement.querySelector('.field-error');
    if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'field-error';
        errEl.setAttribute('role', 'alert');
        el.parentElement.appendChild(errEl);
    }
    errEl.textContent = message;
}

export function clearFieldError(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.classList.remove('is-invalid');
    el.classList.add('is-valid');
    const errEl = el.parentElement.querySelector('.field-error');
    if (errEl) errEl.textContent = '';
}
