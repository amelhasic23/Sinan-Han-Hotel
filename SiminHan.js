// ============================================
// SERVICE WORKER REGISTRATION (Phase 3)
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// ============================================
// ANALYTICS TRACKING (Phase 3)
// ============================================
const analytics = {
    // Track room view
    trackRoomView: (roomId, roomName) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_item', {
                currency: 'BAM',
                items: [{ item_id: roomId, item_name: roomName, item_category: 'room' }]
            });
        }
    },

    // Track booking start (aliases trackBookingAttempt for callers using either name)
    trackBookingAttempt: (roomType) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'begin_checkout', {
                currency: 'BAM',
                items: [{ item_id: roomType, quantity: 1 }]
            });
        }
    },
    trackBookingStart(roomType) { this.trackBookingAttempt(roomType); },

    // Track successful booking — signature: (bookingId, roomType, totalPrice)
    trackBookingSuccess: (bookingId, roomType, totalPrice) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'purchase', {
                transaction_id: bookingId,
                value: totalPrice,
                currency: 'BAM',
                items: [{ item_id: roomType, quantity: 1, price: totalPrice }]
            });
        }
    },

    // Track payment method selection
    trackPaymentMethodSelected: (method) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'add_payment_info', { payment_type: method });
        }
    },

    // Track booking / payment failure
    trackBookingFailure: (reason) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'booking_error', { reason });
        }
    },

    // Track language change
    trackLanguageChange: (language) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'language_change', { language });
            gtag('set', { user_language: language });
        }
    },

    // Track form submission
    trackFormSubmit: (formType) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', { form_type: formType });
        }
    }
};

