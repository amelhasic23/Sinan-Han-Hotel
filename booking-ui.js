// ============================================
// BOOKING UI MODULE (Desktop Optimized - Phase 6)
// ============================================
// Extracted from inline script to allow deferred loading and caching

'use strict';

// Note: BAM_TO_EUR is provided by SiminHan.min.js

// Room data
const roomData = {
    'standard-double': {
        title: 'Standard Double Room',
        price: 200,
        image: 'Rooms/Standard Double Room/390516357.jpg',
        images: [
            'Rooms/Standard Double Room/390516357.jpg',
            'Rooms/Standard Double Room/390594090.jpg',
            'Rooms/Standard Double Room/390629675.jpg',
            'Rooms/Standard Double Room/390629744.jpg'
        ],
        description: 'Room • 18 m²\n\nThis air-conditioned double room includes a flat-screen TV with cable channels, a private bathroom as well as a terrace with city views. Free toiletries included.\n\nAmenities:\n• 1 Large Double Bed\n• Flat-Screen TV\n• Terrace with City Views\n• Air Conditioning\n• Private Bathroom'
    },
    'superior-suite': {
        title: 'Superior Suite',
        price: 240,
        image: 'Rooms/Superior Suite/390594090.jpg',
        images: [
            'Rooms/Superior Suite/390594090.jpg',
            'Rooms/Superior Suite/396530638.jpg',
            'Rooms/Superior Suite/396530664.jpg',
            'Rooms/Superior Suite/396530713.jpg',
            'Rooms/Superior Suite/396531357.jpg'
        ],
        description: 'Entire apartment • 45 m²\n\nBoasting a private entrance, this air-conditioned apartment features 1 living room, 1 separate bedroom and 1 bathroom with a walk-in shower and a bidet. In the well-fitted kitchen, guests will find a stovetop, refrigerator, kitchenware and an oven. Featuring a terrace with garden views, this apartment also features soundproof walls and a flat-screen TV with cable channels.\n\nAmenities:\n• 1 Extra-Large Double Bed + Sofa Bed\n• Full Kitchen\n• Flat-Screen TV\n• Soundproof Walls\n• Terrace with Garden Views'
    },
    'double-terrace': {
        title: 'Double Room with Terrace',
        price: 285,
        image: 'Rooms/Double Room/396531596.jpg',
        images: [
            'Rooms/Double Room/396531596.jpg',
            'Rooms/Double Room/396531870.jpg',
            'Rooms/Double Room/396531928.jpg',
            'Rooms/Double Room/396550774.jpg'
        ],
        description: 'Room • 18 m²\n\nThis air-conditioned double room includes a flat-screen TV with cable channels, a private bathroom as well as a terrace with mountain views.\n\nAmenities:\n• 1 Large Double Bed\n• Terrace with Mountain Views\n• Smart TV\n• Air Conditioning\n• Private Bathroom'
    },
    'standard-queen': {
        title: 'Standard Queen Room',
        price: 242,
        image: 'Rooms/queen standard room/706475810.jpg',
        images: [
            'Rooms/queen standard room/706475810.jpg',
            'Rooms/queen standard room/706475998.jpg',
            'Rooms/queen standard room/706476511.jpg',
            'Rooms/queen standard room/706476571.jpg'
        ],
        description: 'Room • 24 m²\n\nOffering free toiletries, this double room includes a private bathroom with a walk-in shower and a bidet. Features soundproof walls and a minibar.\n\nAmenities:\n• 1 Extra-Large Double Bed\n• Garden Views\n• Flat-Screen TV\n• Soundproof Walls\n• Minibar'
    },
    'superior-apartment': {
        title: 'Superior Apartment',
        price: 280,
        image: 'Rooms/Superior Apartment/706475998.jpg',
        images: [
            'Rooms/Superior Apartment/706475998.jpg',
            'Rooms/Superior Apartment/713093570.jpg',
            'Rooms/Superior Apartment/714582257.jpg',
            'Rooms/Superior Apartment/714583350.jpg',
            'Rooms/Superior Apartment/716963694.jpg'
        ],
        description: 'Entire apartment • 45 m²\n\nBoasting a private entrance, this air-conditioned apartment features 1 living room, 1 separate bedroom and 1 bathroom with a walk-in shower and a bidet. In the well-fitted kitchen, guests will find a stovetop, a refrigerator, kitchenware and an oven. Featuring a terrace with garden views, this apartment also features soundproof walls and a flat-screen TV with cable channels. The unit has 2 beds.\n\nAmenities:\n• 1 Extra-Large Double Bed + Sofa Bed\n• Full Kitchen with Stovetop & Oven\n• Coffee Machine & Minibar\n• Flat-Screen TV with Cable Channels\n• Soundproof Walls\n• Walk-in Shower with Bidet\n• Terrace with Garden, Mountain & City Views\n• Air Conditioning\n• Free WiFi'
    },
    'deluxe-suite': {
        title: 'Deluxe Suite',
        price: 250,
        image: 'Rooms/Deluxe Suit/390516235.jpg',
        images: [
            'Rooms/Deluxe Suit/390516235.jpg',
            'Rooms/Deluxe Suit/390596831.jpg',
            'Rooms/Deluxe Suit/390594090.jpg',
            'Rooms/Deluxe Suit/396601685.jpg',
            'Rooms/Deluxe Suit/390630079.jpg',
            'Rooms/Deluxe Suit/390630811.jpg',
            'Rooms/Deluxe Suit/390516298.jpg',
            'Rooms/Deluxe Suit/390629535.jpg'
        ],
        description: 'High Floor Room • 29 m²\n\nThis luxurious deluxe suite features 1 sofa bed and 1 large double bed with free cot available on request. Located on a high floor with stunning views.\n\nAmenities:\n• 1 Sofa Bed + 1 Large Double Bed\n• Mountain View, Landmark View, City View, River View\n• Inner Courtyard View\n• Air Conditioning\n• Patio & Terrace\n• Ensuite Bathroom with Bath or Shower\n• Flat-Screen TV with Satellite Channels\n• Soundproofing\n• Coffee Machine & Minibar\n• Free WiFi & Free Toiletries\n• Safety Deposit Box\n• Hypoallergenic Bedding\n• Hairdryer, Iron & Tea/Coffee Maker\n• Private Entrance\n• Dressing Room & Wardrobe\n• Seating Area with Sofa Bed'
    },
    'two-bedroom-deluxe': {
        title: 'Two-Bedroom Deluxe Apartment',
        price: 320,
        image: 'Rooms/Two Bedroom Deluxe Apartment/714582553.jpg',
        images: [
            'Rooms/Two Bedroom Deluxe Apartment/714582553.jpg',
            'Rooms/Two Bedroom Deluxe Apartment/706475998.jpg',
            'Rooms/Two Bedroom Deluxe Apartment/714583127.jpg'
        ],
        description: 'Entire apartment • 65 m²\n\nSpacious two-bedroom deluxe apartment featuring 2 extra-large double beds, a fully equipped kitchen, and a separate living room with sofa. Ideal for families or small groups.\n\nAmenities:\n• 2 Extra-Large Double Beds\n• Full Kitchen with Stovetop & Oven\n• Spacious Living Room with Sofa\n• Private Bathroom with Walk-in Shower\n• Air Conditioning\n• Flat-Screen TV with Cable Channels\n• Free WiFi & Free Toiletries\n• City & Mountain Views'
    }
};

