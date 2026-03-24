/**
 * Validators Module (modules/validators.js)
 *
 * Reusable client-side validation utilities
 * Mirrors server-side validators in server.js for defense-in-depth
 */

const Validators = {
    /**
     * Validates email format using RFC-compliant regex
     * @param {string} email
     * @returns {boolean}
     */
    email: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return typeof email === 'string' && regex.test(email.trim());
    },

    /**
     * Validates phone number (E.164 or local format, 10+ digits)
     * @param {string} phone
     * @returns {boolean}
     */
    phone: (phone) => {
        if (!phone) return false;
        const digits = phone.replace(/[\s\-\+\(\)]/g, '');
        return /^\d{10,15}$/.test(digits);
    },

    /**
     * Validates check-in/check-out date pair
     * @param {string} checkIn  - ISO date string
     * @param {string} checkOut - ISO date string
     * @returns {{ valid: boolean, error: string|null }}
     */
    dates: (checkIn, checkOut) => {
        const inDate  = new Date(checkIn);
        const outDate = new Date(checkOut);
        const today   = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
            return { valid: false, error: 'Invalid date format' };
        }
        if (inDate < today) {
            return { valid: false, error: 'Check-in date cannot be in the past' };
        }
        if (outDate <= inDate) {
            return { valid: false, error: 'Check-out must be after check-in' };
        }
        return { valid: true, error: null };
    },

    /**
     * Validates guest count is within hotel limits
     * @param {string|number} count
     * @returns {{ valid: boolean, error: string|null }}
     */
    guestCount: (count) => {
        const n = parseInt(count, 10);
        if (isNaN(n) || n < 1 || n > 8) {
            return { valid: false, error: 'Guests must be between 1 and 8' };
        }
        return { valid: true, error: null };
    },

    /**
     * Validates card number using Luhn algorithm
     * @param {string} number - card number with or without spaces
     * @returns {boolean}
     */
    cardNumber: (number) => {
        const digits = number.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(digits)) return false;

        let sum = 0;
        let isEven = false;
        for (let i = digits.length - 1; i >= 0; i--) {
            let d = parseInt(digits[i], 10);
            if (isEven) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            isEven = !isEven;
        }
        return sum % 10 === 0;
    },

    /**
     * Validates expiry date in MM/YY format
     * @param {string} expiry
     * @returns {boolean}
     */
    cardExpiry: (expiry) => {
        if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
        const [month, year] = expiry.split('/').map(Number);
        if (month < 1 || month > 12) return false;

        const now = new Date();
        const expDate = new Date(2000 + year, month - 1);
        return expDate >= now;
    },

    /**
     * Validates CVV (3 or 4 digits)
     * @param {string} cvv
     * @returns {boolean}
     */
    cvv: (cvv) => /^\d{3,4}$/.test(cvv),

    /**
     * Strips HTML tags and script-injection patterns from a string
     * @param {string} input
     * @returns {string}
     */
    sanitize: (input) => {
        if (typeof input !== 'string') return input;
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/data:/gi, '')
            .trim();
    },

    /**
     * Validates all booking form fields at once.
     * Returns an array of { field, error } objects (empty = valid).
     * @param {Object} data - form field values
     * @returns {Array<{ field: string, error: string }>}
     */
    bookingForm: (data) => {
        const errors = [];

        if (!data.guestName?.trim()) {
            errors.push({ field: 'guestName', error: 'Guest name is required' });
        }
        if (!Validators.email(data.email)) {
            errors.push({ field: 'email', error: 'Please enter a valid email address' });
        }
        if (!Validators.phone(data.phone)) {
            errors.push({ field: 'phone', error: 'Please enter a valid phone number (10+ digits)' });
        }
        const dateResult = Validators.dates(data.checkIn, data.checkOut);
        if (!dateResult.valid) {
            errors.push({ field: 'checkIn', error: dateResult.error });
        }
        const guestResult = Validators.guestCount(data.guests);
        if (!guestResult.valid) {
            errors.push({ field: 'guests', error: guestResult.error });
        }
        if (!data.roomType?.trim()) {
            errors.push({ field: 'roomType', error: 'Please select a room type' });
        }

        return errors;
    }
};

// Export for use in other modules or as global
if (typeof module !== 'undefined') {
    module.exports = Validators;
}