const translation = {
  en: {
    'nav-home': 'Home',
    'nav-rooms': 'Rooms',
    'nav-amenities': 'Amenities',
    'nav-reviews': 'Reviews',
    'nav-contact': 'Contact',
    'hotel-name': 'Sinan Han',
    'hero-subtitle': 'Where Tradition Meets Modern Comfort',
    'reserve-btn': 'Reserve Now',
    'book-btn': 'Book Now',
    'about-title': 'Welcome to Hotel Sinan Han — Where Heritage Meets Comfort',
    'about-p1': 'Ideally situated in the heart of Mostar, just 100 metres from the world-famous Old Bridge, Hotel Sinan Han offers a perfect blend of tradition, elegance, and modern hospitality.',
    'about-p2': 'In July 2025, we proudly expanded our property with 8 brand-new luxury units, featuring a selection of double rooms, triple rooms, and studio apartments. Designed with comfort and style in mind, each unit provides a premium stay for couples, families, solo travelers, and small groups.',
    'about-p3': 'Guests are invited to relax on our rooftop terrace, which boasts panoramic views of Mostar\'s historic cityscape. Complimentary high-speed WiFi is available throughout the hotel. Private on-site parking is available (surcharge applies), and for guests traveling by motorcycle, we offer secure motorbike parking free of charge.',
    'about-p4': 'All guest rooms are fully air-conditioned and include private bathrooms. Select rooms offer breathtaking views of the surrounding mountains or city. Each unit is equipped with a Smart TV with satellite channels, providing access to streaming services. Newly added units also feature a fully equipped kitchen, ideal for guests seeking added independence and convenience during their stay.',
    'about-p5': 'Our reception team is available to assist with personalized excursions and guided tours across Herzegovina, helping you discover its rich culture, natural beauty, and hidden gems.',
    'about-p6': 'Popular points of interest within walking distance include the Muslibegović House (900 metres) and the Kujundžiluk Old Bazaar (100 metres). The nearest airport is Mostar International Airport and Sarajevo International Airport (110 km), and airport transfers can be arranged upon request (additional charges apply).',
    'rooms-title': 'Our Rooms',
    'rooms-subtitle': 'Discover our collection of comfortable and elegant accommodations',
    'view-details': 'View Details',
    'per-night': 'per night',
    'book-now': 'Book Now',
    'most-popular': 'Most Popular',
    'std-dbl-name': 'Standard Double Room',
    'std-dbl-desc': 'Room • 18 m²',
    'std-dbl-feat1': '1 Large Double Bed',
    'std-dbl-feat2': 'Flat-Screen TV',
    'std-dbl-feat3': 'Terrace with City Views',
    'std-dbl-highlights': 'This air-conditioned double room includes a flat-screen TV with cable channels, a private bathroom as well as a terrace with city views. Free toiletries included.',
    'std-dbl-price': 'BAM 138.86',
    'sup-suite-name': 'Superior Suite',
    'sup-suite-desc': 'Entire apartment • 45 m²',
    'sup-suite-feat1': '1 Extra-Large Double Bed + Sofa Bed',
    'sup-suite-feat2': 'Full Kitchen',
    'sup-suite-feat3': 'Flat-Screen TV',
    'sup-suite-highlights': 'Boasting a private entrance, this air-conditioned apartment features 1 living room, 1 separate bedroom and 1 bathroom with a walk-in shower and a bidet. In the well-fitted kitchen, guests will find a stovetop, refrigerator, kitchenware and an oven. Featuring a terrace with garden views, this apartment also features soundproof walls and a flat-screen TV with cable channels.',
    'sup-suite-price': 'BAM 177.98',
    'dbl-terrace-name': 'Double Room with Terrace',
    'dbl-terrace-desc': 'Room • 18 m²',
    'dbl-terrace-feat1': '1 Large Double Bed',
    'dbl-terrace-feat2': 'Terrace with Mountain Views',
    'dbl-terrace-feat3': 'Smart TV',
    'dbl-terrace-highlights': 'This air-conditioned double room includes a flat-screen TV with cable channels, a private bathroom as well as a terrace with mountain views.',
    'dbl-terrace-price': 'BAM 159.86',
    'std-queen-name': 'Standard Queen Room',
    'std-queen-desc': 'Room • 24 m²',
    'std-queen-feat1': '1 Extra-Large Double Bed',
    'std-queen-feat2': 'Garden Views',
    'std-queen-feat3': 'Flat-Screen TV',
    'std-queen-highlights': 'Offering free toiletries, this double room includes a private bathroom with a walk-in shower and a bidet. Features soundproof walls and a minibar.',
    'std-queen-price': 'BAM 165.00',
    'sup-apt-name': 'Superior Apartment',
    'sup-apt-desc': 'Entire apartment • 45 m²',
    'sup-apt-feat1': '1 Extra-Large Double Bed + Sofa Bed',
    'sup-apt-feat2': 'Full Kitchen',
    'sup-apt-feat3': 'Flat-Screen TV',
    'sup-apt-highlights': 'Boasting a private entrance, this air-conditioned apartment features 1 living room, 1 separate bedroom and 1 bathroom with a walk-in shower and a bidet. In the well-fitted kitchen, guests will find a stovetop, a refrigerator, kitchenware and an oven. Featuring a terrace with garden views, this apartment also features soundproof walls and a flat-screen TV with cable channels.',
    'sup-apt-price': 'BAM 185.00',
    'deluxe-name': 'Deluxe Suite',
    'deluxe-desc': 'Room • 29 m²',
    'deluxe-feat1': '1 Sofa Bed + 1 Large Double Bed',
    'deluxe-feat2': 'Mountain & City Views',
    'deluxe-feat3': 'Flat-Screen TV',
    'deluxe-highlights': 'High floor deluxe suite featuring 1 sofa bed and 1 large double bed with free cot available on request. Air-conditioned room with patio, ensuite bathroom, terrace, coffee machine, minibar and free WiFi. Includes mountain views, landmark views, city views, and river view. Safety deposit box, hypoallergenic bedding, private entrance with soundproofing.',
    'deluxe-price': 'BAM 195.00',
    'amenities-title': 'World-Class Amenities',
    'amenities-subtitle': 'Comfort meets authentic heritage',
    'amenity-wifi-title': 'Free WiFi',
    'amenity-wifi-desc': 'High-speed internet throughout',
    'amenity-restaurant-title': 'Restaurant',
    'amenity-restaurant-desc': 'Authentic Bosnian cuisine',
    'amenity-service-title': '24/7 Service',
    'amenity-service-desc': 'Dedicated concierge assistance',
    'amenity-wellness-title': 'Wellness',
    'amenity-wellness-desc': 'Spa and massage services',
    'amenity-business-title': 'Business Center',
    'amenity-business-desc': 'Full office facilities',
    'amenity-security-title': 'Security',
    'amenity-security-desc': 'Safe deposit boxes',
    'reviews-title': 'Guest Reviews',
    'reviews-subtitle': 'Hear from our satisfied guests',
    'rating-label': 'Excellent',
    'rating-count': 'Rated by 847 guests',
    'booking-title': 'Check Availability',
    'booking-subtitle': 'Find your perfect dates and book with ease',
    'form-name-label': 'Guest Name',
    'form-email-label': 'Email',
    'form-checkin-label': 'Check-in',
    'form-checkout-label': 'Check-out',
    'form-room-label': 'Room Type',
    'form-guests-label': 'Number of Guests',
    'form-currency-label': 'Currency',
    'price-room-label': 'Room:',
    'price-nights-label': 'Nights:',
    'price-per-night-label': 'Total per night:',
    'price-total-label': 'Total:',
    'complete-booking-btn': 'Complete Booking',
    'contact-title': 'Get in Touch',
    'contact-address-label': 'Address',
    'contact-phone-label': 'Phone',
    'contact-email-label': 'Email',
    'contact-location-label': 'Location',
    'contact-location-text': 'Just 100 metres from the world-famous Old Bridge',
    'maps-btn': 'View on Google Maps',
    'footer-about-title': 'About Sinan Han',
    'footer-about-desc': 'A perfectly preserved boutique hotel offering authentic heritage and modern comfort in the heart of Mostar.',
    'footer-links-title': 'Quick Links',
    'footer-home': 'Home',
    'footer-rooms': 'Rooms',
    'footer-amenities': 'Amenities',
    'footer-reviews': 'Reviews',
    'footer-policies-title': 'Policies',
    'footer-privacy': 'Privacy Policy',
    'footer-terms': 'Terms & Conditions',
    'footer-cancellation': 'Cancellation Policy',
    'footer-house-rules': 'House Rules',
    'footer-important-info': 'Important Legal & Info',
    'footer-guest-reviews': 'Guest Reviews',
    'footer-follow-title': 'Follow Us',
    'footer-copyright': '© 2026 Sinan Han. All rights reserved. | Designed with ♥ for travelers',
    'social-facebook-title': 'Follow us on Facebook',
    'social-instagram-title': 'Follow us on Instagram',
    'social-booking-title': 'Book on Booking.com',
    'footer-house-rules-title': 'View our house rules and policies on Booking.com',
    'footer-important-info-title': 'View important legal information on Booking.com',
    'footer-guest-reviews-title': 'Read guest reviews on Booking.com',
    'footer-registration-title': 'View official business registration document',
    'modal-book-btn': 'Book This Room',
    'select-room': 'Select a room',
    'currency-bam': 'BAM (Bosnian Mark)',
    'currency-eur': 'EUR (Euro)',
    'pricing-label': 'Room Pricing',
    'guests-label': 'Guests',
    'room-price-label': 'Room Price',
    'tax-label': 'Tax',
    'total-label': 'Total',
    'per-night-label': 'Per Night',
    'standard-double-pricing': 'Standard Double Room - 2 Guests: BAM 198 | EUR 101 | Tax: BAM 8 | EUR 4 | Total: BAM 206 | EUR 105',
    'superior-suite-pricing': 'Superior Suite - 2 Guests: BAM 226 | EUR 116 | Tax: BAM 8 | EUR 4 | Total: BAM 234 | EUR 120 | 3 Guests: BAM 253 | EUR 129 | Tax: BAM 12 | EUR 6 | Total: BAM 265 | EUR 135',
    'deluxe-suite-pricing': 'Deluxe Suite - 2 Guests: BAM 226 | EUR 116 | Tax: BAM 8 | EUR 4 | Total: BAM 234 | EUR 120 | 3 Guests: BAM 253 | EUR 129 | Tax: BAM 12 | EUR 6 | Total: BAM 265 | EUR 135',
    'double-terrace-pricing': 'Double Room with Terrace - 1 Guest: BAM 214 | EUR 109 | Tax: BAM 4 | EUR 2 | Total: BAM 218 | EUR 111 | 2 Guests: BAM 251 | EUR 128 | Tax: BAM 8 | EUR 4 | Total: BAM 259 | EUR 132',
    'standard-queen-pricing': 'Standard Queen Room - 1 Guest: BAM 362 | EUR 185 | Tax: BAM 4 | EUR 2 | Total: BAM 366 | EUR 187 | 2 Guests: BAM 234 | EUR 120 | Tax: BAM 8 | EUR 4 | Total: BAM 242 | EUR 124',
    'superior-apartment-pricing': 'Superior Apartment - 2 Guests: BAM 306 | EUR 156 | Tax: BAM 8 | EUR 4 | Total: BAM 314 | EUR 160 | 3 Guests: BAM 334 | EUR 171 | Tax: BAM 12 | EUR 6 | Total: BAM 346 | EUR 177',
    'review-1-text': '"Thank you very much for accommodating my late check-in and for the wonderful support from your front desk staff, especially for someone like me who tends to forget things. The location was very convenient, and the place was clean and well maintained. Although my stay was short, it was very comfortable and pleasant. When I visit Mostar again, I would definitely love to stay here again. Thank you once again for your kindness."',
    'review-1-author': 'Takako',
    'review-1-location': 'Japan • Deluxe Suite • February 2026',
    'review-2-text': '"The cleanliness was truly outstanding – everything was absolutely spotless. We were kindly given a free room upgrade, which made our stay even more enjoyable. The room was super spacious, modern, and felt brand new. A special shoutout to the lovely lady at the front desk – she was incredibly welcoming and helpful! Overall, a wonderful experience."',
    'review-2-author': 'Ivan',
    'review-2-location': 'Montenegro • Deluxe Suite • December 2025',
    'review-3-text': '"Cleanliness, location, attention to detail on everything. Fresh new apartment, new appliances. Ardijan & Lovedrim went above and beyond with their exceptional attitude and service – they did everything and beyond. The staff truly goes the extra mile to make your stay perfect."',
    'review-3-author': 'Munsoor',
    'review-3-location': 'United Kingdom • Deluxe Suite • December 2025',
    'modal-standard-double-title': 'Standard Double Room',
    'modal-standard-double-desc': 'Room • 18 m²\n\nThis air-conditioned double room includes a flat-screen TV with cable channels, a private bathroom as well as a terrace with city views. Free toiletries included.\n\nAmenities:\n• 1 Large Double Bed\n• Flat-Screen TV\n• Terrace with City Views\n• Air Conditioning\n• Private Bathroom',
    'modal-superior-suite-title': 'Superior Suite',
    'modal-superior-suite-desc': 'Entire apartment • 45 m²\n\nBoasting a private entrance, this air-conditioned apartment features 1 living room, 1 separate bedroom and 1 bathroom with a walk-in shower and a bidet. In the well-fitted kitchen, guests will find a stovetop, refrigerator, kitchenware and an oven. Featuring a terrace with garden views, this apartment also features soundproof walls and a flat-screen TV with cable channels.\n\nAmenities:\n• 1 Extra-Large Double Bed + Sofa Bed\n• Full Kitchen\n• Flat-Screen TV\n• Soundproof Walls\n• Terrace with Garden Views',
    'modal-double-terrace-title': 'Double Room with Terrace',
    'modal-double-terrace-desc': 'Room • 18 m²\n\nThis air-conditioned double room includes a flat-screen TV with cable channels, a private bathroom as well as a terrace with mountain views.\n\nAmenities:\n• 1 Large Double Bed\n• Terrace with Mountain Views\n• Smart TV\n• Air Conditioning\n• Private Bathroom',
    'modal-standard-queen-title': 'Standard Queen Room',
    'modal-standard-queen-desc': 'Room • 24 m²\n\nOffering free toiletries, this double room includes a private bathroom with a walk-in shower and a bidet. Features soundproof walls and a minibar.\n\nAmenities:\n• 1 Extra-Large Double Bed\n• Garden Views\n• Flat-Screen TV\n• Soundproof Walls\n• Minibar',
    'modal-superior-apartment-title': 'Superior Apartment',
    'modal-superior-apartment-desc': 'Entire apartment • 45 m²\n\nBoasting a private entrance, this air-conditioned apartment features 1 living room, 1 separate bedroom and 1 bathroom with a walk-in shower and a bidet. In the well-fitted kitchen, guests will find a stovetop, a refrigerator, kitchenware and an oven. Featuring a terrace with garden views, this apartment also features soundproof walls and a flat-screen TV with cable channels. The unit has 2 beds.\n\nAmenities:\n• 1 Extra-Large Double Bed + Sofa Bed\n• Full Kitchen with Stovetop & Oven\n• Coffee Machine & Minibar\n• Flat-Screen TV with Cable Channels\n• Soundproof Walls\n• Walk-in Shower with Bidet\n• Terrace with Garden, Mountain & City Views\n• Air Conditioning\n• Free WiFi',
    'modal-deluxe-suite-title': 'Deluxe Suite',
    'modal-deluxe-suite-desc': 'High Floor Room • 29 m²\n\nWe have 1 left! This luxurious deluxe suite features 1 sofa bed and 1 large double bed with free cot available on request. Located on a high floor with stunning views.\n\nAmenities:\n• 1 Sofa Bed + 1 Large Double Bed\n• Mountain View, Landmark View, City View, River View\n• Inner Courtyard View\n• Air Conditioning\n• Patio & Terrace\n• Ensuite Bathroom with Bath or Shower\n• Flat-Screen TV with Satellite Channels\n• Soundproofing\n• Coffee Machine & Minibar\n• Free WiFi & Free Toiletries\n• Safety Deposit Box\n• Hypoallergenic Bedding\n• Hairdryer, Iron & Tea/Coffee Maker\n• Private Entrance\n• Dressing Room & Wardrobe\n• Seating Area with Sofa Bed',
    'house-rules': 'House Rules & Policies',
    'two-bed-deluxe-name': 'Two-Bedroom Deluxe Apartment',
    'two-bed-deluxe-desc': 'Entire apartment • 65 m²',
    'two-bed-deluxe-feat1': '2 Extra-Large Double Beds',
    'two-bed-deluxe-feat2': 'Full Kitchen',
    'two-bed-deluxe-feat3': 'Spacious Living Room',
    'two-bed-deluxe-highlights': 'Spacious two-bedroom deluxe apartment featuring 2 extra-large double beds, a fully equipped kitchen, a separate living room with sofa, and a private bathroom with walk-in shower. Ideal for families or small groups. Air-conditioned with flat-screen TV, free WiFi, and stunning city views.',
    'two-bed-deluxe-price': 'BAM 262',
    'modal-two-bedroom-deluxe-title': 'Two-Bedroom Deluxe Apartment',
    'modal-two-bedroom-deluxe-desc': 'Entire apartment • 65 m²\n\nSpacious two-bedroom deluxe apartment featuring 2 extra-large double beds, a fully equipped kitchen, and a separate living room with sofa. Ideal for families or small groups.\n\nAmenities:\n• 2 Extra-Large Double Beds\n• Full Kitchen with Stovetop & Oven\n• Spacious Living Room with Sofa\n• Private Bathroom with Walk-in Shower\n• Air Conditioning\n• Flat-Screen TV with Cable Channels\n• Free WiFi & Free Toiletries\n• City & Mountain Views',
    'hr-title': 'House Rules',
    'hr-special-requests': 'Hotel Sinan Han takes special requests — add in the next step!',
    'hr-checkin-title': 'Check-in',
    'hr-checkin-time': 'From 14:00 to 00:00',
    'hr-checkin-note': 'You\'ll need to let the property know in advance what time you\'ll arrive.',
    'hr-checkout-title': 'Check-out',
    'hr-checkout-time': 'From 07:00 to 11:00',
    'hr-cancellation-title': 'Cancellation / Prepayment',
    'hr-cancellation-text': 'Cancellation and prepayment policies vary according to accommodation type. Please enter the dates of your stay and check the conditions of your required option.',
    'hr-children-title': 'Children and Beds',
    'hr-child-policies': 'Child policies',
    'hr-children-welcome': 'Children of any age are welcome.',
    'hr-children-adult-charge': 'Children 7 years and above will be charged as adults at this property.',
    'hr-children-under7': 'If you are travelling with children under 7 years, to ensure you pay the correct price please select a rate that has child occupancy specified.',
    'hr-cot-title': 'Cot and Extra Bed Policies',
    'hr-cot-label': '0 – 3 years:',
    'hr-cot-free': 'Cot upon request — Free',
    'hr-cot-note': 'The number of cots allowed is dependent on the option you choose. Please check your selected option for more information.',
    'hr-no-extra-beds': 'There are no extra beds available at this property.',
    'hr-cots-availability': 'All cots are subject to availability.',
    'hr-age-title': 'Age Restriction',
    'hr-age-text': 'There is no age requirement for check-in.',
    'hr-pets-title': 'Pets',
    'hr-pets-text': 'Pets are not allowed.',
    'li-title': 'Important Legal & Info',
    'li-arrival-title': 'Arrival Time',
    'li-arrival-text': 'Please inform Hotel Sinan Han in advance of your expected arrival time. You can use the Special Requests box when booking, or contact the property directly with the contact details provided in your confirmation.',
    'li-health-title': 'Health & Safety',
    'li-health-text': 'In response to Coronavirus (COVID-19), additional safety and sanitation measures are in effect at this property.',
    'footer-registration': 'Business Registration',
    'reg-title': 'Business Classification Notice',
    'reg-country': 'BOSNIA AND HERZEGOVINA',
    'reg-entity': 'FEDERATION OF BOSNIA AND HERZEGOVINA',
    'reg-institute': 'FEDERAL INSTITUTE OF STATISTICS SARAJEVO',
    'reg-dept': 'STATISTICS DEPT. FOR HERZEGOVINA-NERETVA CANTON REGION MOSTAR',
    'reg-number-label': 'Number:',
    'reg-date-label': 'Date:',
    'reg-law-basis': 'Pursuant to Article 7, Paragraph (1) and Article 11 of the Law on Classification of Activities in the Federation of BiH (Official Gazette of FBiH, No. 64/07 and 80/11), the following is issued:',
    'reg-notice-title': 'NOTICE ON CLASSIFICATION OF BUSINESS ENTITY ACCORDING TO ACTIVITY CLASSIFICATION',
    'reg-name-label': 'Business Name:',
    'reg-name-value': 'Accommodation in household "SINAN-HAN", owner Arif Jašari',
    'reg-address-label': 'Registered address:',
    'reg-id-label': 'ID Number:',
    'reg-code-label': 'Activity Code (KD BiH 2010):',
    'reg-activity-label': 'Activity Name:',
    'reg-activity-value': 'Holiday and other short-stay accommodation',
    'reg-explanation-title': 'Explanation:',
    'reg-explanation-p1': 'In the procedure conducted at the request of the party, or ex officio, it was determined that the conditions from Articles 9 and 11 of the Law on Classification of Activities in the Federation of Bosnia and Herzegovina have been met for issuing this notice.',
    'reg-explanation-p2': 'If the business entity considers that it has been incorrectly classified, it has the right within 15 days of receipt of this notice to submit to this Institute a request for reclassification with the required documentation.',
    'reg-authority-title': 'BY AUTHORITY OF THE DIRECTOR, CHIEF'
  },
  bs: {
    'nav-home': 'Početna',
    'nav-rooms': 'Sobe',
    'nav-amenities': 'Sadržaji',
    'nav-reviews': 'Recenzije',
    'nav-contact': 'Kontakt',
    'hotel-name': 'Sinan Han',
    'hero-subtitle': 'Gdje se Tradicija Susreće sa Modernim Komfortom',
    'reserve-btn': 'Rezerviraj Sada',
    'book-btn': 'Rezervacija Sada',
    'about-title': 'Dobrodošli u Hotel Sinan Han — Gdje se Baština Susreće sa Komfortom',
    'about-p1': 'Idealno pozicioniran u srcu Mostara, samo 100 metara od svjetski poznatog Starog mosta, Hotel Sinan Han nudi savršenu kombinaciju tradicije, elegancije i moderne gostoprimljivosti.',
    'about-p2': 'U julu 2025. godine, sa ponosom predstavljamo 8 potpuno novih luksuznih jedinica, sa odabirom dvokrevetnih soba, trokrevetnih soba i apartmana. Dizajnirane sa komfortom i stilom, svaka jedinica pružanja premium boravak za parove, porodice, solo putnike i male grupe.',
    'about-p3': 'Gostima stoji na raspolaganju naša terasa na krovu sa panoramskom pogledom na historijski predjel Mostara. Besplatni brzi internet dostupan je na cijeloj hotel površini. Privatno parkiraliste je dostupno (dodatna naknada), a gostima koji putuju motornim biciklima nudimo besplatno sigurno parkiraliste za motocikle.',
    'about-p4': 'Sve sobe za goste su u potpunosti klimatizovane i sadrže privatne kupatila. Odabrane sobe pružaju prekrasan pogled na okolne planine ili grad. Svaka jedinica opremljena je pametnim TV-om sa satelitskim kanalima sa pristupom streaming servisima. Novododane jedinice su također opremljene sa potpuno opremljenom kuhinjom, idealno za goste koji žele dodatnu nezavisnost i pogodnost tijekom svog boravka.',
    'about-p5': 'Naš receptivni tim dostupan je da vas pomogne sa personalizovanim izletima i vođenim turima kroz Hercegovinu, čime vam pomaže da otkrije njenu bogatih kulturu, prirodnu ljepotu i skrivene dragulj.',
    'about-p6': 'Popularne znamenitosti u pješačkoj udaljenosti uključuju Muslibegović kuću (900 metara) i Stari bazar Kujundžiluk (100 metara). Najbliži aerodrom je Međunarodni aerodrom Mostar i Međunarodni aerodrom Sarajevo (110 km), a prevoze od aerodroma je moguće dogovoriti na zahtjev (dodatne naknade se primjenjuju).',
    'rooms-title': 'Naše Sobe',
    'rooms-subtitle': 'Otkrijte našu kolekciju udobnih i elegantnih smještaja',
    'view-details': 'Pogledaj Detaljno',
    'per-night': 'po noći',
    'book-now': 'Rezervacija Sada',
    'most-popular': 'Najpopularnije',
    'std-dbl-name': 'Standardna Dvokrevetna Soba',
    'std-dbl-desc': 'Soba • 18 m²',
    'std-dbl-feat1': '1 Veliki Dvostruki Krevet',
    'std-dbl-feat2': 'TV sa Ravnom Ekranom',
    'std-dbl-feat3': 'Terasa sa Pogledom na Grad',
    'std-dbl-highlights': 'Ova klimatizirana dvokrevetna soba uključuje TV sa ravnom ekranom sa kabelskim kanalima, privatno kupatilo kao i terasu sa pogledom na grad. Besplatna toaletna sredstva su uključena.',
    'std-dbl-price': 'BAM 138,86',
    'sup-suite-name': 'Superior Suite',
    'sup-suite-desc': 'Čitav apartman • 45 m²',
    'sup-suite-feat1': '1 Ekstra-Veliki Dvostruki Krevet + Sofa Krevet',
    'sup-suite-feat2': 'Potpuna Kuhinja',
    'sup-suite-feat3': 'TV sa Ravnom Ekranom',
    'sup-suite-highlights': 'Sa privatnim ulazom, ovaj klimatizovani apartman sadrži 1 dnevnu sobu, 1 odvojenu spavaču sobu i 1 kupatilo sa walk-in tušem i bidetom. U dobro opremljenu kuhinju, gosti će pronaći štednjak, frižider, kuhinjski pribor i pećnicu. Sa terasom sa pogledom na vrt, ovaj apartman također sadrži zvučno izolirane zidove i TV sa ravnom ekranom sa kabelskim kanalima.',
    'sup-suite-price': 'BAM 177,98',
    'dbl-terrace-name': 'Dvokrevetna Soba sa Terasom',
    'dbl-terrace-desc': 'Soba • 18 m²',
    'dbl-terrace-feat1': '1 Veliki Dvostruki Krevet',
    'dbl-terrace-feat2': 'Terasa sa Pogledom na Planine',
    'dbl-terrace-feat3': 'Pametni TV',
    'dbl-terrace-highlights': 'Ova klimatizirana dvokrevetna soba uključuje TV sa ravnom ekranom sa kabelskim kanalima, privatno kupatilo kao i terasu sa pogledom na planine.',
    'dbl-terrace-price': 'BAM 159,86',
    'std-queen-name': 'Standardna Queen Soba',
    'std-queen-desc': 'Soba • 24 m²',
    'std-queen-feat1': '1 Ekstra-Veliki Dvostruki Krevet',
    'std-queen-feat2': 'Pogled na Vrt',
    'std-queen-feat3': 'TV sa Ravnom Ekranom',
    'std-queen-highlights': 'Nudeći besplatna toaletna sredstva, ova dvokrevetna soba uključuje privatno kupatilo sa walk-in tušem i bidetom. Sadrži zvučno izolirane zidove i mini bar.',
    'std-queen-price': 'BAM 165,00',
    'sup-apt-name': 'Superior Apartman',
    'sup-apt-desc': 'Čitav apartman • 45 m²',
    'sup-apt-feat1': '1 Ekstra-Veliki Dvostruki Krevet + Sofa Krevet',
    'sup-apt-feat2': 'Potpuna Kuhinja',
    'sup-apt-feat3': 'TV sa Ravnom Ekranom',
    'sup-apt-highlights': 'Sa privatnim ulazom, ovaj klimatizovani apartman sadrži 1 dnevnu sobu, 1 odvojenu spavaču sobu i 1 kupatilo sa walk-in tušem i bidetom. U dobro opremljenu kuhinju, gosti će pronaći štednjak, frižider, kuhinjski pribor i pećnicu. Sa terasom sa pogledom na vrt, ovaj apartman također sadrži zvučno izolirane zidove i TV sa ravnom ekranom sa kabelskim kanalima.',
    'sup-apt-price': 'BAM 185,00',
    'deluxe-name': 'Deluxe Suite',
    'deluxe-desc': 'Soba • 29 m²',
    'deluxe-feat1': '1 Sofa Krevet + 1 Veliki Dvostruki Krevet',
    'deluxe-feat2': 'Pogled na Planinu & Grad',
    'deluxe-feat3': 'TV sa Ravnom Ekranom',
    'deluxe-highlights': 'Ova luksuzna deluxe suite na visokom katu sadrži 1 sofa krevet i 1 veliki dvostruki krevet sa besplatnim dječjim krevetom na zahtjev. Klimatizirana soba sa verandom, privat kupatilo, terasa, kafematic, minibar i besplatan WiFi. Sa pogledom na planinu, znamenitosti, grad i rijeku. Sejf za vrijedne stvari, hipoalergene posteljine, privatan ulaz sa zvučnom izolacijom.',
    'deluxe-price': 'BAM 195,00',
    'amenities-title': 'Svjetske Klase Sadržaji',
    'amenities-subtitle': 'Komfort se susreće sa autentičnom baštinom',
    'amenity-wifi-title': 'Besplatni WiFi',
    'amenity-wifi-desc': 'Brzi internet na cijeloj površini',
    'amenity-restaurant-title': 'Restoran',
    'amenity-restaurant-desc': 'Autentična bosanska kuhinja',
    'amenity-service-title': 'Služba 24/7',
    'amenity-service-desc': 'Namjenski concierge servis',
    'amenity-wellness-title': 'Wellness',
    'amenity-wellness-desc': 'Spa i masaže',
    'amenity-business-title': 'Poslovni Centar',
    'amenity-business-desc': 'Kompletan poslovni prostor',
    'amenity-security-title': 'Sigurnost',
    'amenity-security-desc': 'Sefovi za dragocjenosti',
    'reviews-title': 'Gostoljubne Recenzije',
    'reviews-subtitle': 'Čujte od naših zadovoljnih gostiju',
    'rating-label': 'Odličan',
    'rating-count': 'Ocijenjen od strane 847 gostiju',
    'booking-title': 'Provjera Dostupnosti',
    'booking-subtitle': 'Pronađite vaše savršene datume i rezervirajte sa lakoćom',
    'form-name-label': 'Ime Gosta',
    'form-email-label': 'Email',
    'form-checkin-label': 'Prijava',
    'form-checkout-label': 'Odjava',
    'form-room-label': 'Vrsta Sobe',
    'form-guests-label': 'Broj Gostiju',
    'form-currency-label': 'Valuta',
    'price-room-label': 'Soba:',
    'price-nights-label': 'Noći:',
    'price-per-night-label': 'Ukupno po noći:',
    'price-total-label': 'Ukupno:',
    'complete-booking-btn': 'Završite Rezervaciju',
    'contact-title': 'Kontaktirajte Nas',
    'contact-address-label': 'Adresa',
    'contact-phone-label': 'Telefon',
    'contact-email-label': 'Email',
    'contact-location-label': 'Lokacija',
    'contact-location-text': 'Samo 100 metara od svjetski poznatog Starog mosta',
    'maps-btn': 'Pogledaj na Google Mapama',
    'footer-about-title': 'O Sinan Hanu',
    'footer-about-desc': 'Savršeno očuvani butique hotel koji nudi autentičnu baštinu i moderni komfort u srcu Mostara.',
    'footer-links-title': 'Brze Veze',
    'footer-home': 'Početna',
    'footer-rooms': 'Sobe',
    'footer-amenities': 'Sadržaji',
    'footer-reviews': 'Recenzije',
    'footer-policies-title': 'Politike',
    'footer-privacy': 'Politika Privatnosti',
    'footer-terms': 'Uslovi i Odredbe',
    'footer-cancellation': 'Politika Otkazivanja',
    'footer-house-rules': 'Pravila Kuće',
    'footer-important-info': 'Važne Pravne Informacije',
    'footer-guest-reviews': 'Recenzije Gostiju',
    'footer-follow-title': 'Pratite Nas',
    'footer-copyright': '© 2026 Sinan Han. Sva prava zadržana. | Dizajnirano sa ♥ za putnika',
    'social-facebook-title': 'Pratite nas na Facebooku',
    'social-instagram-title': 'Pratite nas na Instagramu',
    'social-booking-title': 'Rezervišite na Booking.com',
    'footer-house-rules-title': 'Pogledajte pravila kuće i politike na Booking.com',
    'footer-important-info-title': 'Pogledajte važne pravne informacije na Booking.com',
    'footer-guest-reviews-title': 'Pročitajte recenzije gostiju na Booking.com',
    'footer-registration-title': 'Pogledajte službeni dokument o registraciji djelatnosti',
    'modal-book-btn': 'Rezervacija Ove Sobe',
    'select-room': 'Odaberite sobu',
    'currency-bam': 'BAM (Bosanska Marka)',
    'currency-eur': 'EUR (Euro)',
    'pricing-label': 'Cijene Soba',
    'guests-label': 'Gosti',
    'room-price-label': 'Cijena Sobe',
    'tax-label': 'Porez',
    'total-label': 'Ukupno',
    'per-night-label': 'Po Noći',
    'standard-double-pricing': 'Standardna Dvokrevetna Soba - 2 Gosta: BAM 198 | EUR 101 | Porez: BAM 8 | EUR 4 | Ukupno: BAM 206 | EUR 105',
    'superior-suite-pricing': 'Superior Suite - 2 Gosta: BAM 226 | EUR 116 | Porez: BAM 8 | EUR 4 | Ukupno: BAM 234 | EUR 120 | 3 Gosta: BAM 253 | EUR 129 | Porez: BAM 12 | EUR 6 | Ukupno: BAM 265 | EUR 135',
    'deluxe-suite-pricing': 'Deluxe Suite - 2 Gosta: BAM 226 | EUR 116 | Porez: BAM 8 | EUR 4 | Ukupno: BAM 234 | EUR 120 | 3 Gosta: BAM 253 | EUR 129 | Porez: BAM 12 | EUR 6 | Ukupno: BAM 265 | EUR 135',
    'double-terrace-pricing': 'Dvokrevetna Soba sa Terasom - 1 Gost: BAM 214 | EUR 109 | Porez: BAM 4 | EUR 2 | Ukupno: BAM 218 | EUR 111 | 2 Gosta: BAM 251 | EUR 128 | Porez: BAM 8 | EUR 4 | Ukupno: BAM 259 | EUR 132',
    'standard-queen-pricing': 'Standardna Queen Soba - 1 Gost: BAM 362 | EUR 185 | Porez: BAM 4 | EUR 2 | Ukupno: BAM 366 | EUR 187 | 2 Gosta: BAM 234 | EUR 120 | Porez: BAM 8 | EUR 4 | Ukupno: BAM 242 | EUR 124',
    'superior-apartment-pricing': 'Superior Apartment - 2 Gosta: BAM 306 | EUR 156 | Porez: BAM 8 | EUR 4 | Ukupno: BAM 314 | EUR 160 | 3 Gosta: BAM 334 | EUR 171 | Porez: BAM 12 | EUR 6 | Ukupno: BAM 346 | EUR 177',
    'review-1-text': '"Hvala vam puno što ste omogućili moj kasni ulazak i na divnoj potpori od vašeg recepcijskog osoblja, posebno za nekoga kao što sam ja koji ima tendenciju da zaboravi stvari. Lokacija je bila bardzo praktična, a mjesto je bilo čisto i dobro održavano. Iako je moj boravak bio kratak, bio je vrlo ugodno i ugodno. Kada se vratim u Mostar, definitivno bih volio da se opet smestim ovdje. Hvala vam još jednom na vašoj ljubaznosti."',
    'review-1-author': 'Takako',
    'review-1-location': 'Japan • Deluxe Suite • February 2026',
    'review-2-text': '"Čistoća je bila zaista izvanredna – sve je bilo apsolutno besprijekorno. Ljubazno su nam dali besplatno unaprijeđenje sobe, što je naš boravak učinilo još ugodnijim. Soba je bila super prostrana, moderna i izgledala je sasvim nova. Posebna hvala lijepoj dami na recepciji – bila je nevjerojatno dobrodošla i korisna! Cjelokupno, divno iskustvo."',
    'review-2-author': 'Ivan',
    'review-2-location': 'Crna Gora • Deluxe Suite • December 2025',
    'review-3-text': '"Čistoća, lokacija, precioznost u svakom detalju. Svježa nova apartman, novi uređaji. Ardijan & Lovedrim su otišli više od očekivanja sa svojom izvanrednom stavom i servisom – učinili su sve i više. Osoblje zaista ide na dodatnu milju da vam učini boravak savršenim."',
    'review-3-author': 'Munsoor',
    'review-3-location': 'Ujedinjeno Kraljevstvo • Deluxe Suite • December 2025',
    'modal-standard-double-title': 'Standardna Dvokrevetna Soba',
    'modal-standard-double-desc': 'Soba • 18 m²\n\nOva klimatizirana dvokrevetna soba uključuje TV sa ravnom ekranom sa kabelskim kanalima, privatno kupatilo kao i terasu sa pogledom na grad. Besplatna toaletna sredstva su uključena.\n\nSadržaji:\n• 1 Veliki Dvostruki Krevet\n• TV sa Ravnom Ekranom\n• Terasa sa Pogledom na Grad\n• Klimatizacija\n• Privatno Kupatilo',
    'modal-superior-suite-title': 'Superior Suite',
    'modal-superior-suite-desc': 'Čitav apartman • 45 m²\n\nSa privatnim ulazom, ovaj klimatizovani apartman sadrži 1 dnevnu sobu, 1 odvojenu spavaču sobu i 1 kupatilo sa walk-in tušem i bidetom. U dobro opremljenu kuhinju, gosti će pronaći štednjak, frižider, kuhinjski pribor i pećnicu. Sa terasom sa pogledom na vrt, ovaj apartman također sadrži zvučno izolirane zidove i TV sa ravnom ekranom sa kabelskim kanalima.\n\nSadržaji:\n• 1 Ekstra-Veliki Dvostruki Krevet + Sofa Krevet\n• Potpuna Kuhinja\n• TV sa Ravnom Ekranom\n• Zvučno Izolirani Zidovi\n• Terasa sa Pogledom na Vrt',
    'modal-double-terrace-title': 'Dvokrevetna Soba sa Terasom',
    'modal-double-terrace-desc': 'Soba • 18 m²\n\nOva klimatizirana dvokrevetna soba uključuje TV sa ravnom ekranom sa kabelskim kanalima, privatno kupatilo kao i terasu sa pogledom na planine.\n\nSadržaji:\n• 1 Veliki Dvostruki Krevet\n• Terasa sa Pogledom na Planine\n• Pametni TV\n• Klimatizacija\n• Privatno Kupatilo',
    'modal-standard-queen-title': 'Standardna Queen Soba',
    'modal-standard-queen-desc': 'Soba • 24 m²\n\nNudeći besplatna toaletna sredstva, ova dvokrevetna soba uključuje privatno kupatilo sa walk-in tušem i bidetom. Sadrži zvučno izolirane zidove i mini bar.\n\nSadržaji:\n• 1 Ekstra-Veliki Dvostruki Krevet\n• Pogled na Vrt\n• TV sa Ravnom Ekranom\n• Zvučno Izolirani Zidovi\n• Minibar',
    'modal-superior-apartment-title': 'Superior Apartman',
    'modal-superior-apartment-desc': 'Čitav apartman • 45 m²\n\nSa privatnim ulazom, ovaj klimatizovani apartman sadrži 1 dnevnu sobu, 1 odvojenu spavaču sobu i 1 kupatilo sa walk-in tušem i bidetom. U dobro opremljenu kuhinju, gosti će pronaći štednjak, frižider, kuhinjski pribor i pećnicu. Sa terasom sa pogledom na vrt, ovaj apartman također sadrži zvučno izolirane zidove i TV sa ravnom ekranom sa kabelskim kanalima. Jedinica ima 2 kreveta.\n\nSadržaji:\n• 1 Ekstra-Veliki Dvostruki Krevet + Sofa Krevet\n• Potpuna Kuhinja sa Štednjakom & Pećnicom\n• Aparat za Kafu & Minibar\n• TV sa Ravnom Ekranom sa Kabelskim Kanalima\n• Zvučno Izolirani Zidovi\n• Walk-in Tuš sa Bidetom\n• Terasa sa Pogledom na Vrt, Planine & Grad\n• Klimatizacija\n• Besplatni WiFi',
    'modal-deluxe-suite-title': 'Deluxe Suite',
    'modal-deluxe-suite-desc': 'Soba na Visokom Spratu • 29 m²\n\nIman samo 1 ostalo! Ova luksuzna deluxe soba ima 1 sofa krevet i 1 veliki dvokrevetni krevet sa besplatnom koljevkom dostupnom na zahtjev. Nalazi se na visokom spratu sa fantastičnim pogledom.\n\nSadržaji:\n• 1 Sofa Krevet + 1 Veliki Dvokrevetni Krevet\n• Pogled na Planine, Znamenitosti, Grad i Rijeku\n• Pogled na Unutarnje Dvorište\n• Klimatizacija\n• Terasa i Patio\n• Vlastito Kupatilo sa Kadom ili Tušem\n• TV sa Ravnom Ekranom sa Satelitskim Kanalima\n• Zvučna Izolacija\n• Aparat za Kafu & Minibar\n• Besplatni WiFi & Besplatna Toaletna Sredstva\n• Sigurnosni Depozit\n• Hipoalergene Posteljine\n• Sušilo za Kosu, Pegla & Aparat za Čaj/Kafu\n• Privatni Ulaz\n• Garderoba i Ormar\n•Area za Sjedenje sa Sofa Krevetom',
    'house-rules': 'Pravila Kuće & Politike',
    'two-bed-deluxe-name': 'Luksuzni apartman s dvije spavaće sobe',
    'two-bed-deluxe-desc': 'Cijeli apartman • 65 m²',
    'two-bed-deluxe-feat1': '2 extra-velika bračna kreveta',
    'two-bed-deluxe-feat2': 'Potpuno opremljena kuhinja',
    'two-bed-deluxe-feat3': 'Prostrani dnevni boravak',
    'two-bed-deluxe-highlights': 'Prostrani luksuzni apartman s dvije spavaće sobe s 2 extra-velika bračna kreveta, potpuno opremljenom kuhinjom, odvojenim dnevnim boravkom s kaučem i privatnom kupaonicom s walk-in tušem. Idealno za obitelji ili male grupe.',
    'two-bed-deluxe-price': 'BAM 262',
    'modal-two-bedroom-deluxe-title': 'Luksuzni apartman s dvije spavaće sobe',
    'modal-two-bedroom-deluxe-desc': 'Cijeli apartman • 65 m²\n\nProstrani luksuzni apartman s dvije spavaće sobe, 2 extra-velika bračna kreveta, potpuno opremljenom kuhinjom i odvojenim dnevnim boravkom s kaučem.\n\nSadržaji:\n• 2 Extra-velika Bračna Kreveta\n• Potpuna Kuhinja sa Štednjakom & Pećnicom\n• Prostrani Dnevni Boravak s Kaučem\n• Privatno Kupatilo s Walk-in Tušem\n• Klimatizacija\n• TV sa Ravnom Ekranom s Kabelskim Kanalima\n• Besplatni WiFi & Besplatna Toaletna Sredstva\n• Pogled na Grad & Planine',
    'hr-title': 'Pravila Kuće',
    'hr-special-requests': 'Hotel Sinan Han prima posebne zahtjeve — dodajte u sljedećem koraku!',
    'hr-checkin-title': 'Prijava',
    'hr-checkin-time': 'Od 14:00 do 00:00',
    'hr-checkin-note': 'Trebate obavijestiti smještaj unaprijed o vremenu dolaska.',
    'hr-checkout-title': 'Odjava',
    'hr-checkout-time': 'Od 07:00 do 11:00',
    'hr-cancellation-title': 'Otkazivanje / Pretplata',
    'hr-cancellation-text': 'Politike otkazivanja i pretplate variraju prema vrsti smještaja. Unesite datume boravka i provjerite uvjete željene opcije.',
    'hr-children-title': 'Djeca i Kreveti',
    'hr-child-policies': 'Politike za djecu',
    'hr-children-welcome': 'Djeca svih uzrasta su dobrodošla.',
    'hr-children-adult-charge': 'Djeca od 7 godina i starija se naplaćuju kao odrasli u ovom smještaju.',
    'hr-children-under7': 'Ako putujete s djecom mlađom od 7 godina, odaberite tarifu s naznačenom dječjom popunjenošću kako biste platili ispravnu cijenu.',
    'hr-cot-title': 'Politike za Krevetiće i Dodatne Krevete',
    'hr-cot-label': '0 – 3 godine:',
    'hr-cot-free': 'Dječji krevetić na zahtjev — Besplatno',
    'hr-cot-note': 'Broj dozvoljenih krevetića ovisi o odabranoj opciji. Provjerite odabranu opciju za više informacija.',
    'hr-no-extra-beds': 'Nema dostupnih dodatnih kreveta u ovom smještaju.',
    'hr-cots-availability': 'Svi dječji krevetići su podložni dostupnosti.',
    'hr-age-title': 'Dobno Ograničenje',
    'hr-age-text': 'Nema dobnog ograničenja za prijavu.',
    'hr-pets-title': 'Kućni Ljubimci',
    'hr-pets-text': 'Kućni ljubimci nisu dozvoljeni.',
    'li-title': 'Važne Pravne Informacije',
    'li-arrival-title': 'Vrijeme Dolaska',
    'li-arrival-text': 'Molimo vas da unaprijed obavijestite Hotel Sinan Han o vašem očekivanom vremenu dolaska. Možete koristiti okvir za posebne zahtjeve pri rezervaciji ili kontaktirati smještaj direktno koristeći kontakt detalje iz potvrde.',
    'li-health-title': 'Zdravlje i Sigurnost',
    'li-health-text': 'Kao odgovor na Koronavirus (COVID-19), dodatne mjere sigurnosti i sanitacije su na snazi u ovom smještaju.',
    'footer-registration': 'Registracija djelatnosti',
    'reg-title': 'Obavještenje o razvrstavanju',
    'reg-country': 'BOSNA I HERCEGOVINA',
    'reg-entity': 'FEDERACIJA BOSNE I HERCEGOVINE',
    'reg-institute': 'FEDERALNI ZAVOD ZA STATISTIKU SARAJEVO',
    'reg-dept': 'SLUŽBA ZA STATISTIKU ZA PODRUČJE HERCEGOVAČKO-NERETVANSKOG KANTONA MOSTAR',
    'reg-number-label': 'Broj:',
    'reg-date-label': 'Datum:',
    'reg-law-basis': 'Na osnovu člana 7. stav (1) i člana 11. Zakona o klasifikaciji djelatnosti u Federaciji Bosne i Hercegovine ("Službene novine Federacije BiH", br. 64/07 i 80/11), izdaje se:',
    'reg-notice-title': 'OBAVJEŠTENJE O RAZVRSTAVANJU POSLOVNOG SUBJEKTA PREMA KLASIFIKACIJI DJELATNOSTI',
    'reg-name-label': 'Naziv poslovnog subjekta:',
    'reg-name-value': 'Sobe u domaćinstvu "SINAN-HAN" vl. Arif Jašari',
    'reg-address-label': 'Sjedište i adresa:',
    'reg-id-label': 'Identifikacioni broj (ID):',
    'reg-code-label': 'Šifra djelatnosti (KD BIH 2010):',
    'reg-activity-label': 'Naziv djelatnosti:',
    'reg-activity-value': 'Odmarališta i slični objekti za kraći odmor',
    'reg-explanation-title': 'Obrazloženje:',
    'reg-explanation-p1': 'U postupku provedenom po zahtjevu stranke, odnosno službenoj dužnosti, utvrđeno je da su ispunjene pretpostavke iz člana 9. i 11. Zakona o klasifikaciji djelatnosti u Federaciji Bosne i Hercegovine, za izdavanje ovog obavještenja.',
    'reg-explanation-p2': 'Ukoliko poslovni subjekt smatra da je nepravilno razvrstan, ima pravo u roku od 15 dana od dana prijema ovog obavještenja podnijeti ovom Zavodu zahtjev za ponovno razvrstavanje sa potrebnom dokumentacijom.',
    'reg-authority-title': 'OVLAŠTENJU DIREKTORA NAČELNIK'
  },
  de: {
    'nav-home': 'Startseite',
    'nav-rooms': 'Zimmer',
    'nav-amenities': 'Ausstattung',
    'nav-reviews': 'Bewertungen',
    'nav-contact': 'Kontakt',
    'hotel-name': 'Sinan Han',
    'hero-subtitle': 'Wo Tradition auf Modernen Komfort Trifft',
    'reserve-btn': 'Jetzt Reservieren',
    'book-btn': 'Jetzt Buchen',
    'about-title': 'Willkommen im Hotel Sinan Han — Wo Tradition auf Komfort Trifft',
    'about-p1': 'Das Hotel Sinan Han liegt ideal im Herzen von Mostar, nur 100 Meter von der weltberühmten Alten Brücke entfernt, und bietet eine perfekte Mischung aus Tradition, Eleganz und moderner Gastfreundschaft.',
    'about-p2': 'Im Juli 2025 erweiterten wir unser Angebot stolz um 8 brandneue Luxuseinheiten mit einer Auswahl an Doppelzimmern, Dreibettzimmern und Studio-Apartments. Jede Einheit wurde mit Komfort und Stil gestaltet und bietet einen Premium-Aufenthalt für Paare, Familien, Einzelreisende und kleine Gruppen.',
    'about-p3': 'Gäste können sich auf unserer Dachterrasse mit Panoramablick auf die historische Altstadt von Mostar entspannen. Kostenloses Hochgeschwindigkeits-WLAN ist überall im Hotel verfügbar. Privatparkplätze vor Ort sind verfügbar (gegen Gebühr), und für Gäste, die mit Motorrädern reisen, bieten wir kostenlose sichere Motorradparkplätze.',
    'about-p4': 'Alle Zimmer sind vollständig klimatisiert und mit privaten Badezimmern ausgestattet. Ausgewählte Zimmer bieten atemberaubende Ausblicke auf die umliegenden Berge oder die Stadt. Jede Einheit ist mit einem Smart-TV mit Satellitenkanälen ausgestattet, die Zugriff auf Streaming-Dienste bieten. Neu hinzugefügte Einheiten verfügen auch über eine voll ausgestattete Küche, ideal für Gäste, die während ihres Aufenthalts mehr Unabhängigkeit und Bequemlichkeit wünschen.',
    'about-p5': 'Unser Rezeptionsteam steht Ihnen zur Verfügung, um personalisierte Ausflüge und Führungen durch die Herzegowina zu organisieren und Ihnen dabei zu helfen, ihre reiche Kultur, natürliche Schönheit und verborgene Schätze zu entdecken.',
    'about-p6': 'Beliebte Sehenswürdigkeiten in Fußnähe sind das Haus Muslibegović (900 Meter) und das Alte Basar Kujundžiluk (100 Meter). Die nächsten Flughäfen sind der Flughafen Mostar und der Flughafen Sarajevo (110 km). Flughafentransfers können auf Anfrage arrangiert werden (Zusatzgebühren anfallen).',
    'rooms-title': 'Unsere Zimmer',
    'rooms-subtitle': 'Entdecken Sie unsere Sammlung komfortabler und eleganter Unterkünfte',
    'view-details': 'Details Anzeigen',
    'per-night': 'pro Nacht',
    'book-now': 'Jetzt Buchen',
    'most-popular': 'Am Beliebtesten',
    'std-dbl-name': 'Standardzimmer mit Doppelbett',
    'std-dbl-desc': 'Zimmer • 18 m²',
    'std-dbl-feat1': '1 Großes Doppelbett',
    'std-dbl-feat2': 'Flachbildschirm-TV',
    'std-dbl-feat3': 'Terrasse mit Stadtblick',
    'std-dbl-highlights': 'Dieses klimatisierte Doppelzimmer verfügt über einen Flachbildschirm-TV mit Kabelkanälen, ein privates Badezimmer sowie eine Terrasse mit Stadtblick. Kostenlose Toilettenartikel sind inbegriffen.',
    'std-dbl-price': 'BAM 138,86',
    'sup-suite-name': 'Superior Suite',
    'sup-suite-desc': 'Gesamte Wohnung • 45 m²',
    'sup-suite-feat1': '1 Extragrosses Doppelbett + Schlafsofa',
    'sup-suite-feat2': 'Vollständige Küche',
    'sup-suite-feat3': 'Flachbildschirm-TV',
    'sup-suite-highlights': 'Mit privatem Eingang verfügt diese klimatisierte Wohnung über 1 Wohnzimmer, 1 separates Schlafzimmer und 1 Badezimmer mit begehbarer Dusche und Bidet. In der gut ausgestatteten Küche finden Gäste einen Herd, einen Kühlschrank, Küchenutensilien und einen Ofen. Mit einer Terrasse mit Gartenblick verfügt diese Wohnung auch über schalldichte Wände und einen Flachbildschirm-TV mit Kabelkanälen.',
    'sup-suite-price': 'BAM 177,98',
    'dbl-terrace-name': 'Doppelzimmer mit Terrasse',
    'dbl-terrace-desc': 'Zimmer • 18 m²',
    'dbl-terrace-feat1': '1 Großes Doppelbett',
    'dbl-terrace-feat2': 'Terrasse mit Bergblick',
    'dbl-terrace-feat3': 'Smart-TV',
    'dbl-terrace-highlights': 'Dieses klimatisierte Doppelzimmer verfügt über einen Flachbildschirm-TV mit Kabelkanälen, ein privates Badezimmer sowie eine Terrasse mit Bergblick.',
    'dbl-terrace-price': 'BAM 159,86',
    'std-queen-name': 'Standard Queen Room',
    'std-queen-desc': 'Zimmer • 24 m²',
    'std-queen-feat1': '1 Extragrosses Doppelbett',
    'std-queen-feat2': 'Gartenblick',
    'std-queen-feat3': 'Flachbildschirm-TV',
    'std-queen-highlights': 'Dieses Doppelzimmer bietet kostenlose Toilettenartikel und ein privates Badezimmer mit begehbarer Dusche und Bidet. Mit schalldichten Wänden und einer Minibar ausgestattet.',
    'std-queen-price': 'BAM 165,00',
    'sup-apt-name': 'Superior Wohnung',
    'sup-apt-desc': 'Gesamte Wohnung • 45 m²',
    'sup-apt-feat1': '1 Extragrosses Doppelbett + Schlafsofa',
    'sup-apt-feat2': 'Vollständige Küche',
    'sup-apt-feat3': 'Flachbildschirm-TV',
    'sup-apt-highlights': 'Mit privatem Eingang verfügt diese klimatisierte Wohnung über 1 Wohnzimmer, 1 separates Schlafzimmer und 1 Badezimmer mit begehbarer Dusche und Bidet. In der gut ausgestatteten Küche finden Gäste einen Herd, einen Kühlschrank, Küchenutensilien und einen Ofen. Mit einer Terrasse mit Gartenblick verfügt diese Wohnung auch über schalldichte Wände und einen Flachbildschirm-TV mit Kabelkanälen.',
    'sup-apt-price': 'BAM 185,00',
    'deluxe-name': 'Deluxe Suite',
    'deluxe-desc': 'Zimmer • 29 m²',
    'deluxe-feat1': '1 Schlafsofa + 1 Großes Doppelbett',
    'deluxe-feat2': 'Berg- & Stadtblick',
    'deluxe-feat3': 'Flachbildschirm-TV',
    'deluxe-highlights': 'Diese luxuriöse Deluxe Suite im oberen Geschoss verfügt über 1 Schlafsofa und 1 großes Doppelbett mit kostenlosen Kinderbett auf Anfrage. Klimatisiertes Zimmer mit Veranda, eigenem Badezimmer, Terrasse, Kaffeemaschine, Minibar und kostenlosem WLAN. Mit Bergblick, Sehenswürdigkeitsblick, Stadtblick und Flussblick. Safe für Wertsachen, hypoallergene Bettwäsche, privater Eingang mit Schalldämmung.',
    'deluxe-price': 'BAM 195,00',
    'amenities-title': 'Weltklasse Ausstattung',
    'amenities-subtitle': 'Komfort trifft auf authentisches Erbe',
    'amenity-wifi-title': 'Kostenloses WLAN',
    'amenity-wifi-desc': 'Schnelles Internet überall',
    'amenity-restaurant-title': 'Restaurant',
    'amenity-restaurant-desc': 'Authentische bosnische Küche',
    'amenity-service-title': '24/7 Service',
    'amenity-service-desc': 'Spezialisierte Concierge-Unterstützung',
    'amenity-wellness-title': 'Wellness',
    'amenity-wellness-desc': 'Spa- und Massagedienstleistungen',
    'amenity-business-title': 'Geschäftszentrum',
    'amenity-business-desc': 'Vollständige Büroausstattung',
    'amenity-security-title': 'Sicherheit',
    'amenity-security-desc': 'Safes für Wertsachen',
    'reviews-title': 'Gästebewertungen',
    'reviews-subtitle': 'Hören Sie von unseren zufriedenen Gästen',
    'rating-label': 'Ausgezeichnet',
    'rating-count': 'Bewertet von 847 Gästen',
    'booking-title': 'Verfügbarkeit Prüfen',
    'booking-subtitle': 'Finden Sie Ihre perfekten Termine und buchen Sie problemlos',
    'form-name-label': 'Name des Gastes',
    'form-email-label': 'Email',
    'form-checkin-label': 'Anreise',
    'form-checkout-label': 'Abreise',
    'form-room-label': 'Zimmertyp',
    'form-guests-label': 'Anzahl der Gäste',
    'form-currency-label': 'Währung',
    'price-room-label': 'Zimmer:',
    'price-nights-label': 'Nächte:',
    'price-per-night-label': 'Gesamt pro Nacht:',
    'price-total-label': 'Gesamt:',
    'complete-booking-btn': 'Buchung Abschließen',
    'contact-title': 'Kontaktieren Sie Uns',
    'contact-address-label': 'Adresse',
    'contact-phone-label': 'Telefon',
    'contact-email-label': 'Email',
    'contact-location-label': 'Standort',
    'contact-location-text': 'Nur 100 Meter von der weltberühmten Alten Brücke entfernt',
    'maps-btn': 'Auf Google Maps Anzeigen',
    'footer-about-title': 'Über Sinan Han',
    'footer-about-desc': 'Ein perfekt erhaltenes Boutique-Hotel, das authentisches Erbe und modernen Komfort im Herzen von Mostar bietet.',
    'footer-links-title': 'Schnelllinks',
    'footer-home': 'Startseite',
    'footer-rooms': 'Zimmer',
    'footer-amenities': 'Ausstattung',
    'footer-reviews': 'Bewertungen',
    'footer-policies-title': 'Richtlinien',
    'footer-privacy': 'Datenschutzrichtlinie',
    'footer-terms': 'Allgemeine Geschäftsbedingungen',
    'footer-cancellation': 'Stornierungsrichtlinie',
    'footer-house-rules': 'Hausregeln',
    'footer-important-info': 'Wichtige Rechtliche Informationen',
    'footer-guest-reviews': 'Gästebewertungen',
    'footer-follow-title': 'Folgen Sie Uns',
    'footer-copyright': '© 2026 Sinan Han. Alle Rechte vorbehalten. | Mit ♥ für Reisende entworfen',
    'social-facebook-title': 'Folgen Sie uns auf Facebook',
    'social-instagram-title': 'Folgen Sie uns auf Instagram',
    'social-booking-title': 'Buchen Sie auf Booking.com',
    'footer-house-rules-title': 'Siehe Hausregeln und Richtlinien auf Booking.com',
    'footer-important-info-title': 'Siehe wichtige rechtliche Informationen auf Booking.com',
    'footer-guest-reviews-title': 'Lesen Sie Gästebewertungen auf Booking.com',
    'footer-registration-title': 'Offizielles Gewerbeanmeldedokument anzeigen',
    'modal-book-btn': 'Dieses Zimmer Buchen',
    'review-1-text': '"Vielen Dank, dass Sie meine verspätete Ankunft berücksichtigt haben und für die wunderbare Unterstützung Ihres Rezeptionsteams, besonders für jemanden wie mich, der dazu neigt, Dinge zu vergessen. Der Standort war sehr praktisch und der Ort war sauber und gut gepflegt. Obwohl mein Aufenthalt kurz war, war er sehr komfortabel und angenehm. Wenn ich Mostar wieder besuche, würde ich gerne hier übernachten. Danke nochmal für Ihre Freundlichkeit."',
    'review-1-author': 'Takako',
    'review-1-location': 'Japan • Deluxe Suite • Februar 2026',
    'review-2-text': '"Die Sauberkeit war wirklich beeindruckend – alles war absolut makellos. Wir bekamen freundlicherweise ein kostenloses Upgrade, das unseren Aufenthalt noch angenehmer gestaltete. Das Zimmer war super geräumig, modern und wirkte brandneu. Ein besonderer Dank an die liebe Dame an der Rezeption – sie war unglaublich freundlich und hilfsbereit! Insgesamt eine wunderbare Erfahrung."',
    'review-2-author': 'Ivan',
    'review-2-location': 'Montenegro • Deluxe Suite • Dezember 2025',
    'review-3-text': '"Sauberkeit, Lage, Aufmerksamkeit zum Detail in allem. Frische neue Wohnung, neue Geräte. Ardijan & Lovedrim waren außergewöhnlich in ihrer Einstellung und ihrem Service – sie haben alles und noch mehr getan. Das Personal geht wirklich die extra Meile, um Ihren Aufenthalt perfekt zu machen."',
    'review-3-author': 'Munsoor',
    'review-3-location': 'Vereinigtes Königreich • Deluxe Suite • Dezember 2025',
    'modal-standard-double-title': 'Standardzimmer mit Doppelbett',
    'modal-standard-double-desc': 'Zimmer • 18 m²\n\nDieses klimatisierte Doppelzimmer verfügt über einen Flachbildschirm-TV mit Kabelkanälen, ein privates Badezimmer sowie eine Terrasse mit Stadtblick. Kostenlose Toilettenartikel sind inbegriffen.\n\nAusstattung:\n• 1 Großes Doppelbett\n• Flachbildschirm-TV\n• Terrasse mit Stadtblick\n• Klimaanlage\n• Privates Badezimmer',
    'modal-superior-suite-title': 'Superior Suite',
    'modal-superior-suite-desc': 'Gesamte Wohnung • 45 m²\n\nMit privatem Eingang verfügt diese klimatisierte Wohnung über 1 Wohnzimmer, 1 separates Schlafzimmer und 1 Badezimmer mit begehbarer Dusche und Bidet. In der gut ausgestatteten Küche finden Gäste einen Herd, einen Kühlschrank, Küchenutensilien und einen Ofen. Mit einer Terrasse mit Gartenblick verfügt diese Wohnung auch über schalldichte Wände und einen Flachbildschirm-TV mit Kabelkanälen.\n\nAusstattung:\n• 1 Extragrosses Doppelbett + Schlafsofa\n• Vollständige Küche\n• Flachbildschirm-TV\n• Schalldichte Wände\n• Terrasse mit Gartenblick',
    'modal-double-terrace-title': 'Doppelzimmer mit Terrasse',
    'modal-double-terrace-desc': 'Zimmer • 18 m²\n\nDieses klimatisierte Doppelzimmer verfügt über einen Flachbildschirm-TV mit Kabelkanälen, ein privates Badezimmer sowie eine Terrasse mit Bergblick.\n\nAusstattung:\n• 1 Großes Doppelbett\n• Terrasse mit Bergblick\n• Smart-TV\n• Klimaanlage\n• Privates Badezimmer',
    'modal-standard-queen-title': 'Standard Queen Room',
    'modal-standard-queen-desc': 'Zimmer • 24 m²\n\nDieses Doppelzimmer bietet kostenlose Toilettenartikel und ein privates Badezimmer mit begehbarer Dusche und Bidet. Mit schalldichten Wänden und einer Minibar ausgestattet.\n\nAusstattung:\n• 1 Extragrosses Doppelbett\n• Gartenblick\n• Flachbildschirm-TV\n• Schalldichte Wände\n• Minibar',
    'modal-superior-apartment-title': 'Superior Wohnung',
    'modal-superior-apartment-desc': 'Gesamte Wohnung • 45 m²\n\nMit privatem Eingang verfügt diese klimatisierte Wohnung über 1 Wohnzimmer, 1 separates Schlafzimmer und 1 Badezimmer mit begehbarer Dusche und Bidet. In der gut ausgestatteten Küche finden Gäste einen Herd, einen Kühlschrank, Küchenutensilien und einen Ofen. Mit einer Terrasse mit Gartenblick verfügt diese Wohnung auch über schalldichte Wände und einen Flachbildschirm-TV mit Kabelkanälen. Die Einheit hat 2 Betten.\n\nAusstattung:\n• 1 Extragrosses Doppelbett + Schlafsofa\n• Vollständige Küche mit Herd & Ofen\n• Kaffeemaschine & Minibar\n• Flachbildschirm-TV mit Kabelkanälen\n• Schalldichte Wände\n• Begehbare Dusche mit Bidet\n• Terrasse mit Garten-, Berg- & Stadtblick\n• Klimaanlage\n• Kostenloses WLAN',
    'modal-deluxe-suite-title': 'Deluxe Suite',
    'modal-deluxe-suite-desc': 'Zimmer im oberen Stockwerk • 29 m²\n\nWir haben noch 1 verfügbar! Diese luxuriöse Deluxe Suite verfügt über 1 Schlafsofa und 1 grosses Doppelbett mit kostenlosem Kinderbett auf Anfrage. Befindet sich in einem oberen Stockwerk mit herrlicher Aussicht.\n\nAusstattung:\n• 1 Schlafsofa + 1 Grosses Doppelbett\n• Bergblick, Wahrzeichen-Blick, Stadtblick, Flussblick\n• Innenhofblick\n• Klimaanlage\n• Terrasse und Patio\n• Eigenes Badezimmer mit Wanne oder Dusche\n• Flachbildschirm-TV mit Satellitenkanälen\n• Schalldichte Wände\n• Kaffeemaschine & Minibar\n• Kostenloses WLAN & Kostenlose Toilettenartikel\n• Tresor\n• Hypoallergene Bettwäsche\n• Föhn, Bügeleisen & Tee-/Kaffeemaschine\n• Privater Eingang\n• Ankleideraum & Kleiderschrank\n• Sitzbereich mit Schlafsofa',
    'pricing-label': 'Zimmerpreise',
    'guests-label': 'Gäste',
    'room-price-label': 'Zimmerpreis',
    'tax-label': 'Steuer',
    'total-label': 'Gesamt',
    'per-night-label': 'Pro Nacht',
    'standard-double-pricing': 'Standardzimmer mit Doppelbett - 2 Gäste: BAM 198 | EUR 101 | Steuer: BAM 8 | EUR 4 | Gesamt: BAM 206 | EUR 105',
    'superior-suite-pricing': 'Superior Suite - 2 Gäste: BAM 226 | EUR 116 | Steuer: BAM 8 | EUR 4 | Gesamt: BAM 234 | EUR 120 | 3 Gäste: BAM 253 | EUR 129 | Steuer: BAM 12 | EUR 6 | Gesamt: BAM 265 | EUR 135',
    'deluxe-suite-pricing': 'Deluxe Suite - 2 Gäste: BAM 226 | EUR 116 | Steuer: BAM 8 | EUR 4 | Gesamt: BAM 234 | EUR 120 | 3 Gäste: BAM 253 | EUR 129 | Steuer: BAM 12 | EUR 6 | Gesamt: BAM 265 | EUR 135',
    'double-terrace-pricing': 'Doppelzimmer mit Terrasse - 1 Gast: BAM 214 | EUR 109 | Steuer: BAM 4 | EUR 2 | Gesamt: BAM 218 | EUR 111 | 2 Gäste: BAM 251 | EUR 128 | Steuer: BAM 8 | EUR 4 | Gesamt: BAM 259 | EUR 132',
    'standard-queen-pricing': 'Standard Queen Zimmer - 1 Gast: BAM 362 | EUR 185 | Steuer: BAM 4 | EUR 2 | Gesamt: BAM 366 | EUR 187 | 2 Gäste: BAM 234 | EUR 120 | Steuer: BAM 8 | EUR 4 | Gesamt: BAM 242 | EUR 124',
    'superior-apartment-pricing': 'Superior Apartment - 2 Gäste: BAM 306 | EUR 156 | Steuer: BAM 8 | EUR 4 | Gesamt: BAM 314 | EUR 160 | 3 Gäste: BAM 334 | EUR 171 | Steuer: BAM 12 | EUR 6 | Gesamt: BAM 346 | EUR 177',
    'house-rules': 'Hausregeln & Richtlinien',
    'two-bed-deluxe-name': 'Deluxe-Apartment mit zwei Schlafzimmern',
    'two-bed-deluxe-desc': 'Gesamte Wohnung • 65 m²',
    'two-bed-deluxe-feat1': '2 Extrabreite Doppelbetten',
    'two-bed-deluxe-feat2': 'Voll ausgestattete Küche',
    'two-bed-deluxe-feat3': 'Geräumiges Wohnzimmer',
    'two-bed-deluxe-highlights': 'Geräumiges Deluxe-Apartment mit zwei Schlafzimmern, 2 extrabreiten Doppelbetten, voll ausgestatteter Küche und separatem Wohnzimmer mit Sofa. Ideal für Familien oder kleine Gruppen.',
    'two-bed-deluxe-price': 'BAM 262',
    'modal-two-bedroom-deluxe-title': 'Deluxe-Apartment mit zwei Schlafzimmern',
    'modal-two-bedroom-deluxe-desc': 'Gesamte Wohnung • 65 m²\n\nGeräumiges Deluxe-Apartment mit zwei Schlafzimmern, 2 extrabreiten Doppelbetten, voll ausgestatteter Küche und separatem Wohnzimmer mit Sofa.\n\nAusstattung:\n• 2 Extrabreite Doppelbetten\n• Vollständige Küche mit Herd & Ofen\n• Geräumiges Wohnzimmer mit Sofa\n• Privates Badezimmer mit Begehbarer Dusche\n• Klimaanlage\n• Flachbildschirm-TV mit Kabelkanälen\n• Kostenloses WLAN & Kostenlose Toilettenartikel\n• Stadt- & Bergblick',
    'hr-title': 'Hausregeln',
    'hr-special-requests': 'Hotel Sinan Han nimmt besondere Wünsche entgegen — im nächsten Schritt hinzufügen!',
    'hr-checkin-title': 'Check-in',
    'hr-checkin-time': 'Von 14:00 bis 00:00',
    'hr-checkin-note': 'Sie müssen die Unterkunft im Voraus über Ihre Ankunftszeit informieren.',
    'hr-checkout-title': 'Check-out',
    'hr-checkout-time': 'Von 07:00 bis 11:00',
    'hr-cancellation-title': 'Stornierung / Vorauszahlung',
    'hr-cancellation-text': 'Stornierungsrichtlinien und Vorauszahlungsbedingungen variieren je nach Unterkunftsart. Bitte geben Sie Ihren Aufenthaltszeitraum ein und prüfen Sie die Bedingungen Ihrer gewünschten Option.',
    'hr-children-title': 'Kinder und Betten',
    'hr-child-policies': 'Kinderrichtlinien',
    'hr-children-welcome': 'Kinder jeden Alters sind willkommen.',
    'hr-children-adult-charge': 'Kinder ab 7 Jahren werden in dieser Unterkunft wie Erwachsene berechnet.',
    'hr-children-under7': 'Wenn Sie mit Kindern unter 7 Jahren reisen, wählen Sie bitte einen Tarif mit angegebener Kinderbelegung, um den richtigen Preis zu zahlen.',
    'hr-cot-title': 'Richtlinien für Kinderbettchen und Zusatzbetten',
    'hr-cot-label': '0 – 3 Jahre:',
    'hr-cot-free': 'Kinderbettchen auf Anfrage — Kostenlos',
    'hr-cot-note': 'Die Anzahl der erlaubten Kinderbettchen hängt von der gewählten Option ab. Bitte prüfen Sie Ihre gewählte Option für weitere Informationen.',
    'hr-no-extra-beds': 'In dieser Unterkunft sind keine Zusatzbetten verfügbar.',
    'hr-cots-availability': 'Alle Kinderbettchen unterliegen der Verfügbarkeit.',
    'hr-age-title': 'Altersbeschränkung',
    'hr-age-text': 'Es gibt keine Altersanforderung für den Check-in.',
    'hr-pets-title': 'Haustiere',
    'hr-pets-text': 'Haustiere sind nicht erlaubt.',
    'li-title': 'Wichtige rechtliche Informationen',
    'li-arrival-title': 'Ankunftszeit',
    'li-arrival-text': 'Bitte informieren Sie Hotel Sinan Han im Voraus über Ihre voraussichtliche Ankunftszeit. Sie können das Feld für besondere Wünsche bei der Buchung verwenden oder die Unterkunft direkt über die in Ihrer Bestätigung angegebenen Kontaktdaten kontaktieren.',
    'li-health-title': 'Gesundheit & Sicherheit',
    'li-health-text': 'Als Reaktion auf das Coronavirus (COVID-19) gelten in dieser Unterkunft zusätzliche Sicherheits- und Hygienevorschriften.',
    'footer-registration': 'Gewerbeanmeldung',
    'reg-title': 'Gewerbeklassifizierungs-Bekanntmachung',
    'reg-country': 'BOSNIEN UND HERZEGOWINA',
    'reg-entity': 'FEDERATION BOSNIEN UND HERZEGOWINA',
    'reg-institute': 'BUNDESSTATISTIKAMT SARAJEVO',
    'reg-dept': 'STATISTIKDIENST FÜR DAS GEBIET DES KANTONS HERZEGOWINA-NERETVA MOSTAR',
    'reg-number-label': 'Nummer:',
    'reg-date-label': 'Datum:',
    'reg-law-basis': 'Gemäß Artikel 7, Absatz (1) und Artikel 11 des Gesetzes über die Klassifikation von Tätigkeiten in der Föderation BiH (Amtsblatt der FBiH, Nr. 64/07 und 80/11) wird folgendes ausgegeben:',
    'reg-notice-title': 'BEKANNTMACHUNG ÜBER DIE KLASSIFIZIERUNG DES UNTERNEHMENS NACH DER TÄTIGKEITSKLASSIFIKATION',
    'reg-name-label': 'Unternehmensname:',
    'reg-name-value': 'Unterkunft im Haushalt "SINAN-HAN", Inhaber Arif Jašari',
    'reg-address-label': 'Eingetragene Adresse:',
    'reg-id-label': 'ID-Nummer:',
    'reg-code-label': 'Tätigkeitscode (KD BiH 2010):',
    'reg-activity-label': 'Tätigkeitsbezeichnung:',
    'reg-activity-value': 'Ferienunterkünfte und ähnliche Objekte für Kurzaufenthalte',
    'reg-explanation-title': 'Begründung:',
    'reg-explanation-p1': 'Im auf Antrag der Partei bzw. von Amts wegen durchgeführten Verfahren wurde festgestellt, dass die Voraussetzungen aus Artikel 9 und 11 des Gesetzes über die Klassifizierung der Tätigkeiten in der Föderation Bosnien und Herzegowina für die Ausstellung dieser Mitteilung erfüllt sind.',
    'reg-explanation-p2': 'Wenn das Unternehmen der Meinung ist, dass es falsch eingestuft wurde, hat es das Recht, innerhalb von 15 Tagen nach Erhalt dieser Mitteilung beim Institut einen Antrag auf Neuklassifizierung mit den erforderlichen Unterlagen einzureichen.',
    'reg-authority-title': 'IM AUFTRAG DES DIREKTORS, ABTEILUNGSLEITER'
  },
  fr: {
    'nav-home': 'Accueil',
    'nav-rooms': 'Chambres',
    'nav-amenities': 'Équipements',
    'nav-reviews': 'Avis',
    'nav-contact': 'Contact',
    'hotel-name': 'Sinan Han',
    'hero-subtitle': 'Où la Tradition Rencontre le Confort Moderne',
    'reserve-btn': 'Réserver Maintenant',
    'book-btn': 'Réserver Maintenant',
    'about-title': 'Bienvenue à l\'Hôtel Sinan Han — Où l\'Héritage Rencontre le Confort',
    'about-p1': 'Idéalement situé au cœur de Mostar, à seulement 100 mètres du célèbre Pont de Mostar, l\'Hôtel Sinan Han offre un mélange parfait de tradition, d\'élégance et d\'hospitalité moderne.',
    'about-p2': 'En juillet 2025, nous avons fièrement élargi notre établissement avec 8 nouvelles unités de luxe, proposant une sélection de chambres doubles, chambres triples et appartements studios. Conçues avec confort et style, chaque unité offre un séjour haut de gamme pour les couples, les familles, les voyageurs solitaires et les petits groupes.',
    'about-p3': 'Les clients sont invités à se détendre sur notre terrasse sur le toit, qui offre une vue panoramique sur le paysage historique de Mostar. Le Wi-Fi haut débit gratuit est disponible dans tout l\'hôtel. Un parking privé sur place est disponible (supplément applicable), et pour les clients voyageant à moto, nous offrons un parking sécurisé pour motos gratuit.',
    'about-p4': 'Toutes les chambres sont entièrement climatisées et disposent de salles de bains privées. Certaines chambres offrent des vues spectaculaires sur les montagnes environnantes ou la ville. Chaque unité est équipée d\'une Smart TV avec chaînes satellites, offrant un accès aux services de streaming. Les unités récemment ajoutées disposent également d\'une cuisine entièrement équipée, idéale pour les clients souhaitant plus d\'indépendance et de commodité pendant leur séjour.',
    'about-p5': 'Notre équipe de réception est disponible pour vous aider avec des excursions personnalisées et des visites guidées à travers l\'Herzégovine, vous aidant à découvrir sa culture riche, sa beauté naturelle et ses joyaux cachés.',
    'about-p6': 'Les points d\'intérêt populaires à distance de marche incluent la Maison Muslibegović (900 mètres) et le Vieux Bazar Kujundžiluk (100 mètres). Les aéroports les plus proches sont l\'Aéroport International de Mostar et l\'Aéroport International de Sarajevo (110 km). Les transferts aéroportuaires peuvent être organisés sur demande (des frais supplémentaires s\'appliquent).',
    'rooms-title': 'Nos Chambres',
    'rooms-subtitle': 'Découvrez notre collection d\'hébergements confortables et élégants',
    'view-details': 'Voir les Détails',
    'per-night': 'par nuit',
    'book-now': 'Réserver Maintenant',
    'most-popular': 'Plus Populaire',
    'std-dbl-name': 'Chambre Double Standard',
    'std-dbl-desc': 'Chambre • 18 m²',
    'std-dbl-feat1': '1 Grand Lit Double',
    'std-dbl-feat2': 'Télévision Écran Plat',
    'std-dbl-feat3': 'Terrasse avec Vue sur la Ville',
    'std-dbl-highlights': 'Cette chambre double climatisée comprend une télévision écran plat avec chaînes câblées, une salle de bains privée ainsi qu\'une terrasse avec vue sur la ville. Articles de toilette gratuits inclus.',
    'std-dbl-price': 'BAM 138,86',
    'sup-suite-name': 'Suite Supérieure',
    'sup-suite-desc': 'Appartement entier • 45 m²',
    'sup-suite-feat1': '1 Très Grand Lit Double + Canapé-Lit',
    'sup-suite-feat2': 'Cuisine Complète',
    'sup-suite-feat3': 'Télévision Écran Plat',
    'sup-suite-highlights': 'Disposant d\'une entrée privée, cet appartement climatisé comprend 1 salon, 1 chambre séparée et 1 salle de bains avec douche à l\'italienne et bidet. Dans la cuisine bien équipée, les clients trouveront une cuisinière, un réfrigérateur, des ustensiles de cuisine et un four. Avec une terrasse avec vue sur le jardin, cet appartement dispose également de murs insonorisés et d\'une télévision écran plat avec chaînes câblées.',
    'sup-suite-price': 'BAM 177,98',
    'dbl-terrace-name': 'Chambre Double avec Terrasse',
    'dbl-terrace-desc': 'Chambre • 18 m²',
    'dbl-terrace-feat1': '1 Grand Lit Double',
    'dbl-terrace-feat2': 'Terrasse avec Vue sur les Montagnes',
    'dbl-terrace-feat3': 'Smart TV',
    'dbl-terrace-highlights': 'Cette chambre double climatisée comprend une télévision écran plat avec chaînes câblées, une salle de bains privée ainsi qu\'une terrasse avec vue sur les montagnes.',
    'dbl-terrace-price': 'BAM 159,86',
    'std-queen-name': 'Chambre Queen Standard',
    'std-queen-desc': 'Chambre • 24 m²',
    'std-queen-feat1': '1 Très Grand Lit Double',
    'std-queen-feat2': 'Vue sur le Jardin',
    'std-queen-feat3': 'Télévision Écran Plat',
    'std-queen-highlights': 'Cette chambre double propose des articles de toilette gratuits et une salle de bains privée avec douche à l\'italienne et bidet. Dispose de murs insonorisés et d\'un minibar.',
    'std-queen-price': 'BAM 165,00',
    'sup-apt-name': 'Appartement Supérieur',
    'sup-apt-desc': 'Appartement entier • 45 m²',
    'sup-apt-feat1': '1 Très Grand Lit Double + Canapé-Lit',
    'sup-apt-feat2': 'Cuisine Complète',
    'sup-apt-feat3': 'Télévision Écran Plat',
    'sup-apt-highlights': 'Disposant d\'une entrée privée, cet appartement climatisé comprend 1 salon, 1 chambre séparée et 1 salle de bains avec douche à l\'italienne et bidet. Dans la cuisine bien équipée, les clients trouveront une cuisinière, un réfrigérateur, des ustensiles de cuisine et un four. Avec une terrasse avec vue sur le jardin, cet appartement dispose également de murs insonorisés et d\'une télévision écran plat avec chaînes câblées.',
    'sup-apt-price': 'BAM 185,00',
    'deluxe-name': 'Suite Deluxe',
    'deluxe-desc': 'Chambre • 29 m²',
    'deluxe-feat1': '1 Canapé-Lit + 1 Grand Lit Double',
    'deluxe-feat2': 'Vue sur les Montagnes & la Ville',
    'deluxe-feat3': 'Télévision Écran Plat',
    'deluxe-highlights': 'Cette luxueuse suite deluxe à l\'étage supérieur dispose de 1 canapé-lit et 1 grand lit double avec lit bébé gratuit sur demande. Chambre climatisée avec véranda, salle de bains attenante, terrasse, cafetière, minibar et Wi-Fi gratuit. Avec vue sur les montagnes, les points de repère, la ville et la rivière. Coffre-fort pour les objets de valeur, literie hypoallergénique, entrée privée avec isolation phonique.',
    'deluxe-price': 'BAM 195,00',
    'amenities-title': 'Équipements de Classe Mondiale',
    'amenities-subtitle': 'Le confort rencontre l\'héritage authentique',
    'amenity-wifi-title': 'Wi-Fi Gratuit',
    'amenity-wifi-desc': 'Internet haut débit partout',
    'amenity-restaurant-title': 'Restaurant',
    'amenity-restaurant-desc': 'Cuisine bosniaque authentique',
    'amenity-service-title': 'Service 24/7',
    'amenity-service-desc': 'Assistance conciergerie dédiée',
    'amenity-wellness-title': 'Bien-être',
    'amenity-wellness-desc': 'Services de spa et massage',
    'amenity-business-title': 'Centre Affaires',
    'amenity-business-desc': 'Installations de bureau complètes',
    'amenity-security-title': 'Sécurité',
    'amenity-security-desc': 'Coffres-forts pour objets de valeur',
    'reviews-title': 'Avis des Clients',
    'reviews-subtitle': 'Découvrez les avis de nos clients satisfaits',
    'rating-label': 'Excellent',
    'rating-count': 'Évalué par 847 clients',
    'booking-title': 'Vérifier la Disponibilité',
    'booking-subtitle': 'Trouvez vos dates parfaites et réservez facilement',
    'form-name-label': 'Nom du Client',
    'form-email-label': 'Email',
    'form-checkin-label': 'Arrivée',
    'form-checkout-label': 'Départ',
    'form-room-label': 'Type de Chambre',
    'form-guests-label': 'Nombre de Clients',
    'form-currency-label': 'Devise',
    'price-room-label': 'Chambre:',
    'price-nights-label': 'Nuits:',
    'price-per-night-label': 'Total par nuit:',
    'price-total-label': 'Total:',
    'complete-booking-btn': 'Finaliser la Réservation',
    'contact-title': 'Nous Contacter',
    'contact-address-label': 'Adresse',
    'contact-phone-label': 'Téléphone',
    'contact-email-label': 'Email',
    'contact-location-label': 'Localisation',
    'contact-location-text': 'À seulement 100 mètres du célèbre Pont de Mostar',
    'maps-btn': 'Voir sur Google Maps',
    'footer-about-title': 'À Propos de Sinan Han',
    'footer-about-desc': 'Un hôtel de charme parfaitement préservé offrant un héritage authentique et le confort moderne au cœur de Mostar.',
    'footer-links-title': 'Liens Rapides',
    'footer-home': 'Accueil',
    'footer-rooms': 'Chambres',
    'footer-amenities': 'Équipements',
    'footer-reviews': 'Avis',
    'footer-policies-title': 'Politiques',
    'footer-privacy': 'Politique de Confidentialité',
    'footer-terms': 'Termes et Conditions',
    'footer-cancellation': 'Politique d\'Annulation',
    'footer-house-rules': 'Règles de la Maison',
    'footer-important-info': 'Informations Légales Importantes',
    'footer-guest-reviews': 'Avis des Clients',
    'footer-follow-title': 'Nous Suivre',
    'footer-copyright': '© 2026 Sinan Han. Tous droits réservés. | Conçu avec ♥ pour les voyageurs',
    'footer-house-rules-title': 'Voir nos règles de la maison et politiques sur Booking.com',
    'footer-important-info-title': 'Voir les informations juridiques importantes sur Booking.com',
    'footer-guest-reviews-title': 'Lire les avis des clients sur Booking.com',
    'footer-registration-title': 'Voir le document officiel d\'immatriculation de l\'entreprise',
    'modal-book-btn': 'Réserver Cette Chambre',
    'review-1-text': '"Merci beaucoup de m\'avoir accueilli late check-in et pour la merveilleuse aide de votre personnel de réception, particulièrement pour quelqu\'un comme moi qui a tendance à oublier les choses. L\'emplacement était très pratique et l\'endroit était propre et bien entretenu. Bien que mon séjour était court, c\'était très confortable et agréable. La prochaine fois que je visite Mostar, j\'aimerais rester ici. Merci encore pour votre gentillesse."',
    'review-1-author': 'Takako',
    'review-1-location': 'Japon • Deluxe Suite • Février 2026',
    'review-2-text': '"La propreté était vraiment exceptionnelle – tout était absolument impeccable. Nous avons gracieusement reçu une mise à niveau gratuite qui a rendu notre séjour encore plus agréable. La chambre était spacieuse, moderne et semblait flambant neuve. Un grand merci à la charmante dame à la réception – elle était incroyablement accueillante et utile! Dans l\'ensemble, une expérience merveilleuse."',
    'review-2-author': 'Ivan',
    'review-2-location': 'Monténégro • Deluxe Suite • Décembre 2025',
    'review-3-text': '"Propreté, emplacement, attention aux détails en tout. Appartement nouvellement construit, appareils neufs. Ardijan & Lovedrim ont dépassé les attentes avec leur attitude exceptionnelle et leur service – ils ont fait plus que le nécessaire. Le personnel fait vraiment des efforts supplémentaires pour rendre votre séjour parfait."',
    'review-3-author': 'Munsoor',
    'review-3-location': 'Royaume-Uni • Deluxe Suite • Décembre 2025',
    'modal-standard-double-title': 'Chambre Double Standard',
    'modal-standard-double-desc': 'Chambre • 18 m²\n\nCette chambre double climatisée comprend une télévision écran plat avec chaînes câblées, une salle de bains privée ainsi qu\'une terrasse avec vue sur la ville. Articles de toilette gratuits inclus.\n\nÉquipements:\n• 1 Grand Lit Double\n• Télévision Écran Plat\n• Terrasse avec Vue sur la Ville\n• Climatisation\n• Salle de Bains Privée',
    'modal-superior-suite-title': 'Suite Supérieure',
    'modal-superior-suite-desc': 'Appartement entier • 45 m²\n\nDisposant d\'une entrée privée, cet appartement climatisé comprend 1 salon, 1 chambre séparée et 1 salle de bains avec douche à l\'italienne et bidet. Dans la cuisine bien équipée, les clients trouveront une cuisinière, un réfrigérateur, des ustensiles de cuisine et un four. Avec une terrasse avec vue sur le jardin, cet appartement dispose également de murs insonorisés et d\'une télévision écran plat avec chaînes câblées.\n\nÉquipements:\n• 1 Très Grand Lit Double + Canapé-Lit\n• Cuisine Complète\n• Télévision Écran Plat\n• Murs Insonorisés\n• Terrasse avec Vue sur le Jardin',
    'modal-double-terrace-title': 'Chambre Double avec Terrasse',
    'modal-double-terrace-desc': 'Chambre • 18 m²\n\nCette chambre double climatisée comprend une télévision écran plat avec chaînes câblées, une salle de bains privée ainsi qu\'une terrasse avec vue sur les montagnes.\n\nÉquipements:\n• 1 Grand Lit Double\n• Terrasse avec Vue sur les Montagnes\n• Smart TV\n• Climatisation\n• Salle de Bains Privée',
    'modal-standard-queen-title': 'Chambre Queen Standard',
    'modal-standard-queen-desc': 'Chambre • 24 m²\n\nCette chambre double propose des articles de toilette gratuits et une salle de bains privée avec douche à l\'italienne et bidet. Dispose de murs insonorisés et d\'un minibar.\n\nÉquipements:\n• 1 Très Grand Lit Double\n• Vue sur le Jardin\n• Télévision Écran Plat\n• Murs Insonorisés\n• Minibar',
    'modal-superior-apartment-title': 'Appartement Supérieur',
    'modal-superior-apartment-desc': 'Appartement entier • 45 m²\n\nDisposant d\'une entrée privée, cet appartement climatisé comprend 1 salon, 1 chambre séparée et 1 salle de bains avec douche à l\'italienne et bidet. Dans la cuisine bien équipée, les clients trouveront une cuisinière, un réfrigérateur, des ustensiles de cuisine et un four. Avec une terrasse avec vue sur le jardin, cet appartement dispose également de murs insonorisés et d\'une télévision écran plat avec chaînes câblées. L\'unité a 2 lits.\n\nÉquipements:\n• 1 Très Grand Lit Double + Canapé-Lit\n• Cuisine Complète avec Cuisinière & Four\n• Cafetière & Minibar\n• Télévision Écran Plat avec Chaînes Câblées\n• Murs Insonorisés\n• Douche à l\'Italienne avec Bidet\n• Terrasse avec Vue sur le Jardin, les Montagnes & la Ville\n• Climatisation\n• Wi-Fi Gratuit',
    'modal-deluxe-suite-title': 'Suite Deluxe',
    'modal-deluxe-suite-desc': 'Chambre à l\'étage supérieur • 29 m²\n\nIl n\'en reste que 1! Cette luxueuse suite deluxe dispose d\'un canapé-lit et d\'un grand lit double avec lit bébé gratuit sur demande. Située à un étage supérieur avec une vue magnifique.\n\nÉquipements:\n• 1 Canapé-Lit + 1 Grand Lit Double\n• Vue sur les Montagnes, les Monuments, la Ville et la Rivière\n• Vue sur la Cour Intérieure\n• Climatisation\n• Terrasse et Patio\n• Salle de Bains Privée avec Baignoire ou Douche\n• Télévision Écran Plat avec Chaînes Satellite\n• Insonorisation\n• Cafetière & Minibar\n• Wi-Fi Gratuit & Articles de Toilette Gratuits\n• Coffre-Fort\n• Literie Hypoallergénique\n• Sèche-Cheveux, Fer à Repasser & Théière/Cafetière\n• Entrée Privée\n• Dressing & Armoire\n• Coin Salon avec Canapé-Lit',
    'pricing-label': 'Prix des Chambres',
    'guests-label': 'Clients',
    'room-price-label': 'Prix de la Chambre',
    'tax-label': 'Taxe',
    'total-label': 'Total',
    'per-night-label': 'Par Nuit',
    'standard-double-pricing': 'Chambre Double Standard - 2 Clients: BAM 198 | EUR 101 | Taxe: BAM 8 | EUR 4 | Total: BAM 206 | EUR 105',
    'superior-suite-pricing': 'Suite Supérieure - 2 Clients: BAM 226 | EUR 116 | Taxe: BAM 8 | EUR 4 | Total: BAM 234 | EUR 120 | 3 Clients: BAM 253 | EUR 129 | Taxe: BAM 12 | EUR 6 | Total: BAM 265 | EUR 135',
    'deluxe-suite-pricing': 'Suite Deluxe - 2 Clients: BAM 226 | EUR 116 | Taxe: BAM 8 | EUR 4 | Total: BAM 234 | EUR 120 | 3 Clients: BAM 253 | EUR 129 | Taxe: BAM 12 | EUR 6 | Total: BAM 265 | EUR 135',
    'double-terrace-pricing': 'Chambre Double avec Terrasse - 1 Client: BAM 214 | EUR 109 | Taxe: BAM 4 | EUR 2 | Total: BAM 218 | EUR 111 | 2 Clients: BAM 251 | EUR 128 | Taxe: BAM 8 | EUR 4 | Total: BAM 259 | EUR 132',
    'standard-queen-pricing': 'Chambre Queen Standard - 1 Client: BAM 362 | EUR 185 | Taxe: BAM 4 | EUR 2 | Total: BAM 366 | EUR 187 | 2 Clients: BAM 234 | EUR 120 | Taxe: BAM 8 | EUR 4 | Total: BAM 242 | EUR 124',
    'superior-apartment-pricing': 'Appartement Supérieur - 2 Clients: BAM 306 | EUR 156 | Taxe: BAM 8 | EUR 4 | Total: BAM 314 | EUR 160 | 3 Clients: BAM 334 | EUR 171 | Taxe: BAM 12 | EUR 6 | Total: BAM 346 | EUR 177',
    'house-rules': 'Règles de la Maison & Politiques',
    'two-bed-deluxe-name': 'Appartement Deluxe Deux Chambres',
    'two-bed-deluxe-desc': 'Appartement entier • 65 m²',
    'two-bed-deluxe-feat1': '2 Très Grands Lits Doubles',
    'two-bed-deluxe-feat2': 'Cuisine Entièrement Équipée',
    'two-bed-deluxe-feat3': 'Grand Salon',
    'two-bed-deluxe-highlights': 'Spacieux appartement deluxe deux chambres avec 2 très grands lits doubles, une cuisine entièrement équipée, un salon séparé avec canapé et une salle de bains privée avec douche à l\'italienne. Idéal pour les familles ou les petits groupes.',
    'two-bed-deluxe-price': 'BAM 262',
    'modal-two-bedroom-deluxe-title': 'Appartement Deluxe Deux Chambres',
    'modal-two-bedroom-deluxe-desc': 'Appartement entier • 65 m²\n\nSpacieux appartement deluxe deux chambres avec 2 très grands lits doubles, une cuisine entièrement équipée, et un salon séparé avec canapé.\n\nÉquipements:\n• 2 Très Grands Lits Doubles\n• Cuisine Complète avec Cuisinière & Four\n• Grand Salon avec Canapé\n• Salle de Bains Privée avec Douche à l\'Italienne\n• Climatisation\n• Télévision Écran Plat avec Chaînes Câblées\n• Wi-Fi Gratuit & Articles de Toilette Gratuits\n• Vue sur la Ville & les Montagnes',
    'hr-title': 'Règles de la Maison',
    'hr-special-requests': 'L\'Hôtel Sinan Han accepte les demandes spéciales — ajoutez-les à l\'étape suivante !',
    'hr-checkin-title': 'Arrivée',
    'hr-checkin-time': 'De 14h00 à 00h00',
    'hr-checkin-note': 'Vous devrez informer l\'établissement à l\'avance de votre heure d\'arrivée.',
    'hr-checkout-title': 'Départ',
    'hr-checkout-time': 'De 07h00 à 11h00',
    'hr-cancellation-title': 'Annulation / Prépaiement',
    'hr-cancellation-text': 'Les politiques d\'annulation et de prépaiement varient selon le type d\'hébergement. Veuillez saisir les dates de votre séjour et vérifier les conditions de l\'option souhaitée.',
    'hr-children-title': 'Enfants et Lits',
    'hr-child-policies': 'Politique enfants',
    'hr-children-welcome': 'Les enfants de tout âge sont les bienvenus.',
    'hr-children-adult-charge': 'Les enfants de 7 ans et plus seront facturés comme des adultes dans cet établissement.',
    'hr-children-under7': 'Si vous voyagez avec des enfants de moins de 7 ans, veuillez sélectionner un tarif précisant l\'occupation des enfants pour payer le bon prix.',
    'hr-cot-title': 'Politique de lit bébé et lit supplémentaire',
    'hr-cot-label': '0 – 3 ans :',
    'hr-cot-free': 'Lit bébé sur demande — Gratuit',
    'hr-cot-note': 'Le nombre de lits bébé autorisés dépend de l\'option choisie. Veuillez vérifier votre option sélectionnée pour plus d\'informations.',
    'hr-no-extra-beds': 'Il n\'y a pas de lits supplémentaires disponibles dans cet établissement.',
    'hr-cots-availability': 'Tous les lits bébé sont soumis à disponibilité.',
    'hr-age-title': 'Restriction d\'âge',
    'hr-age-text': 'Il n\'y a pas d\'exigence d\'âge pour l\'enregistrement.',
    'hr-pets-title': 'Animaux de compagnie',
    'hr-pets-text': 'Les animaux de compagnie ne sont pas autorisés.',
    'li-title': 'Informations légales importantes',
    'li-arrival-title': 'Heure d\'arrivée',
    'li-arrival-text': 'Veuillez informer l\'Hôtel Sinan Han à l\'avance de votre heure d\'arrivée prévue. Vous pouvez utiliser la boîte de demandes spéciales lors de la réservation, ou contacter l\'établissement directement avec les coordonnées fournies dans votre confirmation.',
    'li-health-title': 'Santé & Sécurité',
    'li-health-text': 'En réponse au Coronavirus (COVID-19), des mesures supplémentaires de sécurité et d\'assainissement sont en vigueur dans cet établissement.',
    'footer-registration': 'Enregistrement commercial',
    'reg-title': 'Avis de classification d\'activité',
    'reg-country': 'BOSNIE-HERZÉGOVINE',
    'reg-entity': 'FÉDÉRATION DE BOSNIE-HERZÉGOVINE',
    'reg-institute': 'INSTITUT FÉDÉRAL DE STATISTIQUE SARAJEVO',
    'reg-dept': 'SERVICE STATISTIQUE POUR LA RÉGION DU CANTON HERZÉGOVINE-NERETVA MOSTAR',
    'reg-number-label': 'Numéro :',
    'reg-date-label': 'Date :',
    'reg-law-basis': 'Conformément à l\'article 7, paragraphe (1) et à l\'article 11 de la loi sur la classification des activités dans la Fédération de BiH (Journal officiel de la FBiH, n° 64/07 et 80/11), il est délivré :',
    'reg-notice-title': 'AVIS DE CLASSIFICATION DE L\'ENTITÉ COMMERCIALE SELON LA CLASSIFICATION DES ACTIVITÉS',
    'reg-name-label': 'Nom de l\'entreprise :',
    'reg-name-value': 'Hébergement chez l\'habitant "SINAN-HAN", propriétaire Arif Jašari',
    'reg-address-label': 'Adresse enregistrée :',
    'reg-id-label': 'Numéro d\'identification :',
    'reg-code-label': 'Code d\'activité (KD BiH 2010) :',
    'reg-activity-label': 'Nom de l\'activité :',
    'reg-activity-value': 'Hébergements de vacances et autres logements de courte durée',
    'reg-explanation-title': 'Justification :',
    'reg-explanation-p1': 'Dans la procédure menée à la demande de la partie ou d\'office, il a été déterminé que les conditions des articles 9 et 11 de la loi sur la classification des activités en Fédération de Bosnie-Herzégovine sont remplies pour la délivrance du présent avis.',
    'reg-explanation-p2': 'Si l\'entité commerciale estime qu\'elle a été incorrectement classée, elle a le droit, dans les 15 jours suivant la réception du présent avis, de soumettre à cet Institut une demande de reclassification avec la documentation requise.',
    'reg-authority-title': 'PAR DÉLÉGATION DU DIRECTEUR, CHEF DE SERVICE'
  },
  it: {
    'nav-home': 'Home',
    'nav-rooms': 'Camere',
    'nav-amenities': 'Servizi',
    'nav-reviews': 'Recensioni',
    'nav-contact': 'Contatti',
    'hotel-name': 'Sinan Han',
    'hero-subtitle': 'Dove la Tradizione Incontra il Comfort Moderno',
    'reserve-btn': 'Prenota Ora',
    'book-btn': 'Prenota Ora',
    'about-title': 'Benvenuti all\'Hotel Sinan Han — Dove l\'Eredità Incontra il Comfort',
    'about-p1': 'Situato idealmente nel cuore di Mostar, a soli 100 metri dal famosissimo Ponte Antico, l\'Hotel Sinan Han offre una perfetta miscela di tradizione, eleganza e ospitalità moderna.',
    'about-p2': 'Nel luglio 2025, abbiamo orgogliosamente ampliato la nostra proprietà con 8 nuove unità di lusso, presentando una selezione di camere doppie, camere triple e appartamenti studio. Progettate con comfort e stile, ogni unità offre un soggiorno premium per coppie, famiglie, viaggiatori solitari e piccoli gruppi.',
    'about-p3': 'Gli ospiti sono invitati a rilassarsi sulla nostra terrazza sul tetto, che vanta viste panoramiche sul paesaggio storico di Mostar. Il Wi-Fi ad alta velocità è disponibile gratuitamente in tutto l\'hotel. Il parcheggio privato in loco è disponibile (supplemento applicabile), e per gli ospiti che viaggiano in moto, offriamo parcheggio sicuro per motociclette gratuito.',
    'about-p4': 'Tutte le camere sono completamente climatizzate e dispongono di bagni privati. Alcune camere offrono viste spettacolari sulle montagne circostanti o sulla città. Ogni unità è dotata di Smart TV con canali satellitari, fornendo accesso ai servizi di streaming. Le unità di recente aggiunta sono anche dotate di una cucina completamente attrezzata, ideale per gli ospiti che desiderano maggiore indipendenza e comodità durante il loro soggiorno.',
    'about-p5': 'Il nostro team di ricezione è disponibile per assistere con escursioni personalizzate e tour guidati in tutta l\'Erzegovina, aiutandovi a scoprire la sua ricca cultura, bellezza naturale e gemme nascoste.',
    'about-p6': 'I punti di interesse popolari a distanza di passeggiata includono la Casa Muslibegović (900 metri) e il Vecchio Bazar di Kujundžiluk (100 metri). L\'aeroporto più vicino è l\'Aeroporto Internazionale di Mostar e l\'Aeroporto Internazionale di Sarajevo (110 km), e i trasferimenti aeroportuali possono essere organizzati su richiesta (si applicano spese aggiuntive).',
    'rooms-title': 'Le Nostre Camere',
    'rooms-subtitle': 'Scopri la nostra collezione di alloggi confortevoli ed eleganti',
    'view-details': 'Visualizza Dettagli',
    'per-night': 'per notte',
    'book-now': 'Prenota Ora',
    'most-popular': 'Più Popolare',
    'std-dbl-name': 'Camera Doppia Standard',
    'std-dbl-desc': 'Camera • 18 m²',
    'std-dbl-feat1': '1 Letto Matrimoniale Grande',
    'std-dbl-feat2': 'TV a Schermo Piatto',
    'std-dbl-feat3': 'Terrazza con Vista sulla Città',
    'std-dbl-highlights': 'Questa camera doppia climatizzata include una TV a schermo piatto con canali via cavo, un bagno privato e una terrazza con vista sulla città. Articoli da toilette gratuiti inclusi.',
    'std-dbl-price': 'BAM 138,86',
    'sup-suite-name': 'Suite Superiore',
    'sup-suite-desc': 'Appartamento intero • 45 m²',
    'sup-suite-feat1': '1 Letto Matrimoniale Extra-Grande + Divano Letto',
    'sup-suite-feat2': 'Cucina Completa',
    'sup-suite-feat3': 'TV a Schermo Piatto',
    'sup-suite-highlights': 'Con ingresso privato, questo appartamento climatizzato dispone di 1 soggiorno, 1 camera da letto separata e 1 bagno con doccia a filo parete e bidet. Nella cucina ben attrezzata, gli ospiti troveranno un fornello, un frigorifero, stoviglie e un forno. Con una terrazza con vista sul giardino, questo appartamento presenta anche pareti insonorizzate e una TV a schermo piatto con canali via cavo.',
    'sup-suite-price': 'BAM 177,98',
    'dbl-terrace-name': 'Camera Doppia con Terrazza',
    'dbl-terrace-desc': 'Camera • 18 m²',
    'dbl-terrace-feat1': '1 Letto Matrimoniale Grande',
    'dbl-terrace-feat2': 'Terrazza con Vista sulle Montagne',
    'dbl-terrace-feat3': 'Smart TV',
    'dbl-terrace-highlights': 'Questa camera doppia climatizzata include una TV a schermo piatto con canali via cavo, un bagno privato e una terrazza con vista sulle montagne.',
    'dbl-terrace-price': 'BAM 159,86',
    'std-queen-name': 'Camera Queen Standard',
    'std-queen-desc': 'Camera • 24 m²',
    'std-queen-feat1': '1 Letto Matrimoniale Extra-Grande',
    'std-queen-feat2': 'Vista sul Giardino',
    'std-queen-feat3': 'TV a Schermo Piatto',
    'std-queen-highlights': 'Questa camera doppia offre articoli da toilette gratuiti e un bagno privato con doccia a filo parete e bidet. Dispone di pareti insonorizzate e un minibar.',
    'std-queen-price': 'BAM 165,00',
    'sup-apt-name': 'Appartamento Superiore',
    'sup-apt-desc': 'Appartamento intero • 45 m²',
    'sup-apt-feat1': '1 Letto Matrimoniale Extra-Grande + Divano Letto',
    'sup-apt-feat2': 'Cucina Completa',
    'sup-apt-feat3': 'TV a Schermo Piatto',
    'sup-apt-highlights': 'Con ingresso privato, questo appartamento climatizzato dispone di 1 soggiorno, 1 camera da letto separata e 1 bagno con doccia a filo parete e bidet. Nella cucina ben attrezzata, gli ospiti troveranno un fornello, un frigorifero, stoviglie e un forno. Con una terrazza con vista sul giardino, questo appartamento presenta anche pareti insonorizzate e una TV a schermo piatto con canali via cavo.',
    'sup-apt-price': 'BAM 185,00',
    'deluxe-name': 'Suite Deluxe',
    'deluxe-desc': 'Camera • 29 m²',
    'deluxe-feat1': '1 Divano Letto + 1 Letto Matrimoniale Grande',
    'deluxe-feat2': 'Vista Montagna & Città',
    'deluxe-feat3': 'TV a Schermo Piatto',
    'deluxe-highlights': 'Questa lussuosa suite deluxe al piano superiore dispone di 1 divano letto e 1 grande letto matrimoniale con culla gratuita su richiesta. Camera climatizzata con veranda, bagno privato, terrazza, macchina per il caffè, minibar e Wi-Fi gratuito. Con vista montagna, punti di riferimento, città e fiume. Cassetta di sicurezza, biancheria da letto ipoallergenica, ingresso privato con isolamento acustico.',
    'deluxe-price': 'BAM 195,00',
    'amenities-title': 'Servizi di Classe Mondiale',
    'amenities-subtitle': 'Il comfort incontra l\'eredità autentica',
    'amenity-wifi-title': 'Wi-Fi Gratuito',
    'amenity-wifi-desc': 'Internet ad alta velocità ovunque',
    'amenity-restaurant-title': 'Ristorante',
    'amenity-restaurant-desc': 'Cucina bosniaca autentica',
    'amenity-service-title': 'Servizio 24/7',
    'amenity-service-desc': 'Assistenza concierge dedicata',
    'amenity-wellness-title': 'Benessere',
    'amenity-wellness-desc': 'Servizi di spa e massaggio',
    'amenity-business-title': 'Business Center',
    'amenity-business-desc': 'Strutture complete per uffici',
    'amenity-security-title': 'Sicurezza',
    'amenity-security-desc': 'Cassette di sicurezza',
    'reviews-title': 'Recensioni degli Ospiti',
    'reviews-subtitle': 'Leggi le opinioni dei nostri ospiti soddisfatti',
    'rating-label': 'Eccellente',
    'rating-count': 'Valutato da 847 ospiti',
    'booking-title': 'Verifica Disponibilità',
    'booking-subtitle': 'Trova le tue date perfette e prenota con facilità',
    'form-name-label': 'Nome Ospite',
    'form-email-label': 'Email',
    'form-checkin-label': 'Check-in',
    'form-checkout-label': 'Check-out',
    'form-room-label': 'Tipo di Camera',
    'form-guests-label': 'Numero di Ospiti',
    'form-currency-label': 'Valuta',
    'price-room-label': 'Camera:',
    'price-nights-label': 'Notti:',
    'price-per-night-label': 'Totale per notte:',
    'price-total-label': 'Totale:',
    'complete-booking-btn': 'Completa Prenotazione',
    'contact-title': 'Contattaci',
    'contact-address-label': 'Indirizzo',
    'contact-phone-label': 'Telefono',
    'contact-email-label': 'Email',
    'contact-location-label': 'Posizione',
    'contact-location-text': 'A soli 100 metri dal famosissimo Ponte Antico',
    'maps-btn': 'Visualizza su Google Maps',
    'footer-about-title': 'Su Sinan Han',
    'footer-about-desc': 'Un hotel boutique perfettamente conservato che offre un\'eredità autentica e il comfort moderno nel cuore di Mostar.',
    'footer-links-title': 'Link Rapidi',
    'footer-home': 'Home',
    'footer-rooms': 'Camere',
    'footer-amenities': 'Servizi',
    'footer-reviews': 'Recensioni',
    'footer-policies-title': 'Politiche',
    'footer-privacy': 'Informativa sulla Privacy',
    'footer-terms': 'Termini e Condizioni',
    'footer-cancellation': 'Politica di Cancellazione',
    'footer-house-rules': 'Regole della Casa',
    'footer-important-info': 'Informazioni Legali Importanti',
    'footer-guest-reviews': 'Recensioni degli Ospiti',
    'footer-follow-title': 'Seguici',
    'footer-copyright': '© 2026 Sinan Han. Tutti i diritti riservati. | Progettato con ♥ per i viaggiatori',
    'footer-house-rules-title': 'Visualizza le regole della casa e le politiche su Booking.com',
    'footer-important-info-title': 'Visualizza informazioni legali importanti su Booking.com',
    'footer-guest-reviews-title': 'Leggi le recensioni degli ospiti su Booking.com',
    'footer-registration-title': 'Visualizza il documento ufficiale di registrazione dell\'attività',
    'modal-book-btn': 'Prenota Questa Camera',
    'review-1-text': '"Grazie mille per aver accomodato il mio check-in tardivo e il meraviglioso supporto dal vostro personale di reception, specialmente per qualcuno come me che tende a dimenticare le cose. La posizione era molto conveniente, e il luogo era pulito e ben mantenuto. Anche se il mio soggiorno è stato breve, è stato molto confortevole e piacevole. Quando visiterò di nuovo Mostar, starei definitivamente qui di nuovo. Grazie ancora per la vostra gentilezza."',
    'review-1-author': 'Takako',
    'review-1-location': 'Giappone • Deluxe Suite • Febbraio 2026',
    'review-2-text': '"La pulizia è stata davvero straordinaria – tutto è stato assolutamente impeccabile. Ci è stato gentilmente offerto un upgrade gratuito, che ha reso il nostro soggiorno ancora più piacevole. La camera era super spaziosa, moderna e sembrava nuovissima. Un particolare ringraziamento alla signora gentile alla reception – è stata incredibilmente accogliente e utile! Nel complesso, un\'esperienza meravigliosa."',
    'review-2-author': 'Ivan',
    'review-2-location': 'Montenegro • Deluxe Suite • Dicembre 2025',
    'review-3-text': '"Pulizia, posizione, attenzione ai dettagli in tutto. Appartamento nuovo di zecca, elettrodomestici nuovi. Ardijan & Lovedrim hanno superato le aspettative con il loro atteggiamento eccezionale e il servizio – hanno fatto tutto e ancora di più. Lo staff fa davvero uno sforzo extra per rendere il vostro soggiorno perfetto."',
    'review-3-author': 'Munsoor',
    'review-3-location': 'Regno Unito • Deluxe Suite • Dicembre 2025',
    'modal-standard-double-title': 'Camera Doppia Standard',
    'modal-standard-double-desc': 'Camera • 18 m²\n\nQuesta camera doppia climatizzata include una TV a schermo piatto con canali via cavo, un bagno privato e una terrazza con vista sulla città. Articoli da toilette gratuiti inclusi.\n\nServizi:\n• 1 Letto Matrimoniale Grande\n• TV a Schermo Piatto\n• Terrazza con Vista sulla Città\n• Aria Condizionata\n• Bagno Privato',
    'modal-superior-suite-title': 'Suite Superiore',
    'modal-superior-suite-desc': 'Appartamento intero • 45 m²\n\nCon ingresso privato, questo appartamento climatizzato dispone di 1 soggiorno, 1 camera da letto separata e 1 bagno con doccia a filo parete e bidet. Nella cucina ben attrezzata, gli ospiti troveranno un fornello, un frigorifero, stoviglie e un forno. Con una terrazza con vista sul giardino, questo appartamento presenta anche pareti insonorizzate e una TV a schermo piatto con canali via cavo.\n\nServizi:\n• 1 Letto Matrimoniale Extra-Grande + Divano Letto\n• Cucina Completa\n• TV a Schermo Piatto\n• Pareti Insonorizzate\n• Terrazza con Vista sul Giardino',
    'modal-double-terrace-title': 'Camera Doppia con Terrazza',
    'modal-double-terrace-desc': 'Camera • 18 m²\n\nQuesta camera doppia climatizzata include una TV a schermo piatto con canali via cavo, un bagno privato e una terrazza con vista sulle montagne.\n\nServizi:\n• 1 Letto Matrimoniale Grande\n• Terrazza con Vista sulle Montagne\n• Smart TV\n• Aria Condizionata\n• Bagno Privato',
    'modal-standard-queen-title': 'Camera Queen Standard',
    'modal-standard-queen-desc': 'Camera • 24 m²\n\nQuesta camera doppia offre articoli da toilette gratuiti e un bagno privato con doccia a filo parete e bidet. Dispone di pareti insonorizzate e un minibar.\n\nServizi:\n• 1 Letto Matrimoniale Extra-Grande\n• Vista sul Giardino\n• TV a Schermo Piatto\n• Pareti Insonorizzate\n• Minibar',
    'modal-superior-apartment-title': 'Appartamento Superiore',
    'modal-superior-apartment-desc': 'Appartamento intero • 45 m²\n\nCon ingresso privato, questo appartamento climatizzato dispone di 1 soggiorno, 1 camera da letto separata e 1 bagno con doccia a filo parete e bidet. Nella cucina ben attrezzata, gli ospiti troveranno un fornello, un frigorifero, stoviglie e un forno. Con una terrazza con vista sul giardino, questo appartamento presenta anche pareti insonorizzate e una TV a schermo piatto con canali via cavo. L\'unità ha 2 letti.\n\nServizi:\n• 1 Letto Matrimoniale Extra-Grande + Divano Letto\n• Cucina Completa con Fornello & Forno\n• Macchina da Caffè & Minibar\n• TV a Schermo Piatto con Canali via Cavo\n• Pareti Insonorizzate\n• Doccia a Filo Parete con Bidet\n• Terrazza con Vista su Giardino, Montagne & Città\n• Aria Condizionata\n• WiFi Gratuito',
    'modal-deluxe-suite-title': 'Suite Deluxe',
    'modal-deluxe-suite-desc': 'Camera al Piano Superiore • 29 m²\n\nNe rimane solo 1! Questa lussuosa suite deluxe dispone di un divano letto e un grande letto matrimoniale con lettino gratuito su richiesta. Situata a un piano superiore con vista splendida.\n\nServizi:\n• 1 Divano Letto + 1 Grande Letto Matrimoniale\n• Vista su Montagne, Monumenti, Città e Fiume\n• Vista sulla Corte Interna\n• Aria Condizionata\n• Terrazza e Patio\n• Bagno Privato con Vasca o Doccia\n• TV a Schermo Piatto con Canali Satellite\n• Insonorizzazione\n• Macchina da Caffè & Minibar\n• WiFi Gratuito & Articoli da Toilette Gratuiti\n• Cassetta di Sicurezza\n• Biancheria Ipoallergenica\n• Asciugacapelli, Ferro da Stiro & Bollitore/Macchina da Caffè\n• Ingresso Privato\n• Spogliatoio & Armadio\n• Zona Salotto con Divano Letto',
    'pricing-label': 'Prezzi delle Camere',
    'guests-label': 'Ospiti',
    'room-price-label': 'Prezzo della Camera',
    'tax-label': 'Tassa',
    'total-label': 'Totale',
    'per-night-label': 'Per Notte',
    'standard-double-pricing': 'Camera Doppia Standard - 2 Ospiti: BAM 198 | EUR 101 | Tassa: BAM 8 | EUR 4 | Totale: BAM 206 | EUR 105',
    'superior-suite-pricing': 'Suite Superiore - 2 Ospiti: BAM 226 | EUR 116 | Tassa: BAM 8 | EUR 4 | Totale: BAM 234 | EUR 120 | 3 Ospiti: BAM 253 | EUR 129 | Tassa: BAM 12 | EUR 6 | Totale: BAM 265 | EUR 135',
    'deluxe-suite-pricing': 'Suite Deluxe - 2 Ospiti: BAM 226 | EUR 116 | Tassa: BAM 8 | EUR 4 | Totale: BAM 234 | EUR 120 | 3 Ospiti: BAM 253 | EUR 129 | Tassa: BAM 12 | EUR 6 | Totale: BAM 265 | EUR 135',
    'double-terrace-pricing': 'Camera Doppia con Terrazza - 1 Ospite: BAM 214 | EUR 109 | Tassa: BAM 4 | EUR 2 | Totale: BAM 218 | EUR 111 | 2 Ospiti: BAM 251 | EUR 128 | Tassa: BAM 8 | EUR 4 | Totale: BAM 259 | EUR 132',
    'standard-queen-pricing': 'Camera Queen Standard - 1 Ospite: BAM 362 | EUR 185 | Tassa: BAM 4 | EUR 2 | Totale: BAM 366 | EUR 187 | 2 Ospiti: BAM 234 | EUR 120 | Tassa: BAM 8 | EUR 4 | Totale: BAM 242 | EUR 124',
    'superior-apartment-pricing': 'Appartamento Superiore - 2 Ospiti: BAM 306 | EUR 156 | Tassa: BAM 8 | EUR 4 | Totale: BAM 314 | EUR 160 | 3 Ospiti: BAM 334 | EUR 171 | Tassa: BAM 12 | EUR 6 | Totale: BAM 346 | EUR 177',
    'house-rules': 'Regole della Casa & Politiche',
    'two-bed-deluxe-name': 'Appartamento Deluxe a Due Camere',
    'two-bed-deluxe-desc': 'Intero appartamento • 65 m²',
    'two-bed-deluxe-feat1': '2 Letti Matrimoniali Extra-Grandi',
    'two-bed-deluxe-feat2': 'Cucina Completamente Attrezzata',
    'two-bed-deluxe-feat3': 'Ampio Soggiorno',
    'two-bed-deluxe-highlights': 'Spazioso appartamento deluxe a due camere con 2 letti matrimoniali extra-grandi, una cucina completamente attrezzata, un soggiorno separato con divano e un bagno privato con doccia a piatto. Ideale per famiglie o piccoli gruppi.',
    'two-bed-deluxe-price': 'BAM 262',
    'modal-two-bedroom-deluxe-title': 'Appartamento Deluxe a Due Camere',
    'modal-two-bedroom-deluxe-desc': 'Intero appartamento • 65 m²\n\nSpazioso appartamento deluxe a due camere con 2 letti matrimoniali extra-grandi, cucina completamente attrezzata e soggiorno separato con divano.\n\nServizi:\n• 2 Letti Matrimoniali Extra-Grandi\n• Cucina Completa con Piano Cottura & Forno\n• Ampio Soggiorno con Divano\n• Bagno Privato con Doccia a Piatto\n• Aria Condizionata\n• TV a Schermo Piatto con Canali via Cavo\n• Wi-Fi Gratuito & Articoli da Toeletta Gratuiti\n• Vista sulla Città & sulle Montagne',
    'hr-title': 'Regole della Casa',
    'hr-special-requests': 'L\'Hotel Sinan Han accetta richieste speciali — aggiungi al passo successivo!',
    'hr-checkin-title': 'Check-in',
    'hr-checkin-time': 'Dalle 14:00 alle 00:00',
    'hr-checkin-note': 'Dovrete informare la struttura in anticipo dell\'orario di arrivo.',
    'hr-checkout-title': 'Check-out',
    'hr-checkout-time': 'Dalle 07:00 alle 11:00',
    'hr-cancellation-title': 'Cancellazione / Prepagamento',
    'hr-cancellation-text': 'Le politiche di cancellazione e prepagamento variano in base al tipo di alloggio. Inserisci le date del tuo soggiorno e verifica le condizioni dell\'opzione scelta.',
    'hr-children-title': 'Bambini e Letti',
    'hr-child-policies': 'Politica bambini',
    'hr-children-welcome': 'I bambini di qualsiasi età sono benvenuti.',
    'hr-children-adult-charge': 'I bambini di 7 anni e oltre verranno addebitati come adulti in questa struttura.',
    'hr-children-under7': 'Se viaggiate con bambini di età inferiore a 7 anni, selezionate una tariffa con occupazione bambini specificata per pagare il prezzo corretto.',
    'hr-cot-title': 'Politica culla e letto extra',
    'hr-cot-label': '0 – 3 anni:',
    'hr-cot-free': 'Culla su richiesta — Gratuita',
    'hr-cot-note': 'Il numero di culle consentite dipende dall\'opzione scelta. Verifica l\'opzione selezionata per ulteriori informazioni.',
    'hr-no-extra-beds': 'Non ci sono letti extra disponibili in questa struttura.',
    'hr-cots-availability': 'Tutte le culle sono soggette a disponibilità.',
    'hr-age-title': 'Restrizione d\'età',
    'hr-age-text': 'Non ci sono requisiti di età per il check-in.',
    'hr-pets-title': 'Animali domestici',
    'hr-pets-text': 'Gli animali domestici non sono ammessi.',
    'li-title': 'Informazioni legali importanti',
    'li-arrival-title': 'Orario di arrivo',
    'li-arrival-text': 'Si prega di informare l\'Hotel Sinan Han in anticipo dell\'orario di arrivo previsto. È possibile utilizzare la casella delle richieste speciali durante la prenotazione, o contattare direttamente la struttura con i dati di contatto forniti nella conferma.',
    'li-health-title': 'Salute & Sicurezza',
    'li-health-text': 'In risposta al Coronavirus (COVID-19), in questa struttura sono in vigore ulteriori misure di sicurezza e igiene.',
    'footer-registration': 'Registrazione aziendale',
    'reg-title': 'Avviso di classificazione dell\'attività',
    'reg-country': 'BOSNIA ED ERZEGOVINA',
    'reg-entity': 'FEDERAZIONE DELLA BOSNIA ED ERZEGOVINA',
    'reg-institute': 'ISTITUTO FEDERALE DI STATISTICA SARAJEVO',
    'reg-dept': 'SERVIZIO STATISTICO PER LA REGIONE DEL CANTONE ERZEGOVINA-NERETVA MOSTAR',
    'reg-number-label': 'Numero:',
    'reg-date-label': 'Data:',
    'reg-law-basis': 'Ai sensi dell\'articolo 7, comma (1) e dell\'articolo 11 della Legge sulla classificazione delle attività nella Federazione di BiH (Gazzetta ufficiale della FBiH, n. 64/07 e 80/11), si rilascia:',
    'reg-notice-title': 'AVVISO DI CLASSIFICAZIONE DELL\'ENTITÀ COMMERCIALE SECONDO LA CLASSIFICAZIONE DELLE ATTIVITÀ',
    'reg-name-label': 'Ragione sociale:',
    'reg-name-value': 'Alloggio in famiglia "SINAN-HAN", proprietario Arif Jašari',
    'reg-address-label': 'Indirizzo registrato:',
    'reg-id-label': 'Numero di identificazione:',
    'reg-code-label': 'Codice attività (KD BiH 2010):',
    'reg-activity-label': 'Nome dell\'attività:',
    'reg-activity-value': 'Strutture ricettive per vacanze e alloggi simili per soggiorni brevi',
    'reg-explanation-title': 'Motivazione:',
    'reg-explanation-p1': 'Nel procedimento condotto su richiesta della parte o d\'ufficio, è stato accertato che sono soddisfatte le condizioni degli articoli 9 e 11 della legge sulla classificazione delle attività nella Federazione di Bosnia ed Erzegovina per il rilascio del presente avviso.',
    'reg-explanation-p2': 'Se il soggetto commerciale ritiene di essere stato classificato in modo errato, ha il diritto, entro 15 giorni dal ricevimento del presente avviso, di presentare all\'Istituto una richiesta di riclassificazione con la documentazione necessaria.',
    'reg-authority-title': 'PER DELEGA DEL DIRETTORE, CAPO SEZIONE'
  },
  tr: {
    'nav-home': 'Anasayfa',
    'nav-rooms': 'Odalar',
    'nav-amenities': 'Olanaklar',
    'nav-reviews': 'Yorumlar',
    'nav-contact': 'İletişim',
    'hotel-name': 'Sinan Han',
    'hero-subtitle': 'Gelenek ve Modern Konforun Buluştuğu Yer',
    'reserve-btn': 'Şimdi Rezervasyon Yap',
    'book-btn': 'Şimdi Rezervasyon Yap',
    'about-title': 'Sinan Han Otelinde Hoş Geldiniz — Miras Rahatlık ile Buluşur',
    'about-p1': 'Mostar\'ın kalbine ideal olarak konumlandırıldı, dünya ünlü Eski Köprü\'den sadece 100 metre uzakta, Sinan Han Oteli, gelenek, zarafet ve modern misafirperverliğin mükemmel bir karışımını sunar.',
    'about-p2': 'Temmuz 2025\'te, mülkümüzü 8 yepyeni lüks birim ile gururla genişlettik, çift odaları, üçlü odaları ve stüdyo daireleri seçimi sunarak. Konfor ve stil göz önünde bulundurularak tasarlanan, her birim çiftler, aileler, solo gezginler ve küçük gruplar için premium konaklama sağlar.',
    'about-p3': 'Konuklar, Mostar\'ın tarihsel şehir manzarasının panoramik manzaralarıyla övünen çatı terasında dinlenmeye davet edilir. Ücretsiz yüksek hızlı WiFi otel genelinde mevcuttur. Özel üstü otopark mevcuttur (ek ücret uygulanır) ve motosiklet ile seyahat eden konuklar için güvenli motosiklet parkı ücretsiz olarak sunulur.',
    'about-p4': 'Tüm misafir odaları tam klimalaşmış olup özel banyolara sahiptir. Seçili odalar çevredeki dağ veya şehir manzaralarını sunmaktadır. Her birim uydu kanalları olan Akıllı TV ile donatılmış olup yayın hizmetlerine erişim sağlar. Yeni eklenen birimler tam donanımlı mutfak içermekte olup, konforluluk ve rahatlık isteyenlerin konaklama sırasında teknikleri istiyorlar.',
    'about-p5': 'Resepsiyon ekibimiz Herzegovina genelinde kişisel geziler ve rehberli turlar sağlamaya yardımcı olmaya hazırdır. Böylece zengin kültürü, doğal güzelliği ve gizli mücevherleri keşfetmenize yardımcı oluruz.',
    'about-p6': 'Yürüyüş mesafesi içindeki popüler ilgi noktaları Muslibegović Evi (900 metre) ve Eski Kujundžiluk Pazarı (100 metre) içermektedir. En yakın havaalanı Mostar Uluslararası Havaalanı ve Saraybosna Uluslararası Havaalanı (110 km) olarak bulunmaktadır, havaalanı transferleri talep üzerine düzenlenebilir (ek ücret uygulanır).',
    'rooms-title': 'Odalarımız',
    'rooms-subtitle': 'Rahat ve zarif konaklama koleksiyonumuzu keşfedin',
    'view-details': 'Detayları Görüntüle',
    'per-night': 'gecelik',
    'book-now': 'Şimdi Rezervasyon Yap',
    'most-popular': 'En Popüler',
    'std-dbl-name': 'Standart Çift Kişilik Oda',
    'std-dbl-desc': 'Oda • 18 m²',
    'std-dbl-feat1': '1 Büyük Çift Yatak',
    'std-dbl-feat2': 'Düz Ekran TV',
    'std-dbl-feat3': 'Şehir Manzaralı Teras',
    'std-dbl-highlights': 'Bu klimalaşmış çift birim kablolu kanallı düz ekran TV, özel banyo ve şehir manzaralı terası içermektedir. Ücretsiz banyo ürünleri dahildir.',
    'std-dbl-price': 'BAM 138.86',
    'sup-suite-name': 'Süit Superior',
    'sup-suite-desc': 'Tam daire • 45 m²',
    'sup-suite-feat1': '1 Ekstra Büyük Çift Yatak + Kanepe Yatak',
    'sup-suite-feat2': 'Tam Mutfak',
    'sup-suite-feat3': 'Düz Ekran TV',
    'sup-suite-highlights': 'Özel girişi olan, bu klimalaşmış daire 1 oturma odası, 1 ayrı yatak odası ve yürüyüş manzarası banyo ile bidet içermektedir. İyi donatılmış mutfakta konuklar sos ocağı, buzdolabı, mutfak eşyaları ve fırın bulacaklardır. Bahçe manzaralaılı teras ile, bu daire sesöz duvarlar ve kablolu kanalları olan düz ekran TV\'ye sahiptir.',
    'sup-suite-price': 'BAM 177.98',
    'dbl-terrace-name': 'Teras ile Çift Birim',
    'dbl-terrace-desc': 'Oda • 18 m²',
    'dbl-terrace-feat1': '1 Büyük Çift Yatak',
    'dbl-terrace-feat2': 'Dağ Manzaralı Teras',
    'dbl-terrace-feat3': 'Akıllı TV',
    'dbl-terrace-highlights': 'Bu klimalaşmış çift birim kablolu kanallı düz ekran TV, özel banyo ve dağ manzaralı terası içermektedir.',
    'dbl-terrace-price': 'BAM 159.86',
    'std-queen-name': 'Standart Kraliçe Odası',
    'std-queen-desc': 'Oda • 24 m²',
    'std-queen-feat1': '1 Ekstra Büyük Çift Yatak',
    'std-queen-feat2': 'Bahçe Manzaraları',
    'std-queen-feat3': 'Düz Ekran TV',
    'std-queen-highlights': 'Ücretsiz banyo ürünleri sunan, bu çift oda yürüyüş manzarası banyo ve bidet ile özel banyo içermektedir. Sesöz duvarlar ve minibar\'a sahiptir.',
    'std-queen-price': 'BAM 165.00',
    'sup-apt-name': 'Superior Daire',
    'sup-apt-desc': 'Tam daire • 45 m²',
    'sup-apt-feat1': '1 Ekstra Büyük Çift Yatak + Kanepe Yatak',
    'sup-apt-feat2': 'Tam Mutfak',
    'sup-apt-feat3': 'Düz Ekran TV',
    'sup-apt-highlights': 'Özel girişi olan, bu klimalaşmış daire 1 oturma odası, 1 ayrı yatak odası ve yürüyüş manzarası banyo ile bidet içermektedir. İyi donatılmış mutfakta konuklar sos ocağı, buzdolabı, mutfak eşyaları ve fırın bulacaklardır. Bahçe manzaralarıyla teras ile, bu daire sesöz duvarlar ve kablolu kanalları olan düz ekran TV\'ye sahiptir. Birim 2 yat\'a sahiptir.',
    'sup-apt-price': 'BAM 185.00',
    'deluxe-name': 'Deluxe Süit',
    'deluxe-desc': 'Oda • 29 m²',
    'deluxe-feat1': '1 Kanepe Yatak + 1 Büyük Çift Yatak',
    'deluxe-feat2': 'Dağ & Şehir Manzaraları',
    'deluxe-feat3': 'Düz Ekran TV',
    'deluxe-highlights': 'Üst katlı lüks deluxe süit 1 kanepe yatak ve talep üzerine ücretsiz beşik ile 1 büyük çift yatak içermektedir. Klimalaşmış oda teras, özel banyo, teras, kahve makinesi, minibar ve ücretsiz WiFi ile. Dağ manzarası, yer işareti manzarası, şehir manzarası ve nehir manzarasını içermektedir. Güvenlik kutusu, hipoalerjenik çarşaflar, sesöz girişle özel giriş.',
    'deluxe-price': 'BAM 195.00',
    'amenities-title': 'Dünya Sınıfı Olanaklar',
    'amenities-subtitle': 'Konfor gerçek mirası buluşur',
    'amenity-wifi-title': 'Ücretsiz WiFi',
    'amenity-wifi-desc': 'Yüksek hızlı internet her yerde',
    'amenity-restaurant-title': 'Restoran',
    'amenity-restaurant-desc': 'Gerçek Bosnian mutfağı',
    'amenity-service-title': 'Gece Boyunca Hizmet',
    'amenity-service-desc': 'Adanmış concierge yardımı',
    'amenity-wellness-title': 'Wellness',
    'amenity-wellness-desc': 'Spa ve masaj hizmetleri',
    'amenity-business-title': 'İşletme Merkezi',
    'amenity-business-desc': 'Tam ofis olanakları',
    'amenity-security-title': 'Güvenlik',
    'amenity-security-desc': 'Güvenli depo kutuları',
    'reviews-title': 'Misafir Yorumları',
    'reviews-subtitle': 'Memnun misafirlerimizden dinleyin',
    'rating-label': 'Mükemmel',
    'rating-count': '847 misafir tarafından derecelendirildi',
    'booking-title': 'Uygunluğu Kontrol Edin',
    'booking-subtitle': 'Mükemmel tarihlerinizi bulun ve kolayca rezervasyon yapın',
    'form-name-label': 'Misafir Adı',
    'form-email-label': 'E-posta',
    'form-checkin-label': 'Giriş',
    'form-checkout-label': 'Çıkış',
    'form-room-label': 'Oda Türü',
    'form-guests-label': 'Misafir Sayısı',
    'form-currency-label': 'Para Birimi',
    'price-room-label': 'Oda:',
    'price-nights-label': 'Geceler:',
    'price-per-night-label': 'Gecelik toplam:',
    'price-total-label': 'Toplam:',
    'complete-booking-btn': 'Rezervasyonu Tamamla',
    'contact-title': 'İletişime Geçin',
    'contact-address-label': 'Adres',
    'contact-phone-label': 'Telefon',
    'contact-email-label': 'E-posta',
    'contact-location-label': 'Konum',
    'contact-location-text': 'Dünya ünlü Eski Köprü\'den sadece 100 metre uzakta',
    'maps-btn': 'Google Haritalar\'da Görüntüle',
    'footer-about-title': 'Sinan Han Hakkında',
    'footer-about-desc': 'Mostar\'ın kalbinde gerçek mirası ve modern konforu sunarak saklanan bir butik otel.',
    'footer-links-title': 'Hızlı Bağlantılar',
    'footer-home': 'Anasayfa',
    'footer-rooms': 'Odalar',
    'footer-amenities': 'Olanaklar',
    'footer-reviews': 'Yorumlar',
    'footer-policies-title': 'Politikalar',
    'footer-privacy': 'Gizlilik Politikası',
    'footer-terms': 'Şartlar & Koşullar',
    'footer-cancellation': 'İptal Politikası',
    'footer-house-rules': 'Ev Kuralları',
    'footer-important-info': 'Önemli Yasal Bilgiler',
    'footer-guest-reviews': 'Misafir Yorumları',
    'footer-follow-title': 'Bizi İzleyin',
    'footer-copyright': '© 2026 Sinan Han. Tüm hakları saklıdır. | Gezginler için ♥ ile tasarlandı',
    'footer-house-rules-title': 'Booking.com\'da ev kurallarımızı ve politikalarımızı görüntüleyin',
    'footer-important-info-title': 'Booking.com\'da önemli yasal bilgileri görüntüleyin',
    'footer-guest-reviews-title': 'Booking.com\'da misafir yorumlarını okuyun',
    'footer-registration-title': 'Resmi işletme kayıt belgesini görüntüleyin',
    'modal-book-btn': 'Bu Odayı Rezervasyon Yap',
    'select-room': 'Bir oda seçin',
    'currency-bam': 'BAM (Bosnian Marka)',
    'currency-eur': 'EUR (Euro)',
    'pricing-label': 'Oda Fiyatlandırması',
    'guests-label': 'Misafirler',
    'room-price-label': 'Oda Fiyatı',
    'tax-label': 'Vergi',
    'total-label': 'Toplam',
    'per-night-label': 'Gecelik',
    'standard-double-pricing': 'Standart Çift Oda - 2 Misafir: BAM 198 | EUR 101 | Vergi: BAM 8 | EUR 4 | Toplam: BAM 206 | EUR 105',
    'superior-suite-pricing': 'Süit Superior - 2 Misafir: BAM 226 | EUR 116 | Vergi: BAM 8 | EUR 4 | Toplam: BAM 234 | EUR 120 | 3 Misafir: BAM 253 | EUR 129 | Vergi: BAM 12 | EUR 6 | Toplam: BAM 265 | EUR 135',
    'deluxe-suite-pricing': 'Deluxe Süit - 2 Misafir: BAM 226 | EUR 116 | Vergi: BAM 8 | EUR 4 | Toplam: BAM 234 | EUR 120 | 3 Misafir: BAM 253 | EUR 129 | Vergi: BAM 12 | EUR 6 | Toplam: BAM 265 | EUR 135',
    'double-terrace-pricing': 'Teras ile Çift Oda - 1 Misafir: BAM 214 | EUR 109 | Vergi: BAM 4 | EUR 2 | Toplam: BAM 218 | EUR 111 | 2 Misafir: BAM 251 | EUR 128 | Vergi: BAM 8 | EUR 4 | Toplam: BAM 259 | EUR 132',
    'standard-queen-pricing': 'Standart Kraliçe Ödası - 1 Misafir: BAM 362 | EUR 185 | Vergi: BAM 4 | EUR 2 | Toplam: BAM 366 | EUR 187 | 2 Misafir: BAM 234 | EUR 120 | Vergi: BAM 8 | EUR 4 | Toplam: BAM 242 | EUR 124',
    'superior-apartment-pricing': 'Superior Daire - 2 Misafir: BAM 306 | EUR 156 | Vergi: BAM 8 | EUR 4 | Toplam: BAM 314 | EUR 160 | 3 Misafir: BAM 334 | EUR 171 | Vergi: BAM 12 | EUR 6 | Toplam: BAM 346 | EUR 177',
    'review-1-text': '"Geç kontrol işlemime uyum sağladığınız ve özellikle unuttukça biri gibi biri olan ben için ön masa personelinin harika desteği için çok teşekkür ederim. Konum çok uygundu ve yer temiz ve iyi bakımlıydı. Konumum kışa rağmen çok rahat ve hoştu. Mostar\'u tekrar ziyaret ettiğimde kesinlikle burada kalmayı isterdim. Bir kez daha nazikliğiniz için çok teşekkür ederim."',
    'review-1-author': 'Takako',
    'review-1-location': 'Japonya • Deluxe Süit • Şubat 2026',
    'review-2-text': '"Temizlik gerçekten olağanüstüydü - her şey tamamen temizdi. Nazikçe ücretsiz oda yükseltmesi verildi ve konaklamamızı daha da keyifli hale getirdi. Oda çok geniş, modern ve yepyeniydi. Ön masa\'da zarif bayana özel bir teşekkür ~ o inanılmaz derecede hoş ve yardımcıydı! Genel olarak, harika bir deneyim."',
    'review-2-author': 'Ivan',
    'review-2-location': 'Karadağ • Deluxe Süit • Aralık 2025',
    'review-3-text': '"Temizlik, konum, her şeyde ilgi detayı. Yeni daire, yeni cihazlar. Ardijan & Lovedrim istisnai tutum ve hizmet ile her şeyi ve daha fazlasını yaptı. Personel gerçekten konaklama deneyiminizi mükemmel hale getirmek için yapacaktır."',
    'review-3-author': 'Munsoor',
    'review-3-location': 'Birleşik Krallık • Deluxe Süit • Aralık 2025',
    'modal-standard-double-title': 'Standart Çift Oda',
    'modal-standard-double-desc': 'Oda • 18 m²\n\nBu klimalaşmış çift oda kablolu TV kanalları, özel banyo ve şehir manzaralı teras içermektedir. Ücretsiz banyo ürünleri dahildir.\n\nOlanaklar:\n• 1 Büyük Çift Yatak\n• Düz Ekran TV\n• Şehir Manzaralı Teras\n• Klimalandırma\n• Özel Banyo',
    'modal-superior-suite-title': 'Süit Superior',
    'modal-superior-suite-desc': 'Tam daire • 45 m²\n\nÖzel girişi olan, bu klimalaşmış daire 1 oturma odası, 1 ayrı yatak odası ve yürüyüş manzarası banyo ile bidet içermektedir. İyi donatılmış mutfakta konuklar sos ocağı, buzdolabı, mutfak eşyaları ve fırın bulacaklardır. Bahçe manzaralarıyla teras ile, bu daire sesöz duvarlar ve kablolu kanallı düz ekran TV\'ye sahiptir.\n\nOlanaklar:\n• 1 Ekstra Büyük Çift Yatak + Kanepe Yatak\n• Tam Mutfak\n• Düz Ekran TV\n• Sesöz Duvarlar\n• Bahçe Manzaralı Teras',
    'modal-double-terrace-title': 'Teras ile Çift Oda',
    'modal-double-terrace-desc': 'Oda • 18 m²\n\nBu klimalaşmış çift oda kablolu TV kanalları, özel banyo ve dağ manzaralı teras içermektedir.\n\nOlanaklar:\n• 1 Büyük Çift Yatak\n• Dağ Manzaralı Teras\n• Akıllı TV\n• Klimalandırma\n• Özel Banyo',
    'modal-standard-queen-title': 'Standart Kraliçe Odası',
    'modal-standard-queen-desc': 'Oda • 24 m²\n\nÜcretsiz banyo ürünleri sunan, bu çift oda yürüyüş manzarası banyo ve bidet ile özel banyo içermektedir. Sesöz duvarlar ve minibar\'a sahiptir.\n\nOlanaklar:\n• 1 Ekstra Büyük Çift Yatak\n• Bahçe Manzaraları\n• Düz Ekran TV\n• Sesöz Duvarlar\n• Minibar',
    'modal-superior-apartment-title': 'Superior Daire',
    'modal-superior-apartment-desc': 'Tam daire • 45 m²\n\nÖzel girişi olan, bu klimalaşmış daire 1 oturma odası, 1 ayrı yatak odası ve yürüyüş manzarası banyo ile bidet içermektedir. İyi donatılmış mutfakta konuklar sos ocağı, buzdolabı, mutfak eşyaları ve fırın bulacaklardır. Bahçe manzaralarıyla teras ile, bu daire sesöz duvarlar ve kablolu kanalları olan düz ekran TV\'ye sahiptir. Birim 2 yat\'a sahiptir.\n\nOlanaklar:\n• 1 Ekstra Büyük Çift Yatak + Kanepe Yatak\n• Sos Ocağı & Fırınlı Tam Mutfak\n• Kahve Makinesi & Minibar\n• Kablolu Kanallarla Düz Ekran TV\n• Sesöz Duvarlar\n• Bidetli Yürüyüş Manzarası Banyo\n• Bahçe, Dağ & Şehir Manzaralarıyla Teras\n• Klimalandırma\n• Ücretsiz WiFi',
    'modal-deluxe-suite-title': 'Deluxe Süit',
    'modal-deluxe-suite-desc': 'Üst Kat Odası • 29 m²\n\n1 kaldı! Bu lüks deluxe süit 1 kanepe yatak ve talep üzerine ücretsiz beşik ile 1 büyük çift yatak içermektedir. Üst katta konumlandırılmış, inanılmaz manzaralarla.\n\nOlanaklar:\n• 1 Kanepe Yatak + 1 Büyük Çift Yatak\n• Dağ Manzarası, Yer İşareti Manzarası, Şehir Manzarası, Nehir Manzarası\n• İç Avlu Manzarası\n• Klimalandırma\n• Teras & Teras\n• Banyo veya Duş İçeren Özel Banyo\n• Uydu Kanallarıyla Düz Ekran TV\n• Ses Geçirmez\n• Kahve Makinesi & Minibar\n• Ücretsiz WiFi & Ücretsiz Banyo Ürünleri\n• Güvenlik Kutusu\n• Hipoalerjenik Çarşaflar\n• Saç Kurutma Makinesi, İtfaiye & Çay/Kahve Makinesi\n• Özel Giriş\n• Giyinme Odası & Gardrop\n• Kanepe Yatak ile Oturma Alanı',
    'house-rules': 'Ev Kuralları & Politikalar',
    'two-bed-deluxe-name': 'İki Yatak Odalı Deluxe Daire',
    'two-bed-deluxe-desc': 'Tüm daire • 65 m²',
    'two-bed-deluxe-feat1': '2 Ekstra Büyük Çift Kişilik Yatak',
    'two-bed-deluxe-feat2': 'Tam Donanımlı Mutfak',
    'two-bed-deluxe-feat3': 'Geniş Oturma Odası',
    'two-bed-deluxe-highlights': 'İki ayrı yatak odalı deluxe daire; 2 ekstra büyük çift kişilik yatak, tam donanımlı mutfak, kanepeli ayrı oturma odası ve yürüyüş duşlu özel banyosu ile ailelere ve küçük gruplara idealdir.',
    'two-bed-deluxe-price': 'BAM 262',
    'modal-two-bedroom-deluxe-title': 'İki Yatak Odalı Deluxe Daire',
    'modal-two-bedroom-deluxe-desc': 'Tüm daire • 65 m²\n\nİki ayrı yatak odalı deluxe daire; 2 ekstra büyük çift kişilik yatak, tam donanımlı mutfak ve kanepeli ayrı oturma odası sunar.\n\nOlanaklar:\n• 2 Ekstra Büyük Çift Kişilik Yatak\n• Ocak & Fırınlı Tam Mutfak\n• Kanepeli Geniş Oturma Odası\n• Yürüyüş Duşlu Özel Banyo\n• Klima\n• Kablolu Kanallı Düz Ekran TV\n• Ücretsiz Wi-Fi & Ücretsiz Tuvalet Malzemeleri\n• Şehir & Dağ Manzarası',
    'hr-title': 'Ev Kuralları',
    'hr-special-requests': 'Hotel Sinan Han özel istekleri kabul ediyor — bir sonraki adımda ekleyin!',
    'hr-checkin-title': 'Giriş',
    'hr-checkin-time': '14:00 ile 00:00 arasında',
    'hr-checkin-note': 'Ne zaman geleceğinizi önceden mülke bildirmeniz gerekecektir.',
    'hr-checkout-title': 'Çıkış',
    'hr-checkout-time': '07:00 ile 11:00 arasında',
    'hr-cancellation-title': 'İptal / Ön Ödeme',
    'hr-cancellation-text': 'İptal ve ön ödeme politikaları konaklama türüne göre değişmektedir. Lütfen konaklama tarihlerinizi girin ve seçtiğiniz seçeneğin koşullarını kontrol edin.',
    'hr-children-title': 'Çocuklar ve Yataklar',
    'hr-child-policies': 'Çocuk politikaları',
    'hr-children-welcome': 'Her yaştan çocuk memnuniyetle karşılanır.',
    'hr-children-adult-charge': 'Bu tesiste 7 yaş ve üzeri çocuklar yetişkin olarak ücretlendirilecektir.',
    'hr-children-under7': '7 yaşın altındaki çocuklarla seyahat ediyorsanız, doğru fiyatı ödediğinizden emin olmak için çocuk doluluk oranı belirtilmiş bir tarife seçin.',
    'hr-cot-title': 'Beşik ve Ekstra Yatak Politikaları',
    'hr-cot-label': '0 – 3 yaş:',
    'hr-cot-free': 'İstek üzerine beşik — Ücretsiz',
    'hr-cot-note': 'İzin verilen beşik sayısı seçtiğiniz seçeneğe bağlıdır. Daha fazla bilgi için seçtiğiniz seçeneği kontrol edin.',
    'hr-no-extra-beds': 'Bu tesiste ekstra yatak bulunmamaktadır.',
    'hr-cots-availability': 'Tüm beşikler müsaitlik durumuna göre verilmektedir.',
    'hr-age-title': 'Yaş Kısıtlaması',
    'hr-age-text': 'Giriş için yaş şartı bulunmamaktadır.',
    'hr-pets-title': 'Evcil Hayvanlar',
    'hr-pets-text': 'Evcil hayvanlara izin verilmemektedir.',
    'li-title': 'Önemli Yasal Bilgiler',
    'li-arrival-title': 'Varış Saati',
    'li-arrival-text': 'Tahmini varış saatinizi önceden Hotel Sinan Han\'a bildirin. Rezervasyon sırasında Özel İstekler kutusunu kullanabilir veya onayınızda verilen iletişim bilgileri ile tesisle doğrudan iletişime geçebilirsiniz.',
    'li-health-title': 'Sağlık ve Güvenlik',
    'li-health-text': 'Koronavirüs (COVID-19) kapsamında bu tesiste ek güvenlik ve sanitasyon önlemleri alınmaktadır.',
    'footer-registration': 'İşletme Kaydı',
    'reg-title': 'Faaliyet Sınıflandırma Bildirimi',
    'reg-country': 'BOSNA HERSEK',
    'reg-entity': 'BOSNA HERSEK FEDERASYONU',
    'reg-institute': 'FEDERAL İSTATİSTİK KURUMU SARAYBOSNA',
    'reg-dept': 'HERSEK-NERETVA KANTONU BÖLGESİ İSTATİSTİK HİZMETİ MOSTAR',
    'reg-number-label': 'Numara:',
    'reg-date-label': 'Tarih:',
    'reg-law-basis': 'Bosna-Hersek Federasyonu\'ndaki Faaliyetlerin Sınıflandırılması Kanunu\'nun (FBiH Resmi Gazetesi, No. 64/07 ve 80/11) 7. Maddesi, Fıkra (1) ve 11. Maddesi uyarınca aşağıdaki belge düzenlenmektedir:',
    'reg-notice-title': 'FAALİYET SINIFLANDIRMASINA GÖRE İŞLETMENİN SINIFLANDIRILMASINA İLİŞKİN BİLDİRİM',
    'reg-name-label': 'İşletme Adı:',
    'reg-name-value': 'Ev pansiyonu "SINAN-HAN", sahibi Arif Jašari',
    'reg-address-label': 'Kayıtlı Adres:',
    'reg-id-label': 'Kimlik Numarası:',
    'reg-code-label': 'Faaliyet Kodu (KD BiH 2010):',
    'reg-activity-label': 'Faaliyet Adı:',
    'reg-activity-value': 'Tatil ve benzeri kısa süreli konaklama tesisleri',
    'reg-explanation-title': 'Gerekçe:',
    'reg-explanation-p1': 'Tarafın talebi veya resen yürütülen prosedürde, bu bildirimin verilmesi için Bosna-Hersek Federasyonu\'ndaki Faaliyet Sınıflandırması Kanunu\'nun 9. ve 11. maddelerindeki koşulların karşılandığı tespit edilmiştir.',
    'reg-explanation-p2': 'Ticari kuruluş hatalı sınıflandırıldığını düşünüyorsa, bu bildirimin alınmasından itibaren 15 gün içinde gerekli belgelerle Enstitü\'ye yeniden sınıflandırma talebinde bulunma hakkına sahiptir.',
    'reg-authority-title': 'MÜDÜRİN YETKİSİYLE, ŞUBE MÜDÜRİ'
  },
  ar: {
    'nav-home': 'الصفحة الرئيسية',
    'nav-rooms': 'الغرف',
    'nav-amenities': 'وسائل الراحة',
    'nav-reviews': 'التقييمات',
    'nav-contact': 'اتصل بنا',
    'hotel-name': 'سنان هان',
    'hero-subtitle': 'حيث يلتقي التراث بالراحة العصرية',
    'reserve-btn': 'احجز الآن',
    'book-btn': 'احجز الآن',
    'about-title': 'أهلا وسهلا بك في فندق سنان هان - حيث يلتقي التراث براحة البال',
    'about-p1': 'يقع سنان هان بشكل مثالي في قلب موستار، على بعد 100 متر فقط من الجسر العتيق الشهير عالميا، ويوفر مزيجا مثاليا من التقاليد والأناقة وكرم الضيافة الحديث.',
    'about-p2': 'في يوليو 2025، قمنا بتوسيع ممتلكاتنا بفخر مع 8 وحدات فاخرة جديدة تماما، تضم مجموعة من الغرف المزدوجة والغرف الثلاثية والشقق الصغيرة. مصممة مع الراحة والأسلوب في الاعتبار، تقدم كل وحدة إقامة فاخرة للأزواج والعائلات والمسافرين بمفردهم والمجموعات الصغيرة.',
    'about-p3': 'يُدعى الضيوف للاسترخاء على تراسنا على السطح، الذي يتمتع بإطلالات بانورامية على الأفق التاريخي لموستار. يتوفر الإنترنت عالي السرعة المجاني في جميع أنحاء الفندق. يتوفر موقف سيارات خاص في الموقع (يتم تطبيق رسوم إضافية)، وللضيوف الذين يسافرون بدراجة نارية، نقدم موقفا آمنا للدراجات النارية مجانا.',
    'about-p4': 'جميع غرف الضيوف مكيفة بالكامل وتشمل حمامات خاصة. تتمتع بعض الغرف بإطلالات رائعة على الجبال أو المدينة المحيطة. كل وحدة مزودة بتلفزيون ذكي يحتوي على قنوات فضائية توفر إمكانية الوصول إلى خدمات البث. تشمل الوحدات المضافة حديثا أيضا مطبخا مجهزا بالكامل، وهو مثالي للضيوف الذين يبحثون عن المزيد من الاستقلالية والراحة أثناء إقامتهم.',
    'about-p5': 'فريق الاستقبال لدينا متاح للمساعدة في الرحلات المخصصة والجولات الموجهة في جميع أنحاء الهرسك، مما يساعدك على اكتشاف ثقافتها الغنية والجمال الطبيعي والنوى المخفية.',
    'about-p6': 'تشمل نقاط الاهتمام الشهيرة على مسافة قريبة بيت موسليبيجوفتش (900 متر) وبازار كوجونجيلوك القديم (100 متر). يقع أقرب مطار إلى مطار موستار الدولي ومطار سراييفو الدولي (110 كم)، ويمكن ترتيب النقل من المطار عند الطلب (رسوم إضافية).',
    'rooms-title': 'غرفنا',
    'rooms-subtitle': 'اكتشف مجموعتنا من أماكن الإقامة المريحة والأنيقة',
    'view-details': 'عرض التفاصيل',
    'per-night': 'في الليلة',
    'book-now': 'احجز الآن',
    'most-popular': 'الأكثر شهرة',
    'std-dbl-name': 'غرفة مزدوجة قياسية',
    'std-dbl-desc': 'غرفة • 18 متر مربع',
    'std-dbl-feat1': 'سرير مزدوج كبير واحد',
    'std-dbl-feat2': 'تلفزيون شاشة مسطحة',
    'std-dbl-feat3': 'شرفة بإطلالة على المدينة',
    'std-dbl-highlights': 'تتضمن هذه الغرفة المزدوجة المكيفة تلفزيونا بشاشة مسطحة مع قنوات كابلية وحماما خاصا وشرفة بإطلالة على المدينة. تشمل منتجات العناية الشخصية المجانية.',
    'std-dbl-price': 'BAM 138.86',
    'sup-suite-name': 'جناح فاخر',
    'sup-suite-desc': 'شقة كاملة • 45 متر مربع',
    'sup-suite-feat1': 'سرير مزدوج واحد كبير جدا + سرير أريكة',
    'sup-suite-feat2': 'مطبخ كامل',
    'sup-suite-feat3': 'تلفزيون شاشة مسطحة',
    'sup-suite-highlights': 'بمدخل خاص، تتميز هذه الشقة المكيفة بغرفة معيشة واحدة وغرفة نوم منفصلة وحمام واحد مع دش مشي وبيدية. في المطبخ المجهز جيدا، سيجد الضيوف موقدا وثلاجة وأدوات المطبخ وفرنا. مع شرفة بإطلالة على الحديقة، تتميز هذه الشقة أيضا بجدران عازلة للصوت وتلفزيون شاشة مسطحة مع قنوات كابلية.',
    'sup-suite-price': 'BAM 177.98',
    'dbl-terrace-name': 'غرفة مزدوجة مع شرفة',
    'dbl-terrace-desc': 'غرفة • 18 متر مربع',
    'dbl-terrace-feat1': 'سرير مزدوج كبير واحد',
    'dbl-terrace-feat2': 'شرفة بإطلالة على الجبال',
    'dbl-terrace-feat3': 'تلفزيون ذكي',
    'dbl-terrace-highlights': 'تتضمن هذه الغرفة المزدوجة المكيفة تلفزيونا بشاشة مسطحة مع قنوات كابلية وحماما خاصا وشرفة بإطلالة على الجبال.',
    'dbl-terrace-price': 'BAM 159.86',
    'std-queen-name': 'غرفة ملكة قياسية',
    'std-queen-desc': 'غرفة • 24 متر مربع',
    'std-queen-feat1': 'سرير مزدوج واحد كبير جدا',
    'std-queen-feat2': 'إطلالة على الحديقة',
    'std-queen-feat3': 'تلفزيون شاشة مسطحة',
    'std-queen-highlights': 'توفر هذه الغرفة المزدوجة منتجات العناية الشخصية المجانية وتتضمن حماما خاصا مع دش مشي وبيدية. تتميز بجدران عازلة للصوت وميني بار.',
    'std-queen-price': 'BAM 165.00',
    'sup-apt-name': 'شقة فاخرة',
    'sup-apt-desc': 'شقة كاملة • 45 متر مربع',
    'sup-apt-feat1': 'سرير مزدوج واحد كبير جدا + سرير أريكة',
    'sup-apt-feat2': 'مطبخ كامل',
    'sup-apt-feat3': 'تلفزيون شاشة مسطحة',
    'sup-apt-highlights': 'بمدخل خاص، تتميز هذه الشقة المكيفة بغرفة معيشة واحدة وغرفة نوم منفصلة وحمام واحد مع دش مشي وبيدية. في المطبخ المجهز جيدا، سيجد الضيوف موقدا وثلاجة وأدوات المطبخ وفرنا. مع شرفة بإطلالة على الحديقة، تتميز هذه الشقة أيضا بجدران عازلة للصوت وتلفزيون شاشة مسطحة مع قنوات كابلية. تحتوي الوحدة على سرير واحد.',
    'sup-apt-price': 'BAM 185.00',
    'deluxe-name': 'جناح ديلوكس',
    'deluxe-desc': 'غرفة • 29 متر مربع',
    'deluxe-feat1': 'سرير أريكة واحد + سرير مزدوج كبير',
    'deluxe-feat2': 'إطلالات على الجبال والمدينة',
    'deluxe-feat3': 'تلفزيون شاشة مسطحة',
    'deluxe-highlights': 'جناح ديلوكس فاخر بالطابق العلوي يتميز بسرير أريكة واحد وسرير مزدوج كبير مع سرير أطفال مجاني عند الطلب. غرفة مكيفة مع فناء وحمام منفصل وشرفة وماكينة قهوة وميني بار وواي فاي مجاني. يتضمن إطلالات على الجبال والمعالم السياحية والمدينة والنهر. صندوق أمانات وأغطية سرير هيبوالرجينية ومدخل خاص مع عزل صوتي.',
    'deluxe-price': 'BAM 195.00',
    'amenities-title': 'وسائل راحة من الدرجة الأولى',
    'amenities-subtitle': 'حيث يلتقي الراحة بالتراث الأصيل',
    'amenity-wifi-title': 'واي فاي مجاني',
    'amenity-wifi-desc': 'إنترنت عالي السرعة في كل مكان',
    'amenity-restaurant-title': 'مطعم',
    'amenity-restaurant-desc': 'مأكولات بوسنية أصلية',
    'amenity-service-title': 'خدمة على مدار الساعة',
    'amenity-service-desc': 'مساعدة مكرسة من الكونسيرج',
    'amenity-wellness-title': 'العافية',
    'amenity-wellness-desc': 'خدمات الاسبا والتدليك',
    'amenity-business-title': 'مركز الأعمال',
    'amenity-business-desc': 'مرافق مكتبية كاملة',
    'amenity-security-title': 'الأمان',
    'amenity-security-desc': 'صناديق الأمانات',
    'reviews-title': 'تقييمات الضيوف',
    'reviews-subtitle': 'اسمع من ضيوفنا الراضين',
    'rating-label': 'ممتاز',
    'rating-count': 'تم تقييمه من قبل 847 ضيفا',
    'booking-title': 'تحقق من التوفر',
    'booking-subtitle': 'ابحث عن التواريخ المثالية واحجز بسهولة',
    'form-name-label': 'اسم الضيف',
    'form-email-label': 'البريد الإلكتروني',
    'form-checkin-label': 'الدخول',
    'form-checkout-label': 'المغادرة',
    'form-room-label': 'نوع الغرفة',
    'form-guests-label': 'عدد الضيوف',
    'form-currency-label': 'العملة',
    'price-room-label': 'الغرفة:',
    'price-nights-label': 'الليالي:',
    'price-per-night-label': 'المجموع لكل ليلة:',
    'price-total-label': 'المجموع:',
    'complete-booking-btn': 'إكمال الحجز',
    'contact-title': 'تواصل معنا',
    'contact-address-label': 'العنوان',
    'contact-phone-label': 'الهاتف',
    'contact-email-label': 'البريد الإلكتروني',
    'contact-location-label': 'الموقع',
    'contact-location-text': 'على بعد 100 متر فقط من الجسر العتيق الشهير عالميا',
    'maps-btn': 'عرض على خرائط جوجل',
    'footer-about-title': 'حول سنان هان',
    'footer-about-desc': 'فندق بوتيك محفوظ بشكل مثالي يوفر التراث الأصيل والراحة الحديثة في قلب موستار.',
    'footer-links-title': 'روابط سريعة',
    'footer-home': 'الصفحة الرئيسية',
    'footer-rooms': 'الغرف',
    'footer-amenities': 'وسائل الراحة',
    'footer-reviews': 'التقييمات',
    'footer-policies-title': 'السياسات',
    'footer-privacy': 'سياسة الخصوصية',
    'footer-terms': 'الشروط والأحكام',
    'footer-cancellation': 'سياسة الإلغاء',
    'footer-house-rules': 'قواعد المنزل',
    'footer-important-info': 'معلومات قانونية هامة',
    'footer-guest-reviews': 'تقييمات الضيوف',
    'footer-follow-title': 'تابعنا',
    'footer-copyright': '© 2026 سنان هان. جميع الحقوق محفوظة. | صممت بـ ♥ للمسافرين',
    'footer-house-rules-title': 'اعرض قواعد المنزل والسياسات على Booking.com',
    'footer-important-info-title': 'اعرض المعلومات القانونية المهمة على Booking.com',
    'footer-guest-reviews-title': 'اقرأ تقييمات الضيوف على Booking.com',
    'footer-registration-title': 'عرض وثيقة التسجيل التجاري الرسمية',
    'modal-book-btn': 'احجز هذه الغرفة',
    'select-room': 'اختر غرفة',
    'currency-bam': 'BAM (العلامة البوسنية)',
    'currency-eur': 'EUR (اليورو)',
    'pricing-label': 'تسعير الغرفة',
    'guests-label': 'الضيوف',
    'room-price-label': 'سعر الغرفة',
    'tax-label': 'الضريبة',
    'total-label': 'المجموع',
    'per-night-label': 'لكل ليلة',
    'standard-double-pricing': 'غرفة مزدوجة قياسية - ضيفان: BAM 198 | EUR 101 | الضريبة: BAM 8 | EUR 4 | المجموع: BAM 206 | EUR 105',
    'superior-suite-pricing': 'جناح فاخر - ضيفان: BAM 226 | EUR 116 | الضريبة: BAM 8 | EUR 4 | المجموع: BAM 234 | EUR 120 | 3 ضيوف: BAM 253 | EUR 129 | الضريبة: BAM 12 | EUR 6 | المجموع: BAM 265 | EUR 135',
    'deluxe-suite-pricing': 'جناح ديلوكس - ضيفان: BAM 226 | EUR 116 | الضريبة: BAM 8 | EUR 4 | المجموع: BAM 234 | EUR 120 | 3 ضيوف: BAM 253 | EUR 129 | الضريبة: BAM 12 | EUR 6 | المجموع: BAM 265 | EUR 135',
    'double-terrace-pricing': 'غرفة مزدوجة مع شرفة - ضيف واحد: BAM 214 | EUR 109 | الضريبة: BAM 4 | EUR 2 | المجموع: BAM 218 | EUR 111 | ضيفان: BAM 251 | EUR 128 | الضريبة: BAM 8 | EUR 4 | المجموع: BAM 259 | EUR 132',
    'standard-queen-pricing': 'غرفة ملكة قياسية - ضيف واحد: BAM 362 | EUR 185 | الضريبة: BAM 4 | EUR 2 | المجموع: BAM 366 | EUR 187 | ضيفان: BAM 234 | EUR 120 | الضريبة: BAM 8 | EUR 4 | المجموع: BAM 242 | EUR 124',
    'superior-apartment-pricing': 'شقة فاخرة - ضيفان: BAM 306 | EUR 156 | الضريبة: BAM 8 | EUR 4 | المجموع: BAM 314 | EUR 160 | 3 ضيوف: BAM 334 | EUR 171 | الضريبة: BAM 12 | EUR 6 | المجموع: BAM 346 | EUR 177',
    'review-1-text': '"شكرا جزيلا على استيعابك لتسجيل وصولي المتأخر وعلى الدعم الرائع من موظفي الاستقبال، خاصة لشخص مثلي يميل إلى نسيان الأشياء. الموقع كان مريحا جدا والمكان كان نظيفا وصيانة جيدة. على الرغم من أن إقامتي كانت قصيرة، إلا أنها كانت مريحة وممتعة جدا. عندما أزور موستار مرة أخرى، سأود بالتأكيد البقاء هنا مرة أخرى. شكرا مرة أخرى على لطفك."',
    'review-1-author': 'تاكاكو',
    'review-1-location': 'اليابان • جناح ديلوكس • فبراير 2026',
    'review-2-text': '"النظافة كانت حقا استثنائية - كل شيء كان نظيفا تماما. تم إعطاؤنا ترقية غرفة مجانية بلطف، مما جعل إقامتنا أكثر متعة. كانت الغرفة واسعة جدا وحديثة وتبدو وكأنها جديدة تماما. شكراقاص للسيدة الرائعة في مكتب الاستقبال - كانت ترحيبية ومفيدة بشكل لا يصدق! بشكل عام، تجربة رائعة."',
    'review-2-author': 'إيفان',
    'review-2-location': 'الجبل الأسود • جناح ديلوكس • ديسمبر 2025',
    'review-3-text': '"النظافة والموقع والاهتمام بالتفاصيل في كل شيء. شقة جديدة وأجهزة جديدة. قام أردجان وحب الحب بما هو أكثر من المتوقع مع موقف واستخدام استثنائي - فعلوا كل شيء وأكثر. يذهب الموظفون حقا الميل الإضافي لجعل إقامتك مثالية."',
    'review-3-author': 'منصور',
    'review-3-location': 'المملكة المتحدة • جناح ديلوكس • ديسمبر 2025',
    'modal-standard-double-title': 'غرفة مزدوجة قياسية',
    'modal-standard-double-desc': 'غرفة • 18 متر مربع\n\nتتضمن هذه الغرفة المزدوجة المكيفة تلفزيونا بشاشة مسطحة مع قنوات كابلية وحماما خاصا وشرفة بإطلالة على المدينة. تشمل منتجات العناية الشخصية المجانية.\n\nوسائل الراحة:\n• سرير مزدوج كبير واحد\n• تلفزيون شاشة مسطحة\n• شرفة بإطلالة على المدينة\n• تكييف الهواء\n• حمام خاص',
    'modal-superior-suite-title': 'جناح فاخر',
    'modal-superior-suite-desc': 'شقة كاملة • 45 متر مربع\n\nبمدخل خاص، تتميز هذه الشقة المكيفة بغرفة معيشة واحدة وغرفة نوم منفصلة وحمام واحد مع دش مشي وبيدية. في المطبخ المجهز جيدا، سيجد الضيوف موقدا وثلاجة وأدوات المطبخ وفرنا. مع شرفة بإطلالة على الحديقة، تتميز هذه الشقة أيضا بجدران عازلة للصوت وتلفزيون شاشة مسطحة مع قنوات كابلية.\n\nوسائل الراحة:\n• سرير مزدوج واحد كبير جدا + سرير أريكة\n• مطبخ كامل\n• تلفزيون شاشة مسطحة\n• جدران عازلة للصوت\n• شرفة بإطلالة على الحديقة',
    'modal-double-terrace-title': 'غرفة مزدوجة مع شرفة',
    'modal-double-terrace-desc': 'غرفة • 18 متر مربع\n\nتتضمن هذه الغرفة المزدوجة المكيفة تلفزيونا بشاشة مسطحة مع قنوات كابلية وحماما خاصا وشرفة بإطلالة على الجبال.\n\nوسائل الراحة:\n• سرير مزدوج كبير واحد\n• شرفة بإطلالة على الجبال\n• تلفزيون ذكي\n• تكييف الهواء\n• حمام خاص',
    'modal-standard-queen-title': 'غرفة ملكة قياسية',
    'modal-standard-queen-desc': 'غرفة • 24 متر مربع\n\nتوفر هذه الغرفة المزدوجة منتجات العناية الشخصية المجانية وتتضمن حماما خاصا مع دش مشي وبيدية. تتميز بجدران عازلة للصوت وميني بار.\n\nوسائل الراحة:\n• سرير مزدوج واحد كبير جدا\n• إطلالة على الحديقة\n• تلفزيون شاشة مسطحة\n• جدران عازلة للصوت\n• ميني بار',
    'modal-superior-apartment-title': 'شقة فاخرة',
    'modal-superior-apartment-desc': 'شقة كاملة • 45 متر مربع\n\nبمدخل خاص، تتميز هذه الشقة المكيفة بغرفة معيشة واحدة وغرفة نوم منفصلة وحمام واحد مع دش مشي وبيدية. في المطبخ المجهز جيدا، سيجد الضيوف موقدا وثلاجة وأدوات المطبخ وفرنا. مع شرفة بإطلالة على الحديقة، تتميز هذه الشقة أيضا بجدران عازلة للصوت وتلفزيون شاشة مسطحة مع قنوات كابلية. تحتوي الوحدة على سرير واحد.\n\nوسائل الراحة:\n• سرير مزدوج واحد كبير جدا + سرير أريكة\n• مطبخ كامل مع موقد وفرن\n• ماكينة قهوة وميني بار\n• تلفزيون شاشة مسطحة مع قنوات كابلية\n• جدران عازلة للصوت\n• دش مشي مع بيدية\n• شرفة بإطلالة على الحديقة والجبال والمدينة\n• تكييف الهواء\n• واي فاي مجاني',
    'modal-deluxe-suite-title': 'جناح ديلوكس',
    'modal-deluxe-suite-desc': 'غرفة الطابق العلوي • 29 متر مربع\n\nتبقى واحدة فقط! يتميز هذا الجناح الفاخر الفاخر بسرير أريكة واحد وسرير مزدوج كبير مع سرير أطفال مجاني عند الطلب. يقع في الطابق العلوي مع إطلالات رائعة.\n\nوسائل الراحة:\n• سرير أريكة واحد + سرير مزدوج كبير\n• إطلالة على الجبال والمعالم السياحية والمدينة والنهر\n• إطلالة على الفناء الداخلي\n• تكييف الهواء\n• فناء وشرفة\n• حمام منفصل مع حوض استحمام أو دش\n• تلفزيون شاشة مسطحة مع قنوات فضائية\n• عزل صوتي\n• ماكينة قهوة وميني بار\n• واي فاي مجاني ومنتجات عناية شخصية مجانية\n• صندوق أمانات\n• أغطية سرير هيبوالرجينية\n• مجفف شعر وحديد ومصنع شاي/قهوة\n• مدخل خاص\n• غرفة ملابس وخزانة\n• منطقة جلوس مع سرير أريكة',
    'house-rules': 'قواعد البيت والسياسات',
    'two-bed-deluxe-name': 'شقة فاخرة بغرفتي نوم',
    'two-bed-deluxe-desc': 'شقة كاملة • 65 م²',
    'two-bed-deluxe-feat1': 'سريران مزدوجان كبيران جداً',
    'two-bed-deluxe-feat2': 'مطبخ مجهز بالكامل',
    'two-bed-deluxe-feat3': 'غرفة معيشة واسعة',
    'two-bed-deluxe-highlights': 'شقة فاخرة واسعة بغرفتي نوم تضم سريرين مزدوجين كبيرين جداً، ومطبخاً مجهزاً بالكامل، وغرفة معيشة منفصلة مع أريكة، وحماماً خاصاً مع دش مشي. مثالية للعائلات أو المجموعات الصغيرة.',
    'two-bed-deluxe-price': 'BAM 262',
    'modal-two-bedroom-deluxe-title': 'شقة فاخرة بغرفتي نوم',
    'modal-two-bedroom-deluxe-desc': 'شقة كاملة • 65 م²\n\nشقة فاخرة واسعة بغرفتي نوم تضم سريرين مزدوجين كبيرين جداً، ومطبخاً مجهزاً بالكامل، وغرفة معيشة منفصلة مع أريكة.\n\nوسائل الراحة:\n• سريران مزدوجان كبيران جداً\n• مطبخ كامل مع موقد وفرن\n• غرفة معيشة واسعة مع أريكة\n• حمام خاص مع دش مشي\n• تكييف هواء\n• تلفزيون بشاشة مسطحة مع قنوات كابل\n• واي فاي مجاني ومستلزمات حمام مجانية\n• إطلالة على المدينة والجبال',
    'hr-title': 'قواعد المنزل',
    'hr-special-requests': 'يقبل فندق سنان هان الطلبات الخاصة — أضفها في الخطوة التالية!',
    'hr-checkin-title': 'تسجيل الوصول',
    'hr-checkin-time': 'من 14:00 حتى 00:00',
    'hr-checkin-note': 'ستحتاج إلى إعلام الفندق مسبقاً بوقت وصولك.',
    'hr-checkout-title': 'تسجيل المغادرة',
    'hr-checkout-time': 'من 07:00 حتى 11:00',
    'hr-cancellation-title': 'الإلغاء / الدفع المسبق',
    'hr-cancellation-text': 'تختلف سياسات الإلغاء والدفع المسبق وفقاً لنوع الإقامة. يرجى إدخال تواريخ إقامتك والتحقق من شروط الخيار المطلوب.',
    'hr-children-title': 'الأطفال والأسرّة',
    'hr-child-policies': 'سياسات الأطفال',
    'hr-children-welcome': 'الأطفال من جميع الأعمار مرحب بهم.',
    'hr-children-adult-charge': 'سيتم تحصيل رسوم الأطفال من عمر 7 سنوات فما فوق كبالغين في هذا الفندق.',
    'hr-children-under7': 'إذا كنت مسافراً مع أطفال دون سن 7 سنوات، لضمان دفع السعر الصحيح يرجى اختيار تعرفة تحدد إشغال الأطفال.',
    'hr-cot-title': 'سياسات السرير المتنقل والسرير الإضافي',
    'hr-cot-label': '0 – 3 سنوات:',
    'hr-cot-free': 'سرير متنقل عند الطلب — مجاني',
    'hr-cot-note': 'يعتمد عدد الأسرّة المتنقلة المسموح بها على الخيار الذي تختاره. يرجى التحقق من خيارك المحدد لمزيد من المعلومات.',
    'hr-no-extra-beds': 'لا تتوفر أسرّة إضافية في هذا الفندق.',
    'hr-cots-availability': 'جميع الأسرّة المتنقلة رهنة بالتوفر.',
    'hr-age-title': 'قيود العمر',
    'hr-age-text': 'لا يوجد حد أدنى للعمر عند تسجيل الوصول.',
    'hr-pets-title': 'الحيوانات الأليفة',
    'hr-pets-text': 'لا يُسمح بالحيوانات الأليفة.',
    'li-title': 'معلومات قانونية مهمة',
    'li-arrival-title': 'وقت الوصول',
    'li-arrival-text': 'يرجى إعلام فندق سنان هان مسبقاً بوقت وصولك المتوقع. يمكنك استخدام مربع الطلبات الخاصة عند الحجز، أو الاتصال مباشرةً بالفندق باستخدام بيانات الاتصال المقدمة في تأكيدك.',
    'li-health-title': 'الصحة والسلامة',
    'li-health-text': 'استجابةً لفيروس كورونا (كوفيد-19)، تم اتخاذ تدابير إضافية للسلامة والصرف الصحي في هذا الفندق.',
    'footer-registration': 'تسجيل الأعمال',
    'reg-title': 'إشعار تصنيف النشاط التجاري',
    'reg-country': 'البوسنة والهرسك',
    'reg-entity': 'اتحاد البوسنة والهرسك',
    'reg-institute': 'المعهد الفيدرالي للإحصاء سراييفو',
    'reg-dept': 'قسم الإحصاء لمنطقة كانتون هرسك-نيريتفا موستار',
    'reg-number-label': 'الرقم:',
    'reg-date-label': 'التاريخ:',
    'reg-law-basis': 'استناداً إلى المادة 7، الفقرة (1) والمادة 11 من قانون تصنيف الأنشطة في اتحاد البوسنة والهرسك (الجريدة الرسمية للاتحاد، رقم 64/07 و80/11)، يُصدر ما يلي:',
    'reg-notice-title': 'إشعار تصنيف الكيان التجاري وفق تصنيف الأنشطة',
    'reg-name-label': 'اسم المنشأة:',
    'reg-name-value': 'إقامة في المنزل "سينان هان"، المالك: أريف ياشاري',
    'reg-address-label': 'العنوان المسجل:',
    'reg-id-label': 'رقم التعريف:',
    'reg-code-label': 'رمز النشاط (KD BiH 2010):',
    'reg-activity-label': 'اسم النشاط:',
    'reg-activity-value': 'المنتجعات ومنشآت الإقامة المماثلة للإقامة القصيرة',
    'reg-explanation-title': 'التعليل:',
    'reg-explanation-p1': 'في الإجراء المُنفَّذ بناءً على طلب الطرف أو من تلقاء الجهة الرسمية، تبيَّن أن الشروط المنصوص عليها في المادتين 9 و11 من قانون تصنيف الأنشطة في اتحاد البوسنة والهرسك مستوفاةٌ لإصدار هذا الإشعار.',
    'reg-explanation-p2': 'إذا رأى الكيان التجاري أنه صُنِّف بشكل خاطئ، فله الحق في غضون 15 يومًا من استلام هذا الإشعار تقديم طلب إعادة التصنيف إلى هذه الهيئة مع الوثائق المطلوبة.',
    'reg-authority-title': 'بتفويض المدير، رئيس القسم'
  },
};