// Room selection for booking
function selectRoomForBooking(roomId, price, roomName) {
    const roomTypeSelect = document.getElementById('roomType');
    roomTypeSelect.value = roomId;
    roomTypeSelect.dispatchEvent(new Event('change'));

    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.getElementById('checkInDate').focus(), 1000);

    showToast(`${roomName} selected! Fill in dates to calculate price.`);
}

// Calculate booking price
function calculatePrice() {
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;
    const roomTypeSelect = document.getElementById('roomType');
    const currency = document.getElementById('currency').value;

    const isEUR = currency === 'EUR';
    const currencySymbol = isEUR ? '€' : 'BAM';
    const zeroDisplay = isEUR ? '€ 0.00' : 'BAM 0.00';

    if (!roomTypeSelect.value || !checkInDate || !checkOutDate) {
        document.getElementById('selectedRoom').textContent = '-';
        document.getElementById('nightsCount').textContent = '0';
        document.getElementById('nightPrice').textContent = zeroDisplay;
        document.getElementById('total').textContent = zeroDisplay;
        return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        showToast('Check-out date must be after check-in date');
        document.getElementById('total').textContent = zeroDisplay;
        return;
    }

    const basePrice = roomData[roomTypeSelect.value]?.price || 0;
    const guests = parseInt(document.getElementById('numPersons').value) || 2;
    const extraGuests = Math.max(0, guests - 2);
    const surchargePerNight = extraGuests * 40;
    const pricePerNight = basePrice + surchargePerNight;
    let subtotal = pricePerNight * nights;
    const selectedOption = roomTypeSelect.options[roomTypeSelect.selectedIndex];
    const roomName = selectedOption.text.split(' - ')[0];

    let displayPrice = subtotal;
    let displayPerNight = pricePerNight;

    if (isEUR) {
        displayPrice = parseFloat((subtotal * BAM_TO_EUR).toFixed(2));
        displayPerNight = parseFloat((pricePerNight * BAM_TO_EUR).toFixed(2));
    }

    const surchargeRow = document.getElementById('guestSurchargeRow');
    if (surchargeRow) {
        if (extraGuests > 0) {
            const surchargeDisplay = isEUR
                ? (surchargePerNight * BAM_TO_EUR).toFixed(2)
                : surchargePerNight.toFixed(2);
            document.getElementById('guestSurcharge').textContent =
                `+${surchargeDisplay} ${currencySymbol}/night (${extraGuests} extra guest${extraGuests > 1 ? 's' : ''})`;
            surchargeRow.style.display = '';
        } else {
            surchargeRow.style.display = 'none';
        }
    }

    document.getElementById('selectedRoom').textContent = roomName;
    document.getElementById('nightsCount').textContent = nights;
    document.getElementById('nightPrice').textContent = `${displayPerNight.toFixed(2)} ${currencySymbol}`;
    document.getElementById('total').textContent = `${displayPrice.toFixed(2)} ${currencySymbol}`;
}

