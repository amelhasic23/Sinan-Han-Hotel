/**
 * Analytics Module (modules/analytics.js)
 *
 * Wraps Google Analytics (gtag) events for the Sinan Han Hotel booking funnel.
 * All calls are no-ops if gtag is not available (e.g., ad-blockers).
 */

const Analytics = {
    /**
     * Checks whether Google Analytics is available
     * @returns {boolean}
     */
    isAvailable: () => typeof window !== 'undefined' && typeof window.gtag === 'function',

    /**
     * Internal safe wrapper for gtag events
     * @param {string} eventName
     * @param {Object} params
     */
    _send: (eventName, params) => {
        if (!Analytics.isAvailable()) return;
        try {
            window.gtag('event', eventName, params);
        } catch (err) {
            // Analytics failures should never break the UI
        }
    },

    // ─── Page & Navigation ────────────────────────────────────────────────────

    /**
     * Track virtual page view (useful for SPA transitions)
     * @param {string} pagePath
     * @param {string} pageTitle
     */
    trackPageView: (pagePath, pageTitle) => {
        Analytics._send('page_view', {
            page_path: pagePath,
            page_title: pageTitle
        });
    },

    /**
     * Track section scroll (home / rooms / amenities / reviews / contact)
     * @param {string} section
     */
    trackSectionView: (section) => {
        Analytics._send('section_view', { section });
    },

    // ─── Room Interactions ────────────────────────────────────────────────────

    /**
     * Track room card detail modal opened
     * @param {string} roomId    e.g. 'deluxe-suite'
     * @param {string} roomName  e.g. 'Deluxe Suite'
     * @param {number} price     price per night in BAM
     */
    trackRoomView: (roomId, roomName, price) => {
        Analytics._send('view_item', {
            currency: 'BAM',
            value: price,
            items: [{
                item_id: roomId,
                item_name: roomName,
                item_category: 'Room',
                price
            }]
        });
    },

    /**
     * Track "Book This Room" clicked inside room modal
     * @param {string} roomId
     * @param {string} roomName
     */
    trackRoomBookClick: (roomId, roomName) => {
        Analytics._send('add_to_cart', {
            currency: 'BAM',
            items: [{
                item_id: roomId,
                item_name: roomName,
                item_category: 'Room'
            }]
        });
    },

    // ─── Booking Funnel ────────────────────────────────────────────────────────

    /**
     * Track booking form opened / started
     * @param {string} roomType
     */
    trackBookingStart: (roomType) => {
        Analytics._send('begin_checkout', {
            currency: 'BAM',
            items: [{
                item_id: roomType,
                item_category: 'Room'
            }]
        });
    },

    /**
     * Track confirmation modal viewed (payment step)
     * @param {string} roomType
     * @param {number} totalPrice
     * @param {number} nights
     */
    trackCheckoutStep: (roomType, totalPrice, nights) => {
        Analytics._send('checkout_step', {
            currency: 'BAM',
            value: totalPrice,
            nights,
            items: [{
                item_id: roomType,
                item_category: 'Room',
                price: totalPrice
            }]
        });
    },

    /**
     * Track payment method selected
     * @param {string} method  e.g. 'credit-card', 'paypal'
     */
    trackPaymentMethodSelected: (method) => {
        Analytics._send('add_payment_info', {
            payment_type: method
        });
    },

    /**
     * Track successful booking completion
     * @param {string} bookingId
     * @param {string} roomType
     * @param {number} totalPrice
     */
    trackBookingSuccess: (bookingId, roomType, totalPrice) => {
        Analytics._send('purchase', {
            transaction_id: bookingId,
            value: totalPrice,
            currency: 'BAM',
            items: [{
                item_id: roomType,
                item_category: 'Room',
                price: totalPrice,
                quantity: 1
            }]
        });
    },

    /**
     * Track booking failure
     * @param {string} reason
     */
    trackBookingFailure: (reason) => {
        Analytics._send('booking_error', { reason });
    },

    // ─── UX Events ────────────────────────────────────────────────────────────

    /**
     * Track language change
     * @param {string} language  ISO code e.g. 'en', 'bs', 'de'
     */
    trackLanguageChange: (language) => {
        Analytics._send('language_change', { language });
        if (Analytics.isAvailable()) {
            window.gtag('set', { user_language: language });
        }
    },

    /**
     * Track external link clicks (Booking.com, Maps, etc.)
     * @param {string} url
     * @param {string} label
     */
    trackExternalLink: (url, label) => {
        Analytics._send('click', {
            link_url: url,
            link_text: label,
            outbound: true
        });
    },

    /**
     * Track search / filter interactions
     * @param {string} searchTerm
     */
    trackSearch: (searchTerm) => {
        Analytics._send('search', { search_term: searchTerm });
    }
};

// Export for Node / testing
if (typeof module !== 'undefined') {
    module.exports = Analytics;
}
