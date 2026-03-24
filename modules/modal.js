/**
 * modules/modal.js
 * Room detail modal + booking confirmation modal.
 */

'use strict';

import { spinner, analytics } from './utils.js';
import { processPayment, getCSRFToken } from './api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function nightsBetween(a, b) {
    return Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000));
}

function fmt(dateStr) {
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Open booking confirmation modal ─────────────────────────────────────────
export function openBookingConfirmationModal(bookingData, roomData, BAM_TO_EUR, toast) {
    const modal = document.getElementById('bookingConfirmationModal');
    if (!modal) return;

    const room = roomData?.[bookingData.roomType] || {};
    const nights       = nightsBetween(bookingData.checkIn, bookingData.checkOut);
    const pricePerNight = room.price || 0;
    const totalBAM     = pricePerNight * nights;
    const totalEUR     = (totalBAM * BAM_TO_EUR).toFixed(2);

    setText('confirmRoomName',      room.title || bookingData.roomType);
    setText('confirmCheckIn',       fmt(bookingData.checkIn));
    setText('confirmCheckOut',      fmt(bookingData.checkOut));
    setText('confirmGuests',        bookingData.guests + (bookingData.guests == 1 ? ' Guest' : ' Guests'));
    setText('confirmPricePerNight', `BAM ${pricePerNight}  (EUR ${(pricePerNight * BAM_TO_EUR).toFixed(2)})`);
    setText('confirmNights',        nights + (nights === 1 ? ' night' : ' nights'));
    setText('confirmTotalPrice',    `BAM ${totalBAM}  (EUR ${totalEUR})`);
    setText('confirmGuestName',     bookingData.guestName || '—');
    setText('confirmGuestEmail',    bookingData.email || '—');
    setText('confirmGuestPhone',    bookingData.phone || '—');

    modal.dataset.bookingPayload = JSON.stringify({
        ...bookingData, nights, totalPrice: totalBAM, totalPriceEUR: totalEUR
    });

    analytics.beginCheckout(bookingData.roomType, nights, totalBAM);

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.querySelector('select, input, button')?.focus();
}

// ─── Close ────────────────────────────────────────────────────────────────────
export function closeBookingConfirmationModal() {
    const modal = document.getElementById('bookingConfirmationModal');
    if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

// ─── Wire all confirmation-modal events ──────────────────────────────────────
export function initConfirmModal(toast) {
    const modal    = document.getElementById('bookingConfirmationModal');
    const payForm  = document.getElementById('bookingPaymentForm');
    const pmSelect = document.getElementById('paymentMethod');
    const cardDiv  = document.getElementById('cardDetails');
    const billCb   = document.getElementById('billingAddress');
    const billForm = document.getElementById('billingAddressForm');
    const cardNum  = document.getElementById('cardNumber');
    const expiry   = document.getElementById('expiryDate');

    document.getElementById('closeConfirmModal')?.addEventListener('click', closeBookingConfirmationModal);
    document.getElementById('cancelConfirmBtn')?.addEventListener('click',  closeBookingConfirmationModal);

    modal?.addEventListener('click', e => { if (e.target === modal) closeBookingConfirmationModal(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal?.style.display === 'flex') closeBookingConfirmationModal();
    });

    pmSelect?.addEventListener('change', () => {
        if (cardDiv) cardDiv.style.display = ['credit-card','debit-card'].includes(pmSelect.value) ? 'block' : 'none';
    });

    billCb?.addEventListener('change', () => {
        if (billForm) billForm.style.display = billCb.checked ? 'block' : 'none';
    });

    cardNum?.addEventListener('input', e => {
        e.target.value = e.target.value.replace(/\D/g,'').substring(0,16).replace(/(.{4})/g,'$1 ').trim();
    });

    expiry?.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g,'').substring(0,4);
        if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
        e.target.value = v;
    });

    payForm?.addEventListener('submit', e => _submitPayment(e, toast));
}

// ─── Payment submit ───────────────────────────────────────────────────────────
async function _submitPayment(e, toast) {
    e.preventDefault();
    const modal   = document.getElementById('bookingConfirmationModal');
    const payload = JSON.parse(modal?.dataset.bookingPayload || '{}');
    const pm      = document.getElementById('paymentMethod')?.value;

    if (!pm) { toast.error('Please select a payment method'); return; }
    if (!document.getElementById('agreeTerms')?.checked) {
        toast.error('Please agree to the terms and conditions'); return;
    }

    if (['credit-card','debit-card'].includes(pm)) {
        const h  = document.getElementById('cardHolder')?.value.trim();
        const cn = document.getElementById('cardNumber')?.value.replace(/\s/g,'');
        const ex = document.getElementById('expiryDate')?.value;
        const cv = document.getElementById('cvv')?.value;
        if (!h)                      { toast.error('Card holder name is required'); return; }
        if (!/^\d{13,19}$/.test(cn)) { toast.error('Invalid card number'); return; }
        if (!/^\d{2}\/\d{2}$/.test(ex)) { toast.error('Invalid expiry date (MM/YY)'); return; }
        if (!/^\d{3,4}$/.test(cv))   { toast.error('Invalid CVV'); return; }
    }

    const btn      = document.getElementById('confirmPaymentBtn');
    const origText = btn.textContent;
    btn.disabled   = true;
    btn.textContent = 'Processing…';
    spinner.show('Processing payment…');

    try {
        const result = await processPayment({
            bookingId:     payload.bookingId || ('TEMP_' + Date.now()),
            amount:        payload.totalPrice,
            currency:      'BAM',
            paymentMethod: pm,
            cardLastFour:  ['credit-card','debit-card'].includes(pm)
                ? document.getElementById('cardNumber')?.value.slice(-4) : null,
            billingAddress: document.getElementById('billingAddress')?.checked ? {
                street:  document.getElementById('billingStreet')?.value,
                city:    document.getElementById('billingCity')?.value,
                postal:  document.getElementById('billingPostal')?.value,
                country: document.getElementById('billingCountry')?.value
            } : null
        });

        analytics.purchase(result.transactionId, payload.totalPrice, payload.roomType);
        toast.success('Payment confirmed! Reference: ' + (result.transactionId || 'N/A'));
        closeBookingConfirmationModal();
        document.getElementById('bookingForm')?.reset();
    } catch (err) {
        toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
        spinner.hide();
        btn.disabled    = false;
        btn.textContent = origText;
    }
}