// Modal functionality
let currentModalRoom = null;
let modalSliderState = { currentIndex: 0 };
let roomModalEventsBound = false;

function ensureRoomModal() {
    const modal = (typeof window.ensureElementFromTemplate === 'function'
        ? window.ensureElementFromTemplate('roomModalTemplate', 'roomModal')
        : null) || document.getElementById('roomModal');

    if (!modal) {
        return null;
    }

    if (!roomModalEventsBound) {
        const closeBtn = modal.querySelector('#closeModal');
        const modalPrevBtn = modal.querySelector('#modalSliderPrev');
        const modalNextBtn = modal.querySelector('#modalSliderNext');

        closeBtn?.addEventListener('click', closeModal);

        modalPrevBtn?.addEventListener('click', (event) => {
            event.stopPropagation();
            modalChangeImage(-1);
        });

        modalNextBtn?.addEventListener('click', (event) => {
            event.stopPropagation();
            modalChangeImage(1);
        });

        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            const currentModal = document.getElementById('roomModal');
            if (!currentModal || !currentModal.classList.contains('show')) {
                return;
            }

            if (event.key === 'ArrowLeft') modalChangeImage(-1);
            if (event.key === 'ArrowRight') modalChangeImage(1);
            if (event.key === 'Escape') closeModal();
        });

        roomModalEventsBound = true;
    }

    if (typeof window.applyTranslationsToRoot === 'function') {
        window.applyTranslationsToRoot(modal);
    }

    return modal;
}

function ensureBookingSuccessModal() {
    const modal = (typeof window.ensureElementFromTemplate === 'function'
        ? window.ensureElementFromTemplate('bookingSuccessModalTemplate', 'bookingSuccessModal')
        : null) || document.getElementById('bookingSuccessModal');

    if (modal && typeof window.applyTranslationsToRoot === 'function') {
        window.applyTranslationsToRoot(modal);
    }

    return modal;
}

