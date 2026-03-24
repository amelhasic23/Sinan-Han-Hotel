/**
 * modules/form.js
 * Booking form validation and submission.
 */

'use strict';

import { validate, sanitize, showFieldError, clearFieldError, spinner, analytics } from './utils.js';
import { createBooking, getCSRFToken } from './api.js';
import { openBookingConfirmationModal } from './modal.js';

// ─── Init (called once DOM ready) ───────────────────────────────────────────
export function initBookingForm(roomData, BAM_TO_EUR, toast) {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    // Live validation on blur
    _attachLiveValidation();

    form.addEventListener('submit', e => _handleSubmit(e, roomData, BAM_TO_EUR, toast));
}

// ─── Form submit handler ──────────────────────────────────────────────────────
async function _handleSubmit(e, roomData, BAM_TO_EUR, toast) {
    e.preventDefault();
    const form = e.target;

    // Gather + sanitise
    const data = {
        guestName: sanitize(form.querySelector('[name="name"]')?.value      || form.querySelector('#guestName')?.value        || ''),
        email:     sanitize(form.querySelector('[name="email"]')?.value     || form.querySelector('#guestEmail')?.value       || ''),
        phone:     sanitize(form.querySelector('[name="phone"]')?.value     || form.querySelector('#guestPhone')?.value       || ''),
        checkIn:            form.querySelector('[name="checkIn"]')?.value   || form.querySelector('#checkInDate')?.value      || '',
        checkOut:           form.querySelector('[name="checkOut"]')?.value  || form.querySelector('#checkOutDate')?.value     || '',
        roomType:  sanitize(form.querySelector('[name="room"]')?.value      || form.querySelector('#roomType')?.value         || ''),
        guests:             form.querySelector('[name="guests"]')?.value    || form.querySelector('#numPersons')?.value       || '1',
    };

    // ── Validate ──────────────────────────────────────────────────────────────
    let hasError = false;

    if (!data.guestName) {
        showFieldError('guestName', 'Name is required');
        analytics.formError('guestName', 'empty');
        hasError = true;
    } else clearFieldError('guestName');

    if (!validate.email(data.email)) {
        showFieldError('guestEmail', 'Enter a valid email address');
        analytics.formError('guestEmail', 'invalid');
        hasError = true;
    } else clearFieldError('guestEmail');

    if (!validate.phone(data.phone)) {
        showFieldError('guestPhone', 'Enter a valid phone number (min 10 digits)');
        analytics.formError('guestPhone', 'invalid');
        hasError = true;
    } else clearFieldError('guestPhone');

    const dateCheck = validate.dates(data.checkIn, data.checkOut);
    if (!dateCheck.valid) {
        showFieldError('checkInDate',  dateCheck.error);
        analytics.formError('dates', dateCheck.error);
        hasError = true;
    } else {
        clearFieldError('checkInDate');
        clearFieldError('checkOutDate');
    }

    const guestCheck = validate.guests(data.guests);
    if (!guestCheck.valid) {
        showFieldError('numPersons', guestCheck.error);
        hasError = true;
    } else clearFieldError('numPersons');

    if (!data.roomType) {
        showFieldError('roomType', 'Please select a room type');
        hasError = true;
    } else clearFieldError('roomType');

    if (hasError) {
        toast.error('Please correct the highlighted fields');
        return;
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    const submitBtn = form.querySelector('[type="submit"]');
    const origText  = submitBtn?.textContent;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }
    spinner.show('Submitting booking…');

    try {
        const result = await createBooking(data);

        // Open confirmation modal
        openBookingConfirmationModal(
            { ...data, bookingId: result?.bookingId },
            roomData,
            BAM_TO_EUR,
            toast
        );

        toast.success('Booking submitted! Please complete your payment.');
    } catch (err) {
        toast.error(err.message || 'Submission failed. Please try again.');
    } finally {
        spinner.hide();
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
    }
}

// ─── Live validation ──────────────────────────────────────────────────────────
function _attachLiveValidation() {
    const rules = [
        { id: 'guestEmail', test: v => validate.email(v),  err: 'Invalid email' },
        { id: 'guestPhone', test: v => validate.phone(v),  err: 'Invalid phone (min 10 digits)' },
    ];

    rules.forEach(({ id, test, err }) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('blur', () => {
            if (el.value && !test(el.value)) showFieldError(id, err);
            else clearFieldError(id);
        });
        el.addEventListener('input', () => {
            if (el.classList.contains('is-invalid') && test(el.value)) clearFieldError(id);
        });
    });

    // Date cross-validation
    const checkOut = document.getElementById('checkOutDate');
    checkOut?.addEventListener('change', () => {
        const checkIn = document.getElementById('checkInDate')?.value;
        if (checkIn) {
            const r = validate.dates(checkIn, checkOut.value);
            if (!r.valid) showFieldError('checkOutDate', r.error);
            else clearFieldError('checkOutDate');
        }
    });
}
