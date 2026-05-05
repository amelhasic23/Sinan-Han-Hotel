// ============================================
// BOOKING UI MODULE (Desktop Optimized - Phase 6)
// ============================================
// Extracted from inline script to allow deferred loading and caching

'use strict';

// Currency conversion rate (1 BAM = 0.51 EUR approximately)
const BAM_TO_EUR = 0.51;

// Room data
const roomData = {
    'standard-double': {
        title: 'Standard Double Room',
        price: 177,
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
        price: 204,
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
        price: 223,
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
        price: 260,
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
        price: 195,
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
        price: 262,
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

    if (!roomTypeSelect.value || !checkInDate || !checkOutDate) {
        document.getElementById('selectedRoom').textContent = '-';
        document.getElementById('nightsCount').textContent = '0';
        document.getElementById('nightPrice').textContent = 'BAM 0.00';
        document.getElementById('total').textContent = 'BAM 0.00';
        return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        showToast('Check-out date must be after check-in date');
        document.getElementById('total').textContent = 'BAM 0.00';
        return;
    }

    const pricePerNight = roomData[roomTypeSelect.value]?.price || 0;
    let subtotal = pricePerNight * nights;
    const selectedOption = roomTypeSelect.options[roomTypeSelect.selectedIndex];
    const roomName = selectedOption.text.split(' - ')[0];

    let displayPrice = subtotal;
    let currencySymbol = 'BAM';

    if (currency === 'EUR') {
        displayPrice = parseFloat((subtotal * BAM_TO_EUR).toFixed(2));
        currencySymbol = '€';
    }

    document.getElementById('selectedRoom').textContent = roomName;
    document.getElementById('nightsCount').textContent = nights;
    document.getElementById('nightPrice').textContent = `${pricePerNight.toFixed(2)} ${currencySymbol}`;
    document.getElementById('total').textContent = `${displayPrice.toFixed(2)} ${currencySymbol}`;
}

// Modal functionality
let currentModalRoom = null;
let modalSliderState = { currentIndex: 0 };

function openModal(roomId) {
    const modal = document.getElementById('roomModal');
    const room = roomData[roomId];

    if (room) {
        currentModalRoom = roomId;
        modalSliderState.currentIndex = 0;

        const currentLang = localStorage.getItem('language') || 'en';
        const titleKey = `modal-${roomId}-title`;
        const descKey = `modal-${roomId}-desc`;

        let titleText = room.title;
        let descText = room.description;

        if (typeof translation !== 'undefined' && translation[currentLang]) {
            if (translation[currentLang][titleKey]) {
                titleText = translation[currentLang][titleKey];
            }
            if (translation[currentLang][descKey]) {
                descText = translation[currentLang][descKey];
            }
        }

        document.getElementById('modalTitle').textContent = titleText;
        document.getElementById('modalDescription').textContent = descText;

        const wrapper = document.getElementById('modalImagesWrapper');
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
        document.getElementById('modalSliderPrev').style.display = hasMultipleImages ? 'block' : 'none';
        document.getElementById('modalSliderNext').style.display = hasMultipleImages ? 'block' : 'none';
        document.getElementById('modalImageCounter').style.display = hasMultipleImages ? 'block' : 'none';

        const dotsContainer = document.getElementById('modalSliderDots');
        dotsContainer.innerHTML = '';
        images.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = `modal-slider-dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            dot.addEventListener('click', () => modalGoToImage(index));
            dotsContainer.appendChild(dot);
        });
        dotsContainer.style.display = hasMultipleImages ? 'flex' : 'none';

        document.getElementById('modalImageCounter').textContent = `1/${images.length}`;

        document.getElementById('modalBookBtn').onclick = () => {
            closeModal();
            selectRoomForBooking(roomId, room.price, room.title);
        };

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
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
    const wrapper = document.getElementById('modalImagesWrapper');
    const imgs = wrapper.querySelectorAll('.modal-img');
    const dots = document.querySelectorAll('.modal-slider-dot');
    const counter = document.getElementById('modalImageCounter');

    imgs.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    imgs[index].classList.add('active');
    dots[index].classList.add('active');
    counter.textContent = `${index + 1}/${imgs.length}`;
    modalSliderState.currentIndex = index;
}

function closeModal() {
    const modal = document.getElementById('roomModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Close modal handlers
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('roomModal');
    const closeBtn = document.getElementById('closeModal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    const modalPrevBtn = document.getElementById('modalSliderPrev');
    const modalNextBtn = document.getElementById('modalSliderNext');

    if (modalPrevBtn) {
        modalPrevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            modalChangeImage(-1);
        });
    }

    if (modalNextBtn) {
        modalNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            modalChangeImage(1);
        });
    }

    document.addEventListener('keydown', (e) => {
        if (modal && modal.classList.contains('show')) {
            if (e.key === 'ArrowLeft') modalChangeImage(-1);
            if (e.key === 'ArrowRight') modalChangeImage(1);
            if (e.key === 'Escape') closeModal();
        }
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
});

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

    if (checkInDate) checkInDate.addEventListener('change', calculatePrice);
    if (checkOutDate) checkOutDate.addEventListener('change', calculatePrice);
    if (roomType) roomType.addEventListener('change', calculatePrice);
    if (currency) currency.addEventListener('change', calculatePrice);
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
    const modal = document.getElementById('bookingSuccessModal');
    if (!modal) return;

    document.getElementById('sm_name').textContent = data.name;
    document.getElementById('sm_email').textContent = data.email;
    document.getElementById('sm_room').textContent = data.room;
    document.getElementById('sm_checkin').textContent = data.checkIn;
    document.getElementById('sm_checkout').textContent = data.checkOut;
    document.getElementById('sm_guests').textContent = data.guests;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    function closeSuccessModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.getElementById('successModalClose').onclick = closeSuccessModal;
    document.getElementById('successModalBtn').onclick = closeSuccessModal;
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeSuccessModal();
    }, { once: true });
}

// Back to Top Button (Desktop optimized with throttle)
document.addEventListener('DOMContentLoaded', function() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    let scrollTicking = false;

    window.addEventListener('scroll', function() {
        if (!scrollTicking) {
            requestAnimationFrame(function() {
                if (window.pageYOffset > 300) {
                    backToTopBtn.classList.add('show');
                } else {
                    backToTopBtn.classList.remove('show');
                }
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Email validation helper
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Form Validation and Submission
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    bookingForm.addEventListener('submit', function(e) {
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

        const bookingNotificationData = {
            guestName: guestName,
            email: guestEmail,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            roomType: roomName,
            guests: numPersons,
            message: `Guest ${guestName} has submitted a booking request for ${roomName} from ${checkInDate} to ${checkOutDate} for ${numPersons} person(s).`
        };

        fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingNotificationData)
        })
        .then(response => response.json())
        .then(() => {
            showBookingSuccessModal({
                name: guestName,
                email: guestEmail,
                room: roomName,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests: numPersons
            });
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

// Active Navigation Link Highlighting (Desktop Optimized with cached positions)
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link-active, .nav-link');
    let sectionCache = [];
    let navScrollTicking = false;

    // Cache section positions to prevent forced reflow
    function cacheSectionPositions() {
        sectionCache = [];
        navLinks.forEach(link => {
            const sectionId = link.getAttribute('href').substring(1);
            const section = document.getElementById(sectionId);
            if (section) {
                sectionCache.push({
                    link: link,
                    top: section.offsetTop,
                    bottom: section.offsetTop + section.offsetHeight
                });
            }
        });
    }

    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100;
        navLinks.forEach(l => l.classList.remove('active'));

        for (let i = sectionCache.length - 1; i >= 0; i--) {
            if (scrollPosition >= sectionCache[i].top && scrollPosition < sectionCache[i].bottom) {
                sectionCache[i].link.classList.add('active');
                break;
            }
        }
    }

    // Initialize cache and update on resize (debounced)
    cacheSectionPositions();
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(cacheSectionPositions, 150);
    }, { passive: true });

    // Throttled scroll handler
    window.addEventListener('scroll', function() {
        if (!navScrollTicking) {
            requestAnimationFrame(function() {
                updateActiveLink();
                navScrollTicking = false;
            });
            navScrollTicking = true;
        }
    }, { passive: true });

    updateActiveLink();
});

// ============================================================
// MONRI PAYMENT — intercepts bookingPaymentForm before SiminHan.js
// This runs first (booking-ui.js is deferred before SiminHan.min.js)
// stopImmediatePropagation blocks the broken SiminHan.js handler
// ============================================================
(function () {
    var paymentForm = document.getElementById('bookingPaymentForm');
    if (!paymentForm) return;

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

        var confirmBtn = document.getElementById('confirmPaymentBtn');
        var originalText = confirmBtn ? confirmBtn.textContent : 'Complete Payment';
        if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = 'Initializing...'; }

        try {
            var initRes = await fetch('/api/payment/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    guestName: bookingData.guestName || bookingData.name || '',
                    email: bookingData.email || '',
                    checkIn: bookingData.checkIn || bookingData.checkInDate || '',
                    checkOut: bookingData.checkOut || bookingData.checkOutDate || '',
                    roomType: bookingData.roomType || '',
                    guests: bookingData.guests || bookingData.numPersons || 1,
                    totalPrice: bookingData.totalPrice || 0,
                    currency: 'BAM'
                })
            });

            var payData = await initRes.json();
            if (!initRes.ok || !payData.success) {
                throw new Error(payData.error || 'Payment initialization failed');
            }

            if (typeof Monri === 'undefined') {
                throw new Error('Monri SDK not loaded. Please refresh and try again.');
            }

            var lightbox = Monri.Lightbox({
                authenticityToken: payData.merchantId,
                amount: payData.amount,
                currency: payData.currency,
                digest: payData.digest,
                order_number: payData.orderNumber,
                timestamp: payData.timestamp,
                order_info: 'Sinan Han Hotel Room Booking',
                ch_full_name: payData.guestName || bookingData.guestName || '',
                ch_email: payData.email || bookingData.email || '',
                ch_city: 'Mostar',
                ch_country: 'BA',
                ch_zip: '88000',
                ch_address: '-',
                ch_phone: bookingData.phone || '000000000',
                notification_url: window.location.origin + '/webhook/monri',
                redirect_url: window.location.href
            });

            lightbox.open();

            if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = originalText; }

            // Poll for payment status
            var orderNumber = payData.orderNumber;
            var polls = 0;
            var pollInterval = setInterval(async function () {
                polls++;
                if (polls > 30) {
                    clearInterval(pollInterval);
                    return;
                }
                try {
                    var statusRes = await fetch('/api/booking/' + orderNumber, { credentials: 'include' });
                    var statusData = await statusRes.json();
                    if (statusData.status === 'paid') {
                        clearInterval(pollInterval);
                        if (typeof toast !== 'undefined') toast.success('Payment confirmed! Your booking is complete.');
                        else alert('Payment confirmed! Your booking is complete.');
                        var closeBtn = document.getElementById('closeConfirmModal');
                        if (closeBtn) closeBtn.click();
                        document.querySelector('form') && document.querySelector('form').reset();
                    } else if (statusData.status === 'declined') {
                        clearInterval(pollInterval);
                        if (typeof toast !== 'undefined') toast.error('Payment was declined. Please try again.');
                        else alert('Payment was declined. Please try again.');
                    }
                } catch (err) { /* silent poll error */ }
            }, 2000);

        } catch (err) {
            console.error('Monri payment error:', err.message);
            if (typeof toast !== 'undefined') toast.error(err.message || 'Payment failed. Please try again.');
            else alert(err.message || 'Payment failed. Please try again.');
            if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = originalText; }
        }
    }, true); // capture:true — runs before bubble-phase listeners
}());