function openModal(roomId) {
    const modal = ensureRoomModal();
    const room = roomData[roomId];

    if (modal && room) {
        currentModalRoom = roomId;
        modalSliderState.currentIndex = 0;

        const currentLang = (document.documentElement.lang || 'en').split('-')[0];
        const titleKey = `modal-${roomId}-title`;
        const descKey = `modal-${roomId}-desc`;

        let titleText = room.title;
        let descText = room.description;

        if (typeof translation !== 'undefined') {
            const activeTranslations = translation[currentLang] || translation.en || {};
            if (activeTranslations[titleKey]) {
                titleText = activeTranslations[titleKey];
            }
            if (activeTranslations[descKey]) {
                descText = activeTranslations[descKey];
            }
        }

        modal.querySelector('#modalTitle').textContent = titleText;
        modal.querySelector('#modalDescription').textContent = descText;

        const wrapper = modal.querySelector('#modalImagesWrapper');
        wrapper.innerHTML = '';

        const images = room.images || [room.image];
        images.forEach((imgSrc, index) => {
            const picture = document.createElement('picture');

            const webpSrc = imgSrc.replace(/\.(jpg|jpeg)$/i, '.webp');
            const source = document.createElement('source');
            source.srcset = webpSrc;
            source.type = 'image/webp';

            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = `${titleText} - View ${index + 1}`;
            img.className = `modal-img ${index === 0 ? 'active' : ''}`;
            img.loading = 'lazy';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:10px';

            picture.appendChild(source);
            picture.appendChild(img);
            wrapper.appendChild(picture);
        });

        const hasMultipleImages = images.length > 1;
        modal.querySelector('#modalSliderPrev').style.display = hasMultipleImages ? 'block' : 'none';
        modal.querySelector('#modalSliderNext').style.display = hasMultipleImages ? 'block' : 'none';
        modal.querySelector('#modalImageCounter').style.display = hasMultipleImages ? 'block' : 'none';

        const dotsContainer = modal.querySelector('#modalSliderDots');
        dotsContainer.innerHTML = '';
        images.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = `modal-slider-dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            dot.addEventListener('click', () => modalGoToImage(index));
            dotsContainer.appendChild(dot);
        });
        dotsContainer.style.display = hasMultipleImages ? 'flex' : 'none';

        modal.querySelector('#modalImageCounter').textContent = `1/${images.length}`;

        modal.querySelector('#modalBookBtn').onclick = () => {
            closeModal();
            selectRoomForBooking(roomId, room.price, titleText);
        };

        modal.classList.add('show');
        if (typeof window.syncBodyScrollLock === 'function') {
            window.syncBodyScrollLock();
        } else {
            document.body.style.overflow = 'hidden';
        }
    }
}

function modalChangeImage(direction) {
    if (!currentModalRoom) return;

    const room = roomData[currentModalRoom];
    const images = room.images || [room.image];
    let newIndex = modalSliderState.currentIndex + direction;

    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;

    modalGoToImage(newIndex);
}

function modalGoToImage(index) {
    const modal = document.getElementById('roomModal');
    const wrapper = modal ? modal.querySelector('#modalImagesWrapper') : null;
    if (!wrapper) return;

    const imgs = wrapper.querySelectorAll('.modal-img');
    const dots = modal.querySelectorAll('.modal-slider-dot');
    const counter = modal.querySelector('#modalImageCounter');

    if (!imgs[index] || !dots[index] || !counter) return;

    imgs.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    imgs[index].classList.add('active');
    dots[index].classList.add('active');
    counter.textContent = `${index + 1}/${imgs.length}`;
    modalSliderState.currentIndex = index;
}

function closeModal() {
    const modal = document.getElementById('roomModal');
    if (!modal) return;

    modal.classList.remove('show');
    if (typeof window.syncBodyScrollLock === 'function') {
        window.syncBodyScrollLock();
    } else {
        document.body.style.overflow = '';
    }
}

// Language and booking form setup
document.addEventListener('DOMContentLoaded', function() {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
        languageSelector.value = savedLanguage;
    }

    const checkInDate = document.getElementById('checkInDate');
    const checkOutDate = document.getElementById('checkOutDate');
    const roomType = document.getElementById('roomType');
    const currency = document.getElementById('currency');

    const numPersons = document.getElementById('numPersons');

    if (checkInDate) checkInDate.addEventListener('change', calculatePrice);
    if (checkOutDate) checkOutDate.addEventListener('change', calculatePrice);
    if (roomType) roomType.addEventListener('change', calculatePrice);
    if (currency) currency.addEventListener('change', calculatePrice);
    if (numPersons) numPersons.addEventListener('input', calculatePrice);
});

// Toast notification function
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.style.display = 'block';
        toast.style.opacity = '1';

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, 3000);
    }
}

function showBookingSuccessModal(data) {
    const modal = ensureBookingSuccessModal();
    if (!modal) return;

    modal.querySelector('#sm_name').textContent = data.name;
    modal.querySelector('#sm_email').textContent = data.email;
    modal.querySelector('#sm_room').textContent = data.room;
    modal.querySelector('#sm_checkin').textContent = data.checkIn;
    modal.querySelector('#sm_checkout').textContent = data.checkOut;
    modal.querySelector('#sm_guests').textContent = data.guests;

    modal.classList.add('open');
    if (typeof window.syncBodyScrollLock === 'function') {
        window.syncBodyScrollLock();
    } else {
        document.body.style.overflow = 'hidden';
    }

    function closeSuccessModal() {
        modal.classList.remove('open');
        if (typeof window.syncBodyScrollLock === 'function') {
            window.syncBodyScrollLock();
        } else {
            document.body.style.overflow = '';
        }
    }

    modal.querySelector('#successModalClose').onclick = closeSuccessModal;
    modal.querySelector('#successModalBtn').onclick = closeSuccessModal;
    modal.onclick = function(event) {
        if (event.target === modal) closeSuccessModal();
    };
}

// Email validation helper
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Form Validation and Submission
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const guestName = document.getElementById('guestName').value.trim();
        const guestEmail = document.getElementById('guestEmail').value.trim();
        const checkInDate = document.getElementById('checkInDate').value;
        const checkOutDate = document.getElementById('checkOutDate').value;
        const roomType = document.getElementById('roomType').value;
        const numPersons = document.getElementById('numPersons').value;

        // Validation
        if (!guestName || guestName.length < 2) {
            showToast('Please enter your name (at least 2 characters)');
            document.getElementById('guestName').focus();
            return;
        }

        if (!isValidEmail(guestEmail)) {
            showToast('Please enter a valid email address');
            document.getElementById('guestEmail').focus();
            return;
        }

        if (!checkInDate) {
            showToast('Please select check-in date');
            document.getElementById('checkInDate').focus();
            return;
        }

        if (!checkOutDate) {
            showToast('Please select check-out date');
            document.getElementById('checkOutDate').focus();
            return;
        }

        if (!roomType) {
            showToast('Please select a room type');
            document.getElementById('roomType').focus();
            return;
        }

        if (!numPersons || numPersons < 1 || numPersons > 8) {
            showToast('Please enter a valid number of guests (1-8)');
            document.getElementById('numPersons').focus();
            return;
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (checkOut <= checkIn) {
            showToast('Check-out date must be after check-in date');
            document.getElementById('checkOutDate').focus();
            return;
        }

        const roomSelect = document.getElementById('roomType');
        const roomName = roomSelect.options[roomSelect.selectedIndex].text;
        const roomTypeKey = roomSelect.value;

        const bookingNotificationData = {
            guestName: guestName,
            email: guestEmail,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            roomType: roomTypeKey,
            roomName: roomName,
            guests: numPersons,
            message: `Guest ${guestName} has submitted a booking request for ${roomName} from ${checkInDate} to ${checkOutDate} for ${numPersons} person(s).`
        };

        let _csrfToken = null;
        try {
            const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
            if (csrfRes.ok) {
                const csrfData = await csrfRes.json();
                _csrfToken = csrfData.token;
            }
        } catch (e) {
            console.warn('CSRF fetch failed:', e.message);
        }

        fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(_csrfToken ? { 'X-CSRF-Token': _csrfToken } : {})
            },
            credentials: 'include',
            body: JSON.stringify(bookingNotificationData)
        })
        .then(response => response.json())
        .then(() => {
            if (typeof openBookingConfirmationModal === 'function') {
                openBookingConfirmationModal({
                    guestName: guestName,
                    email: guestEmail,
                    roomType: roomTypeKey,
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    guests: numPersons
                });
            } else {
                showBookingSuccessModal({
                    name: guestName,
                    email: guestEmail,
                    room: roomName,
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    guests: numPersons
                });
            }
            bookingForm.reset();
            document.getElementById('selectedRoom').textContent = '-';
            document.getElementById('nightsCount').textContent = '0';
            document.getElementById('nightPrice').textContent = 'BAM 0.00';
            document.getElementById('total').textContent = 'BAM 0.00';
        })
        .catch(() => {
            showBookingSuccessModal({
                name: guestName,
                email: guestEmail,
                room: roomName,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests: numPersons
            });
            bookingForm.reset();
        });
    });
});

// Active Navigation Link Highlighting is handled by IntersectionObserver in SiminHan.js
// (removed offsetTop/offsetHeight polling to eliminate forced reflow)

// ============================================================
// MONRI PAY BY LINK — intercepts bookingPaymentForm
// Calls /api/payment/pay-by-link, then redirects to payment_url
// ============================================================
function bindPayByLinkForm() {
    var paymentForm = document.getElementById('bookingPaymentForm');
    if (!paymentForm || paymentForm.dataset.payByLinkBound === 'true') return;

    // Button is always enabled — no SDK required for Pay By Link
    var confirmBtn = document.getElementById('confirmPaymentBtn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Complete Payment';
    }

    paymentForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (!document.getElementById('agreeTerms').checked) {
            if (typeof toast !== 'undefined') toast.error('Please agree to the terms and conditions');
            else alert('Please agree to the terms and conditions');
            return;
        }

        var modal = document.getElementById('bookingConfirmationModal');
        var bookingData = {};
        try { bookingData = JSON.parse(modal.dataset.bookingData || '{}'); } catch (err) { /* ignore */ }

        // Read currency selected in the booking form
        var currencyEl = document.getElementById('currency');
        var currency = currencyEl ? currencyEl.value : 'BAM';
        var price = currency === 'EUR'
            ? parseFloat(bookingData.totalPriceEUR || 0)
            : parseFloat(bookingData.totalPrice || 0);

        var confirmBtn = document.getElementById('confirmPaymentBtn');
        var originalText = confirmBtn ? confirmBtn.textContent : 'Complete Payment';
        if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = 'Processing...'; }

        try {
            let _payCSRFToken = null;
            try {
                const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
                if (csrfRes.ok) {
                    const csrfData = await csrfRes.json();
                    _payCSRFToken = csrfData.token;
                }
            } catch (e) {
                console.warn('CSRF fetch failed:', e.message);
            }

            var res = await fetch('/api/payment/pay-by-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(_payCSRFToken ? { 'X-CSRF-Token': _payCSRFToken } : {})
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: bookingData.guestName || bookingData.name || '',
                    email: bookingData.email || '',
                    phone: bookingData.phone || '',
                    checkin_date: bookingData.checkIn || bookingData.checkInDate || '',
                    checkout_date: bookingData.checkOut || bookingData.checkOutDate || '',
                    room_id: bookingData.roomType || bookingData.room_id || '',
                    hotel_id: 'sinan-han',
                    adults_number: parseInt(bookingData.guests || bookingData.numPersons || 1),
                    price: price,
                    currency: currency
                })
            });

            var data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.details || data.error || 'Payment initialization failed');
            }

            // Redirect to Monri hosted payment page
            window.location.href = data.payment_url;

        } catch (err) {
            console.error('Pay By Link error:', err.message);
            if (typeof toast !== 'undefined') toast.error(err.message || 'Payment failed. Please try again.');
            else alert(err.message || 'Payment failed. Please try again.');
            if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = originalText; }
        }
    }, true); // capture:true — runs before bubble-phase listeners

    paymentForm.dataset.payByLinkBound = 'true';
}

window.bindPayByLinkForm = bindPayByLinkForm;
bindPayByLinkForm();

// ============================================================
// MONRI WEBPAY FORM — direct POST to Monri /v2/form
// Backend generates form params (digest, auth token, etc.) and
// the frontend auto-submits a hidden form to Monri's server.
// ============================================================
function submitWebPayForm(bookingData, currency, price) {
    var btn = document.getElementById('confirmPaymentBtn');
    var originalText = btn ? btn.textContent : 'Complete Payment';
    if (btn) { btn.disabled = true; btn.textContent = 'Processing...'; }

    fetch('/api/csrf-token', { credentials: 'include' })
        .then(function(r) { return r.ok ? r.json() : { token: null }; })
        .then(function(csrf) {
            return fetch('/api/payment/webpay-form', {
                method: 'POST',
                headers: Object.assign(
                    { 'Content-Type': 'application/json' },
                    csrf.token ? { 'X-CSRF-Token': csrf.token } : {}
                ),
                credentials: 'include',
                body: JSON.stringify({
                    name: bookingData.guestName || bookingData.name || '',
                    email: bookingData.email || '',
                    phone: bookingData.phone || '',
                    checkin_date: bookingData.checkIn || bookingData.checkin_date || '',
                    checkout_date: bookingData.checkOut || bookingData.checkout_date || '',
                    room_id: bookingData.roomType || bookingData.room_id || '',
                    adults_number: parseInt(bookingData.guests || bookingData.adults_number || 1),
                    price: price,
                    currency: currency
                })
            });
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success) throw new Error(data.details || data.error || 'Payment preparation failed');
            // Build hidden form and auto-submit to Monri
            var form = document.createElement('form');
            form.method = 'POST';
            form.action = data.action;
            form.style.display = 'none';
            Object.keys(data.fields).forEach(function(key) {
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = data.fields[key];
                form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
        })
        .catch(function(err) {
            console.error('WebPay form error:', err.message);
            if (typeof toast !== 'undefined') toast.error(err.message || 'Payment failed. Please try again.');
            else alert(err.message || 'Payment failed. Please try again.');
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
        });
}
window.submitWebPayForm = submitWebPayForm;

// ============================================================
// MONRI COMPONENTS — create payment session then confirm via SDK
// Requires <script src="https://ipgtest.monri.com/dist/components.js">
// Call initMonriComponents(containerEl, bookingData, currency, price)
// ============================================================
function initMonriComponents(cardElementId, bookingData, currency, price, onApproved, onError) {
    if (typeof Monri === 'undefined') {
        var msg = 'Monri Components SDK not loaded. Ensure components.js is included.';
        console.error(msg);
        if (typeof onError === 'function') onError(msg);
        return;
    }

    fetch('/api/csrf-token', { credentials: 'include' })
        .then(function(r) { return r.ok ? r.json() : { token: null }; })
        .then(function(csrf) {
            return fetch('/api/payment/new', {
                method: 'POST',
                headers: Object.assign(
                    { 'Content-Type': 'application/json' },
                    csrf.token ? { 'X-CSRF-Token': csrf.token } : {}
                ),
                credentials: 'include',
                body: JSON.stringify({
                    name: bookingData.guestName || bookingData.name || '',
                    email: bookingData.email || '',
                    phone: bookingData.phone || '',
                    checkin_date: bookingData.checkIn || bookingData.checkin_date || '',
                    checkout_date: bookingData.checkOut || bookingData.checkout_date || '',
                    room_id: bookingData.roomType || bookingData.room_id || '',
                    adults_number: parseInt(bookingData.guests || bookingData.adults_number || 1),
                    price: price,
                    currency: currency
                })
            });
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success || !data.client_secret) {
                throw new Error(data.details || data.error || 'Failed to create payment session');
            }

            var monri = Monri(data.authenticity_token, { locale: 'en' });
            var components = monri.components({ clientSecret: data.client_secret });
            var card = components.create('card', {
                style: {
                    base: { fontSize: '16px', color: '#1a1a1a' },
                    invalid: { color: '#dc2626' },
                    complete: { color: '#16a34a' }
                }
            });
            card.mount(cardElementId);

            card.onChange(function(event) {
                var errorEl = document.getElementById('card-errors');
                if (errorEl) errorEl.textContent = event.error ? event.error.message : '';
            });

            // Store references so caller can trigger confirmPayment on form submit
            data._monri = monri;
            data._card = card;
            data._orderNumber = data.order_number;
            if (typeof onApproved === 'function') {
                // Return helper for caller to invoke on submit
                data._confirm = function(formEl) {
                    formEl.addEventListener('submit', function(e) {
                        e.preventDefault();
                        monri.confirmPayment(card, {
                            address: 'Mostar',
                            fullName: bookingData.guestName || bookingData.name || '',
                            city: 'Mostar',
                            zip: '88000',
                            phone: bookingData.phone || '',
                            country: 'BA',
                            email: bookingData.email || '',
                            orderInfo: 'Hotel Sinan Han - Room Booking'
                        }).then(function(result) {
                            if (result.error) {
                                var errorEl = document.getElementById('card-errors');
                                if (errorEl) errorEl.textContent = result.error.message;
                                if (typeof onError === 'function') onError(result.error.message);
                            } else {
                                onApproved(result.result, data._orderNumber);
                            }
                        });
                    });
                };
            }
            return data;
        })
        .catch(function(err) {
            console.error('Components init error:', err.message);
            if (typeof onError === 'function') onError(err.message);
        });
}
window.initMonriComponents = initMonriComponents;