// ============================================
// TRANSLATIONS JSON LOADER (Phase 3.2)
// ============================================
/**
 * Fetches translations.json and deep-merges it into the local `translation`
 * object, then re-applies the current language.
 * Falls back to the inline object if the file cannot be loaded.
 */
async function loadExternalTranslations() {
    try {
        const cached = localStorage.getItem('sinanhan_translations_v1');
        if (cached) {
            const data = JSON.parse(cached);
            mergeTranslations(data);
            return;
        }

        const response = await fetch('/translations.json');
        if (!response.ok) throw new Error('translations.json not found');

        const data = await response.json();
        mergeTranslations(data);

        // Cache locally for 24h (avoid repeat fetches)
        localStorage.setItem('sinanhan_translations_v1', JSON.stringify(data));
    } catch (err) {
        // Silent fallback – inline translations still work
    }
}

/** Deep merge external data into the existing `translation` object */
function mergeTranslations(data) {
    for (const lang of Object.keys(data)) {
        if (!translation[lang]) {
            translation[lang] = {};
        }
        Object.assign(translation[lang], data[lang]);
    }
    // Re-apply current language after merge
    const current = localStorage.getItem('language') || 'en';
    changeLanguage(current);
}

// Load external translations on startup
document.addEventListener('DOMContentLoaded', loadExternalTranslations);

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
class ToastNotification {
    constructor() {
        this.toasts = [];
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', duration = 4000) {
        const toastId = Date.now();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.dataset.toastId = toastId;

        // Toast content with close button
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${this.escapeHtml(message)}</span>
                <button class="toast-close" aria-label="Close notification">
                    <span>&times;</span>
                </button>
            </div>
        `;

        // Add close button listener
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.remove(toastId);
        });

        // Add to container
        this.container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        if (duration > 0) {
            const timeout = setTimeout(() => {
                this.remove(toastId);
            }, duration);
            toast.dataset.timeout = timeout;
        }

        return toastId;
    }

    remove(toastId) {
        const toast = document.querySelector(`[data-toast-id="${toastId}"]`);
        if (toast) {
            if (toast.dataset.timeout) {
                clearTimeout(parseInt(toast.dataset.timeout));
            }
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
}

// Initialize global toast notification system
const toast = new ToastNotification();

// ============================================
// LOADING SPINNER UTILITIES
// ============================================
const spinner = {
    show: function(message = 'Processing...') {
        const spinnerElement = document.getElementById('loadingSpinner');
        const spinnerText = spinnerElement?.querySelector('.spinner-text');
        if (spinnerElement) {
            if (spinnerText) spinnerText.textContent = message;
            spinnerElement.style.display = 'flex';
        }
    },

    hide: function() {
        const spinnerElement = document.getElementById('loadingSpinner');
        if (spinnerElement) {
            spinnerElement.style.display = 'none';
        }
    },

    showFor: function(durationMs = 500) {
        this.show();
        setTimeout(() => this.hide(), durationMs);
    }
};

// ============================================
// MODAL SYSTEM
// ============================================
class Modal {
    constructor() {
        this.currentModal = null;
        this.init();
    }

    init() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('modal-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'modal-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);

            // Close modal when clicking overlay
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close();
            }
        });
    }

    open(title, content) {
        const overlay = document.getElementById('modal-overlay');

        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-title');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-title" class="modal-title">${this.escapeHtml(title)}</h2>
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        overlay.innerHTML = '';
        const closeBtn = modal.querySelector('.modal-close');
        overlay.appendChild(modal);
        overlay.classList.add('active');

        // Close button handler
        closeBtn.addEventListener('click', () => {
            this.close();
        });

        // Lock scroll
        lockScroll();
        this.currentModal = modal;

        return modal;
    }

    close() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.innerHTML = '';
                unlockScroll();
                this.currentModal = null;
            }, 300);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize modal system
const modal = new Modal();

// Room modal data
const roomModalData = {
    'standard-double': {
        titleKey: 'modal-standard-double-title',
        descKey: 'modal-standard-double-desc'
    },
    'superior-suite': {
        titleKey: 'modal-superior-suite-title',
        descKey: 'modal-superior-suite-desc'
    },
    'double-terrace': {
        titleKey: 'modal-double-terrace-title',
        descKey: 'modal-double-terrace-desc'
    },
    'standard-queen': {
        titleKey: 'modal-standard-queen-title',
        descKey: 'modal-standard-queen-desc'
    },
    'superior-apartment': {
        titleKey: 'modal-superior-apartment-title',
        descKey: 'modal-superior-apartment-desc'
    },
    'two-bedroom-deluxe': {
        titleKey: 'modal-two-bedroom-deluxe-title',
        descKey: 'modal-two-bedroom-deluxe-desc'
    }
};

// Open room details modal
function openRoomDetailsModal(roomId) {
    const roomData = roomModalData[roomId];
    if (!roomData) return;

    const currentLang = localStorage.getItem('language') || 'en';
    const roomTitle = translation[currentLang]?.[roomData.titleKey] || roomData.titleKey;
    const roomDesc = translation[currentLang]?.[roomData.descKey] || roomData.descKey;

    // Track room view in analytics
    analytics.trackRoomView(roomId, roomTitle, 0);

    const content = `
        <div class="room-modal-content">
            <p>${roomDesc.replace(/\n/g, '<br>')}</p>
            <button class="btn btn-primary modal-book-btn" data-room-id="${roomId}" data-i18n="modal-book-btn">Book Now</button>
        </div>
    `;

    modal.open(roomTitle, content);

    // Use event delegation to avoid querySelector after DOM insertion
    const overlay = document.getElementById('modal-overlay');
    overlay.addEventListener('click', function handler(e) {
        if (e.target.classList.contains('modal-book-btn')) {
            overlay.removeEventListener('click', handler);
            modal.close();
            const bookingSection = document.querySelector('#booking');
            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

// Keep old openRoomDetails function for backwards compatibility but use new modal
function openRoomDetails(roomId) {
    openRoomDetailsModal(roomId);
}

function changeLanguage(lang) {
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;

    // Sync both language selectors (desktop and mobile)
    const desktopSelector = document.getElementById('language-selector');
    const mobileSelector = document.getElementById('language-selector-mobile');
    if (desktopSelector) desktopSelector.value = lang;
    if (mobileSelector) mobileSelector.value = lang;

    // Track language change for analytics
    analytics.trackLanguageChange(lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translation[lang] && translation[lang][key]) {
            el.textContent = translation[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translation[lang] && translation[lang][key]) {
            el.setAttribute('placeholder', translation[lang][key]);
        }
    });

    // Handle title attributes for tooltips
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translation[lang] && translation[lang][key]) {
            el.setAttribute('title', translation[lang][key]);
        }
    });
}

window.addEventListener('load', function () {
    // Always start with English - don't persist language across refreshes
    const defaultLang = 'en';
    const desktopSelector = document.getElementById('language-selector');
    const mobileSelector = document.getElementById('language-selector-mobile');
    if (desktopSelector) desktopSelector.value = defaultLang;
    if (mobileSelector) mobileSelector.value = defaultLang;
    changeLanguage(defaultLang);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ============================================
// PERFORMANCE: INTERSECTION OBSERVER FOR NAV
// Replaces offsetTop polling to eliminate forced reflow
// ============================================
let _currentNavSection = '';
let navLinksCache = null;
let parallaxLayersCache = null;

function _applyNavHighlight(sectionId) {
    if (!navLinksCache) navLinksCache = document.querySelectorAll('.nav-link-active');
    navLinksCache.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
        }
    });
}

function initNavObserver() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                _currentNavSection = entry.target.id;
                _applyNavHighlight(_currentNavSection);
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    document.querySelectorAll('section[id]').forEach(function(s) {
        observer.observe(s);
    });
}

parallaxLayersCache = null;

function updateActiveNavLink() {
    _applyNavHighlight(_currentNavSection);
}

function updateParallax() {
    if (!parallaxLayersCache) return;
    const scrollY = window.scrollY;

    parallaxLayersCache.forEach(layer => {
        const depth = parseFloat(layer.getAttribute('data-depth'));
        const offset = scrollY * depth;
        layer.style.transform = `translateY(${offset}px)`;
    });
}

// ============================================
// PERFORMANCE: THROTTLED SCROLL HANDLERS
// Uses requestAnimationFrame to batch scroll updates
// ============================================
let scrollTicking = false;

function onScroll() {
    if (!scrollTicking) {
        requestAnimationFrame(() => {
            updateParallax();
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}

window.addEventListener('scroll', onScroll, { passive: true });

if (typeof AOS === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
    script.onload = function () {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    };
    document.head.appendChild(script);

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/aos@2.3.1/dist/aos.css';
    document.head.appendChild(css);
} else {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });
}

// ============================================
// INPUT VALIDATION UTILITIES
// ============================================
const Validators = {
    email: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    phone: (phone) => {
        // Accept +XXX format or 10+ digits
        const regex = /^[\d\s\-\+]{10,}$/;
        return regex.test(phone.replace(/\s/g, ''));
    },

    dates: (checkIn, checkOut) => {
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
            return { valid: false, error: 'Invalid date format' };
        }

        if (inDate < today) {
            return { valid: false, error: 'Check-in date cannot be in the past' };
        }

        if (outDate <= inDate) {
            return { valid: false, error: 'Check-out date must be after check-in date' };
        }

        return { valid: true };
    },

    guestCount: (count) => {
        const num = parseInt(count);
        if (isNaN(num) || num < 1 || num > 8) {
            return { valid: false, error: 'Guest count must be between 1 and 8' };
        }
        return { valid: true };
    },

    sanitize: (input) => {
        if (typeof input !== 'string') return input;
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .trim();
    }
};

// ============================================
// CSRF TOKEN MANAGEMENT
// ============================================
let window_csrfToken = null;
let window_csrfTokenExpiry = 0; // ms timestamp; 0 = not yet fetched

async function fetchCSRFToken() {
    try {
        const response = await fetch('/api/csrf-token', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            window_csrfToken = data.token;
            // Server TTL is 30 min — refresh 1 min early to avoid racing the expiry
            window_csrfTokenExpiry = Date.now() + 29 * 60 * 1000;
            return data.token;
        } else {
            console.error('Failed to fetch CSRF token');
            return null;
        }
    } catch (error) {
        console.error('CSRF token fetch error:', error.message);
        return null;
    }
}

/** Returns a valid token, re-fetching if the current one has expired. */
async function getValidCSRFToken() {
    if (!window_csrfToken || Date.now() >= window_csrfTokenExpiry) {
        return fetchCSRFToken();
    }
    return window_csrfToken;
}

// Fetch CSRF token on page load
// Commented out to prevent 404 errors when not running backend server
// document.addEventListener('DOMContentLoaded', function() {
//     fetchCSRFToken();
// });

// ============================================
// BOOKING FORM HANDLER WITH VALIDATION
// ============================================
const contactForm = document.querySelector('form');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = {
            guestName: Validators.sanitize(formData.get('name') || ''),
            email: Validators.sanitize(formData.get('email') || ''),
            phone: Validators.sanitize(formData.get('phone') || ''),
            checkIn: formData.get('checkIn') || '',
            checkOut: formData.get('checkOut') || '',
            roomType: Validators.sanitize(formData.get('room') || ''),
            guests: formData.get('guests') || '',
            totalPrice: parseFloat(document.getElementById('total').textContent.replace(/[^0-9.]/g, '')) || 0,
            currency: formData.get('currency') || 'BAM'
        };

        // === VALIDATION ===
        if (!data.guestName) {
            toast.error('Guest name is required');
            return;
        }

        if (!data.email) {
            toast.error('Email is required');
            return;
        }

        if (!Validators.email(data.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (!data.phone) {
            toast.error('Phone number is required');
            return;
        }

        if (!Validators.phone(data.phone)) {
            toast.error('Please enter a valid phone number (at least 10 digits)');
            return;
        }

        const dateValidation = Validators.dates(data.checkIn, data.checkOut);
        if (!dateValidation.valid) {
            toast.error(dateValidation.error);
            return;
        }

        const guestValidation = Validators.guestCount(data.guests);
        if (!guestValidation.valid) {
            toast.error(guestValidation.error);
            return;
        }

        if (!data.roomType) {
            toast.error('Please select a room type');
            return;
        }

        // === ENSURE CSRF TOKEN EXISTS ===
        if (!window_csrfToken) {
            window_csrfToken = await getValidCSRFToken();
            if (!window_csrfToken) {
                toast.error('Security validation failed. Please refresh and try again.');
                return;
            }
        }

        // === SUBMIT WITH CSRF TOKEN ===
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': window_csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Thank you for your booking request! We will contact you at ' + data.email);
                // Track booking start for analytics
                analytics.trackBookingStart(data.roomType);
                contactForm.reset();
                // Open confirmation modal with booking details
                if (typeof openBookingConfirmationModal === 'function') {
                    openBookingConfirmationModal(data);
                }
            } else {
                toast.error(result.error || 'Error submitting booking. Please try again.');
            }
        } catch (error) {
            console.error('Booking submission error:', error.message);
            toast.error('Network error. Please check your connection and try again.');
        }
    });
}

// Navbar scroll effect (uses shared throttled scroll handler)
let navbarScrolled = false;
function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const shouldBeScrolled = window.scrollY > 50;
    if (shouldBeScrolled !== navbarScrolled) {
        navbarScrolled = shouldBeScrolled;
        navbar.classList.toggle('scrolled', shouldBeScrolled);
    }
}

// Back-to-top visibility (uses shared throttled scroll handler)
let backToTopVisible = false;
function updateBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    if (!backToTopBtn) return;
    const shouldBeVisible = window.scrollY > 300;
    if (shouldBeVisible !== backToTopVisible) {
        backToTopVisible = shouldBeVisible;
        backToTopBtn.classList.toggle('visible', shouldBeVisible);
    }
}

// Combined throttled scroll handler
let combinedScrollTicking = false;
function onCombinedScroll() {
    if (!combinedScrollTicking) {
        requestAnimationFrame(() => {
            updateNavbar();
            updateBackToTop();
            combinedScrollTicking = false;
        });
        combinedScrollTicking = true;
    }
}

window.addEventListener('scroll', onCombinedScroll, { passive: true });

// Image Lazy Loading with Fallback
function loadImages() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px' // Load images 50px before they enter viewport
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        });
    }
}

// Load images when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadImages);
} else {
    loadImages();
}

const backToTopBtn = document.querySelector('.back-to-top');
if (backToTopBtn) {
    // Visibility is now handled by updateBackToTop() in throttled scroll handler
    backToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initNavObserver();
    setTimeout(() => {
        updateActiveNavLink();
        updateParallax();
        updateNavbar();
        updateBackToTop();
    }, 100);
});

function lockScroll() {
    document.body.style.overflow = 'hidden';
}

function unlockScroll() {
    document.body.style.overflow = '';
}

// Resize handling is now done by cacheSectionPositions debounced handler

// ============================================
// BOOKING CONFIRMATION MODAL
// ============================================
const BAM_TO_EUR = 0.51;
function openBookingConfirmationModal(bookingData) {
    const modal = document.getElementById('bookingConfirmationModal');
    if (!modal) return;

    // Calculate nights
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Get room price (from roomData object defined in HTML inline script)
    const roomPrice = roomData[bookingData.roomType]?.price || 0;
    const extraGuests = Math.max(0, (parseInt(bookingData.guests) || 2) - 2);
    const pricePerNight = roomPrice + extraGuests * 40;
    const totalPrice = pricePerNight * nights;
    const totalPriceEUR = (totalPrice * BAM_TO_EUR).toFixed(2);

    // Populate modal with booking details
    document.getElementById('confirmRoomName').textContent = roomData[bookingData.roomType]?.title || bookingData.roomType;
    document.getElementById('confirmCheckIn').textContent = checkIn.toLocaleDateString();
    document.getElementById('confirmCheckOut').textContent = checkOut.toLocaleDateString();
    document.getElementById('confirmGuests').textContent = bookingData.guests + ' Guest' + (bookingData.guests > 1 ? 's' : '');
    document.getElementById('confirmPricePerNight').textContent = `BAM ${pricePerNight} (EUR ${(pricePerNight * BAM_TO_EUR).toFixed(2)})`;
    document.getElementById('confirmNights').textContent = nights;
    document.getElementById('confirmTotalPrice').textContent = `BAM ${totalPrice} (EUR ${totalPriceEUR})`;

    // Populate guest information
    document.getElementById('confirmGuestName').textContent = bookingData.guestName;
    document.getElementById('confirmGuestEmail').textContent = bookingData.email;
    document.getElementById('confirmGuestPhone').textContent = bookingData.phone;

    // Store booking data for submission
    modal.dataset.bookingData = JSON.stringify({
        ...bookingData,
        nights,
        totalPrice,
        totalPriceEUR
    });

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeBookingConfirmationModal() {
    const modal = document.getElementById('bookingConfirmationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    }
}

// Modal close button
document.getElementById('closeConfirmModal')?.addEventListener('click', closeBookingConfirmationModal);
document.getElementById('cancelConfirmBtn')?.addEventListener('click', closeBookingConfirmationModal);

// Close modal when clicking outside
document.getElementById('bookingConfirmationModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeBookingConfirmationModal();
    }
});

// Show/hide billing address form
document.getElementById('billingAddress')?.addEventListener('change', function() {
    const billingForm = document.getElementById('billingAddressForm');
    if (billingForm) {
        billingForm.style.display = this.checked ? 'block' : 'none';
    }
});

// Show/hide card details based on payment method
document.getElementById('paymentMethod')?.addEventListener('change', function() {
    const cardDetails = document.getElementById('cardDetails');
    if (cardDetails) {
        cardDetails.style.display = ['credit-card', 'debit-card'].includes(this.value) ? 'block' : 'none';
    }
    // Track payment method selection
    if (this.value) analytics.trackPaymentMethodSelected(this.value);
});

// Format card number with spaces
document.getElementById('cardNumber')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    e.target.value = formattedValue;
});

// Format expiry date as MM/YY
document.getElementById('expiryDate')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
});

// Payment form submission
document.getElementById('bookingPaymentForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const modal = document.getElementById('bookingConfirmationModal');
    const bookingData = JSON.parse(modal.dataset.bookingData || '{}');

    // Validate form
    const paymentMethod = document.getElementById('paymentMethod').value;
    if (!paymentMethod) {
        toast.error('Please select a payment method');
        return;
    }

    if (!document.getElementById('agreeTerms').checked) {
        toast.error('Please agree to terms and conditions');
        return;
    }

    // Validate card details if credit/debit card selected
    if (['credit-card', 'debit-card'].includes(paymentMethod)) {
        const cardHolderEl = document.getElementById('cardHolder');
        const cardNumberEl = document.getElementById('cardNumber');
        const expiryDateEl = document.getElementById('expiryDate');
        const cvvEl = document.getElementById('cvv');
        if (cardHolderEl && cardNumberEl && expiryDateEl && cvvEl) {
            const cardHolder = cardHolderEl.value.trim();
            const cardNumber = cardNumberEl.value.replace(/\s/g, '');
            const expiryDate = expiryDateEl.value;
            const cvv = cvvEl.value;
            if (!cardHolder || cardNumber.length < 13 || !expiryDate || cvv.length < 3) {
                toast.error('Please enter valid card details');
                return;
            }
        }
    }

    // Show loading spinner
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Processing...';
    spinner.show('Processing payment...');

    try {
        // Prepare payment data
        const paymentData = {
            bookingId: bookingData.bookingId || 'TEMP_' + Date.now(),
            amount: bookingData.totalPrice,
            currency: 'BAM',
            paymentMethod: paymentMethod,
            cardLastFour: ['credit-card', 'debit-card'].includes(paymentMethod)
                ? (document.getElementById('cardNumber')?.value.slice(-4) ?? null)
                : null,
            billingAddress: document.getElementById('billingAddress').checked ? {
                street: document.getElementById('billingStreet').value,
                city: document.getElementById('billingCity').value,
                postal: document.getElementById('billingPostal').value,
                country: document.getElementById('billingCountry').value
            } : null
        };

        // Ensure CSRF token exists
        if (!window_csrfToken) {
            window_csrfToken = await getValidCSRFToken();
        }

        // Make payment request
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window_csrfToken
            },
            credentials: 'include',
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (response.ok) {
            toast.success('Payment processed successfully! Booking confirmed.');
            // Track successful booking/purchase
            const bd = JSON.parse(modal.dataset.bookingData || '{}');
            analytics.trackBookingSuccess(
                result.transactionId || 'TXN_' + Date.now(),
                bd.roomType || '',
                bd.totalPrice || 0
            );
            closeBookingConfirmationModal();
            document.querySelector('form')?.reset();
        } else {
            analytics.trackBookingFailure(result.message || 'payment_failed');
            toast.error(result.message || 'Payment failed. Please try again.');
        }
    } catch (error) {
        console.error('Payment error:', error.message);
        toast.error('Network error during payment. Please try again.');
    } finally {
        spinner.hide();
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalText;
    }
});

// ============================================
// BOOKING.COM API INTEGRATION (Now through backend)
// ============================================
const BookingComAPI = {
    baseURL: '/api', // Use backend proxy instead of external API

    // All requests now go through the backend which handles API keys securely
    // The backend server.js file proxies these to the actual Booking.com API

    // NOTE: API keys are stored in .env on the server side
    // Frontend never exposes sensitive credentials

    async getAvailability(params) {
        try {
            // Ensure CSRF token exists
            if (!window_csrfToken) {
                window_csrfToken = await getValidCSRFToken();
            }

            const response = await fetch(`${this.baseURL}/bookings/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': window_csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Availability check error:', error.message);
            return null;
        }
    },

    async createBooking(bookingData) {
        try {
            // Ensure CSRF token exists
            if (!window_csrfToken) {
                window_csrfToken = await getValidCSRFToken();
            }

            const response = await fetch(`${this.baseURL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': window_csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Booking creation error:', error.message);
            return null;
        }
    },

    async getBookingDetails(bookingId) {
        try {
            const response = await fetch(`${this.baseURL}/bookings/${bookingId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Booking details error:', error.message);
            return null;
        }
    }
};

// ============================================
// MORI API PAYMENT INTEGRATION
// ============================================
const MoriAPIPayment = {
    baseURL: '/api', // Use backend proxy instead of external API

    // All requests now go through the backend which handles API keys securely
    // The backend server.js file proxies these to the actual Mori Payment API

    // NOTE: API keys and merchant ID are stored in .env on the server side
    // Frontend never exposes sensitive credentials

    async processPayment(paymentData) {
        try {
            // Ensure CSRF token exists
            if (!window_csrfToken) {
                window_csrfToken = await getValidCSRFToken();
            }

            const response = await fetch(`${this.baseURL}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': window_csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Payment processing error:', error.message);
            return null;
        }
    },

    async verifyPayment(transactionId) {
        try {
            const response = await fetch(`${this.baseURL}/payments/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ transactionId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Payment verification error:', error.message);
            return null;
        }
    },

    async refundPayment(transactionId, amount) {
        try {
            // Ensure CSRF token exists
            if (!window_csrfToken) {
                window_csrfToken = await getValidCSRFToken();
            }

            const response = await fetch(`${this.baseURL}/payments/refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': window_csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({ transactionId, amount })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Refund processing error:', error.message);
            return null;
        }
    }
};

// ============================================
// INTEGRATED BOOKING FUNCTION
// ============================================
async function processCompleteBooking(bookingData) {
    // Step 1: Create booking via Booking.com API
    const booking = await BookingComAPI.createBooking(bookingData);

    if (!booking || !booking.booking_id) {
        console.error('Failed to create booking');
        return null;
    }

    // Step 2: Process payment via Mori API
    const paymentData = {
        amount: bookingData.amount,
        currency: bookingData.currency || 'EUR',
        paymentMethod: bookingData.paymentMethod || 'credit_card',
        email: bookingData.email,
        name: bookingData.name,
        bookingReference: booking.booking_id,
        description: `Booking for ${bookingData.checkIn} to ${bookingData.checkOut}`
    };

    const payment = await MoriAPIPayment.processPayment(paymentData);

    if (!payment || !payment.transaction_id) {
        console.error('Payment processing failed');
        return null;
    }

    // Step 3: Verify payment status
    const verification = await MoriAPIPayment.verifyPayment(payment.transaction_id);

    return {
        bookingId: booking.booking_id,
        transactionId: payment.transaction_id,
        paymentStatus: verification ? verification.status : 'pending',
        success: verification && verification.status === 'confirmed'
    };
}
