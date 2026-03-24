// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const CONFIG = {
  HOTEL_NAME: 'Sinan Han',
  HOTEL_YEAR: 2024,
  TOAST_SHOW_DELAY: 10, // ms for animation trigger
  TOAST_AUTO_HIDE_DURATION: 4000, // ms
  TOAST_FADE_DURATION: 300, // ms
  RESIZE_DEBOUNCE: 250, // ms
  SCROLL_THRESHOLD_NAVBAR: 50, // px for navbar style change
  SCROLL_THRESHOLD_BACK_TO_TOP: 300, // px for back-to-top visibility
  SCROLL_THRESHOLD_NAV_ACTIVE: 200, // px offset for active section detection
  PARALLAX_ANIMATION_DURATION: 300, // ms
  MODAL_CLOSE_ANIMATION: 300, // ms
  AOS_DURATION: 800, // AOS animation duration
  LANGUAGES: ['en', 'bs', 'de', 'fr', 'it'],
  DEFAULT_LANGUAGE: 'en'
};

const SELECTORS = {
  NAVBAR: '.navbar',
  HAMBURGER: '#navHamburger',
  NAV_MENU: '#navMenu',
  NAV_LINKS: '.nav-link-active',
  LANGUAGE_SELECTOR: '#language-selector',
  PARALLAX_LAYERS: '.parallax-layer',
  TOAST_CONTAINER: 'toast-container',
  MODAL_OVERLAY: 'modal-overlay',
  BACK_TO_TOP_BTN: '.back-to-top',
  CONTACT_FORM: 'form',
  IMAGES_LAZY: 'img[data-src]',
  SECTIONS: 'section[id]',
  ANCHOR_LINKS: 'a[href^="#"]',
  I18N_ELEMENTS: '[data-i18n]',
  I18N_PLACEHOLDER: '[data-i18n-placeholder]'
};

const ROOM_IDS = {
  STANDARD_DOUBLE: 'standard-double',
  SUPERIOR_SUITE: 'superior-suite',
  DOUBLE_TERRACE: 'double-terrace',
  STANDARD_QUEEN: 'standard-queen',
  SUPERIOR_APARTMENT: 'superior-apartment',
  TWO_BEDROOM_DELUXE: 'two-bedroom-deluxe'
};

// ============================================
// TRANSLATION SYSTEM
// ============================================

/**
 * Translation manager with error handling and fallbacks
 */
class TranslationManager {
  constructor() {
    this.translations = {};
    this.currentLanguage = this.getSavedLanguage();
    this.isLoading = false;
  }

  /**
   * Get saved language from localStorage or default
   * @returns {string} Language code
   */
  getSavedLanguage() {
    const saved = localStorage.getItem('language');
    return CONFIG.LANGUAGES.includes(saved) ? saved : CONFIG.DEFAULT_LANGUAGE;
  }

  /**
   * Load translations for all languages
   * @returns {Promise<void>}
   */
  async loadTranslations() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const loadPromises = CONFIG.LANGUAGES.map(lang =>
        fetch(`/languages/${lang}.json`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to load ${lang} translation`);
            }
            return response.json();
          })
          .catch(error => {
            console.warn(`Failed to load ${lang} translation, using fallback:`, error);
            return null;
          })
      );

      const results = await Promise.all(loadPromises);
      CONFIG.LANGUAGES.forEach((lang, index) => {
        this.translations[lang] = results[index] || {};
      });

      // Fallback to default language if empty
      if (!Object.keys(this.translations[this.currentLanguage]).length) {
        this.currentLanguage = CONFIG.DEFAULT_LANGUAGE;
      }
    } catch (error) {
      console.error('Translation loading error:', error);
      // Use empty object as fallback
      CONFIG.LANGUAGES.forEach(lang => {
        this.translations[lang] = {};
      });
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get translation for a key
   * @param {string} key - Translation key
   * @returns {string} Translated text or key as fallback
   */
  get(key) {
    const translation = this.translations[this.currentLanguage]?.[key];
    if (!translation) {
      console.warn(`Missing translation key: ${key} for language: ${this.currentLanguage}`);
      return key; // Return key as fallback
    }
    return translation;
  }

  /**
   * Change current language
   * @param {string} lang - Language code
   */
  setLanguage(lang) {
    if (!CONFIG.LANGUAGES.includes(lang)) {
      console.warn(`Invalid language: ${lang}`);
      return;
    }
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
  }

  /**
   * Update all i18n elements on page
   */
  updatePageTranslations() {
    // Update text content
    document.querySelectorAll(SELECTORS.I18N_ELEMENTS).forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.get(key);
      el.textContent = text;
    });

    // Update placeholders
    document.querySelectorAll(SELECTORS.I18N_PLACEHOLDER).forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.get(key);
      el.setAttribute('placeholder', text);
    });

    // Update title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const text = this.get(key);
      el.setAttribute('title', text);
    });
  }
}

const translator = new TranslationManager();

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

/**
 * Toast notification manager with accessibility support
 */
class ToastNotification {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.init();
  }

  /**
   * Initialize toast container
   */
  init() {
    let container = document.getElementById(SELECTORS.TOAST_CONTAINER);
    if (!container) {
      container = document.createElement('div');
      container.id = SELECTORS.TOAST_CONTAINER;
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    this.container = container;
  }

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type (info, success, error, warning)
   * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide)
   * @returns {number} Toast ID
   */
  show(message, type = 'info', duration = CONFIG.TOAST_AUTO_HIDE_DURATION) {
    if (!message || typeof message !== 'string') {
      console.warn('Toast: Invalid message');
      return null;
    }

    const toastId = Date.now();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.dataset.toastId = toastId;

    // Create content with proper escaping
    const messageSpan = document.createElement('span');
    messageSpan.className = 'toast-message';
    messageSpan.textContent = message; // Text content prevents XSS

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.innerHTML = '<span>&times;</span>';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'toast-content';
    contentDiv.appendChild(messageSpan);
    contentDiv.appendChild(closeBtn);
    toast.appendChild(contentDiv);

    // Close button handler
    closeBtn.addEventListener('click', () => this.remove(toastId));

    // Add to container
    this.container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), CONFIG.TOAST_SHOW_DELAY);

    // Auto remove if duration is set
    if (duration > 0) {
      const timeout = setTimeout(() => this.remove(toastId), duration);
      toast.dataset.timeout = timeout;
    }

    this.toasts.push(toastId);
    return toastId;
  }

  /**
   * Remove toast notification
   * @param {number} toastId - Toast ID to remove
   */
  remove(toastId) {
    const toast = document.querySelector(`[data-toast-id="${toastId}"]`);
    if (!toast) return;

    if (toast.dataset.timeout) {
      clearTimeout(parseInt(toast.dataset.timeout));
    }

    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts = this.toasts.filter(id => id !== toastId);
    }, CONFIG.TOAST_FADE_DURATION);
  }

  /**
   * Show success toast
   * @param {string} message - Message to display
   * @param {number} duration - Auto-hide duration
   * @returns {number} Toast ID
   */
  success(message, duration = CONFIG.TOAST_AUTO_HIDE_DURATION) {
    return this.show(message, 'success', duration);
  }

  /**
   * Show error toast
   * @param {string} message - Message to display
   * @param {number} duration - Auto-hide duration
   * @returns {number} Toast ID
   */
  error(message, duration = CONFIG.TOAST_AUTO_HIDE_DURATION) {
    return this.show(message, 'error', duration);
  }

  /**
   * Show warning toast
   * @param {string} message - Message to display
   * @param {number} duration - Auto-hide duration
   * @returns {number} Toast ID
   */
  warning(message, duration = CONFIG.TOAST_AUTO_HIDE_DURATION) {
    return this.show(message, 'warning', duration);
  }

  /**
   * Show info toast
   * @param {string} message - Message to display
   * @param {number} duration - Auto-hide duration
   * @returns {number} Toast ID
   */
  info(message, duration = CONFIG.TOAST_AUTO_HIDE_DURATION) {
    return this.show(message, 'info', duration);
  }
}

const toast = new ToastNotification();

// ============================================
// MODAL SYSTEM
// ============================================

/**
 * Modal dialog manager with accessibility and animations
 */
class Modal {
  constructor() {
    this.currentModal = null;
    this.overlay = null;
    this.init();
  }

  /**
   * Initialize modal overlay
   */
  init() {
    let overlay = document.getElementById(SELECTORS.MODAL_OVERLAY);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = SELECTORS.MODAL_OVERLAY;
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);

      // Close modal when clicking overlay
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.close();
        }
      });
    }
    this.overlay = overlay;

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentModal) {
        this.close();
      }
    });
  }

  /**
   * Open modal with title and content
   * @param {string} title - Modal title
   * @param {HTMLElement|string} content - Modal content
   * @returns {HTMLElement} Modal element
   */
  open(title, content) {
    if (!title || !content) {
      console.warn('Modal: Title and content are required');
      return null;
    }

    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    // Create header
    const header = document.createElement('div');
    header.className = 'modal-header';

    const titleEl = document.createElement('h2');
    titleEl.id = 'modal-title';
    titleEl.className = 'modal-title';
    titleEl.textContent = title; // Use textContent to prevent XSS

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.setAttribute('aria-label', 'Close modal');
    closeBtn.textContent = '×';

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    // Create body
    const body = document.createElement('div');
    body.className = 'modal-body';

    if (typeof content === 'string') {
      body.textContent = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'modal-content';
    contentWrapper.appendChild(header);
    contentWrapper.appendChild(body);

    modal.appendChild(contentWrapper);

    // Clear and add to overlay
    this.overlay.innerHTML = '';
    this.overlay.appendChild(modal);
    this.overlay.classList.add('active');

    // Close button handler
    closeBtn.addEventListener('click', () => this.close());

    // Lock scroll and set focus management
    lockScroll();
    this.currentModal = modal;

    // Focus trap: Move focus to first focusable element in modal
    setTimeout(() => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 0);

    return modal;
  }

  /**
   * Close modal with animation
   */
  close() {
    if (!this.overlay) return;

    this.overlay.classList.remove('active');
    setTimeout(() => {
      this.overlay.innerHTML = '';
      unlockScroll();
      this.currentModal = null;
    }, CONFIG.MODAL_CLOSE_ANIMATION);
  }
}

const modal = new Modal();

// ============================================
// NAVIGATION SYSTEM
// ============================================

/**
 * Hamburger menu toggle handler - Simplified & Robust
 */
function initHamburgerMenu() {
  const hamburger = document.getElementById('navHamburger');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link-active');
  const languageDropdownBtn = document.getElementById('language-dropdown-btn');
  const languageDropdown = document.getElementById('language-dropdown-menu');

  // Safety check
  if (!hamburger || !navMenu) {
    console.error('Hamburger or nav menu elements not found!');
    return;
  }

  console.log('✓ Hamburger menu initialized');

  // Main hamburger toggle
  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');

    const isOpen = navMenu.classList.contains('active');
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    console.log('Hamburger clicked, menu is now:', isOpen ? 'OPEN' : 'CLOSED');
  });

  // Close menu when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      console.log('Nav link clicked, menu CLOSED');
    });
  });

  // Language dropdown toggle
  if (languageDropdownBtn && languageDropdown) {
    languageDropdownBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      languageDropdown.classList.toggle('hidden');
    });

    // Language selection buttons
    languageDropdown.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        languageDropdown.classList.add('hidden');
      });
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    const clickedInside = navMenu.contains(e.target) || hamburger.contains(e.target);

    if (!clickedInside && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      console.log('Outside click detected, menu CLOSED');
    }

    // Close language dropdown when clicking outside of it
    if (languageDropdown && !languageDropdown.classList.contains('hidden')) {
      const clickedInsideDropdown = languageDropdownBtn?.contains(e.target) || languageDropdown.contains(e.target);
      if (!clickedInsideDropdown) {
        languageDropdown.classList.add('hidden');
      }
    }
  });
}

// ============================================
// SCROLL UTILITIES - CONSOLIDATED
// ============================================

/**
 * Manager for all scroll-related functionality with throttling
 */
class ScrollManager {
  constructor() {
    this.scrollTicking = false;
    this.navbarHeight = 50;
    this.init();
  }

  /**
   * Initialize scroll listener with throttling
   */
  init() {
    window.addEventListener('scroll', () => this.onScroll());
  }

  /**
   * Throttled scroll handler
   */
  onScroll() {
    if (!this.scrollTicking) {
      requestAnimationFrame(() => {
        this.updateNavbarStyle();
        this.updateActiveNavLink();
        this.updateParallax();
        this.updateBackToTopButton();
        this.scrollTicking = false;
      });
      this.scrollTicking = true;
    }
  }

  /**
   * Update navbar style based on scroll position
   */
  updateNavbarStyle() {
    const navbar = document.querySelector(SELECTORS.NAVBAR);
    if (!navbar) return;

    if (window.scrollY > CONFIG.SCROLL_THRESHOLD_NAVBAR) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  /**
   * Update active navigation link based on current section
   */
  updateActiveNavLink() {
    const sections = document.querySelectorAll(SELECTORS.SECTIONS);
    const navLinks = document.querySelectorAll(SELECTORS.NAV_LINKS);

    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - CONFIG.SCROLL_THRESHOLD_NAV_ACTIVE) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Update parallax layer transforms
   */
  updateParallax() {
    const parallaxLayers = document.querySelectorAll(SELECTORS.PARALLAX_LAYERS);
    const scrollY = window.scrollY;

    parallaxLayers.forEach(layer => {
      const depth = parseFloat(layer.getAttribute('data-depth')) || 0.5;
      const offset = scrollY * depth;
      layer.style.transform = `translateY(${offset}px)`;
    });
  }

  /**
   * Update back-to-top button visibility
   */
  updateBackToTopButton() {
    const backToTopBtn = document.querySelector(SELECTORS.BACK_TO_TOP_BTN);
    if (!backToTopBtn) return;

    if (window.scrollY > CONFIG.SCROLL_THRESHOLD_BACK_TO_TOP) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }
}

const scrollManager = new ScrollManager();

// ============================================
// VIEWPORT & RESIZE HANDLER
// ============================================

/**
 * Handle window resize events with debouncing
 */
class ResizeHandler {
  constructor() {
    this.resizeTimer = null;
    this.init();
  }

  /**
   * Initialize resize listener with debouncing
   */
  init() {
    window.addEventListener('resize', () => this.onResize());
  }

  /**
   * Debounced resize handler
   */
  onResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      scrollManager.updateActiveNavLink();
    }, CONFIG.RESIZE_DEBOUNCE);
  }
}

const resizeHandler = new ResizeHandler();

// ============================================
// LAZY LOADING SYSTEM
// ============================================

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
  const images = document.querySelectorAll(SELECTORS.IMAGES_LAZY);

  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// ============================================
// BACK TO TOP BUTTON
// ============================================

/**
 * Initialize back-to-top button
 */
function initBackToTopButton() {
  const backToTopBtn = document.querySelector(SELECTORS.BACK_TO_TOP_BTN);
  if (!backToTopBtn) return;

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ============================================
// ANCHOR LINKS SMOOTH SCROLL
// ============================================

/**
 * Initialize smooth scroll for anchor links
 */
function initAnchorLinks() {
  document.querySelectorAll(SELECTORS.ANCHOR_LINKS).forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href !== '#') {
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
}

// ============================================
// ROOM DETAILS MODAL
// ============================================

const ROOM_MODAL_DATA = {
  [ROOM_IDS.STANDARD_DOUBLE]: {
    titleKey: 'modal-standard-double-title',
    descKey: 'modal-standard-double-desc'
  },
  [ROOM_IDS.SUPERIOR_SUITE]: {
    titleKey: 'modal-superior-suite-title',
    descKey: 'modal-superior-suite-desc'
  },
  [ROOM_IDS.DOUBLE_TERRACE]: {
    titleKey: 'modal-double-terrace-title',
    descKey: 'modal-double-terrace-desc'
  },
  [ROOM_IDS.STANDARD_QUEEN]: {
    titleKey: 'modal-standard-queen-title',
    descKey: 'modal-standard-queen-desc'
  },
  [ROOM_IDS.SUPERIOR_APARTMENT]: {
    titleKey: 'modal-superior-apartment-title',
    descKey: 'modal-superior-apartment-desc'
  },
  [ROOM_IDS.TWO_BEDROOM_DELUXE]: {
    titleKey: 'modal-two-bedroom-deluxe-title',
    descKey: 'modal-two-bedroom-deluxe-desc'
  }
};

/**
 * Open room details modal with image gallery and specifications
 * @param {string} roomId - Room identifier
 * @param {Object} roomData - Optional room data from API
 */
function openRoomDetails(roomId, roomData = null) {
  if (!roomId || typeof roomId !== 'string') {
    console.warn('Invalid room ID:', roomId);
    return;
  }

  const modalData = ROOM_MODAL_DATA[roomId];
  if (!modalData) {
    console.warn('Room data not found for ID:', roomId);
    return;
  }

  // Get translations
  const roomTitle = translator.get(modalData.titleKey);
  const roomDesc = translator.get(modalData.descKey);

  // Create content with image gallery and specifications
  const contentDiv = document.createElement('div');
  contentDiv.className = 'room-modal-content';

  // Image Gallery
  const galleryDiv = document.createElement('div');
  galleryDiv.className = 'room-gallery';
  galleryDiv.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 1.5rem;';

  // Get images for this room from room data or defaults
  const images = getRoomImages(roomId, roomData);
  images.forEach((imgSrc, index) => {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = `${roomTitle} - Image ${index + 1}`;
    img.loading = 'lazy'; // Native lazy loading
    img.decoding = 'async'; // Async image decoding
    img.style.cssText = 'width: 100%; height: 200px; object-fit: cover; border-radius: 0.5rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); opacity: 0.7; transition: opacity 0.3s ease;';
    img.onerror = function() {
      // Log the failed image path for debugging
      console.warn('Failed to load room image:', this.src);
      // Fallback if image fails to load
      this.src = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop';
    };
    img.onload = function() {
      // Image loaded successfully
      this.style.opacity = '1';
    };
    img.onclick = () => openImageViewer(images, index);
    galleryDiv.appendChild(img);
  });
  contentDiv.appendChild(galleryDiv);

  // Room Description
  const descPara = document.createElement('p');
  descPara.innerHTML = roomDesc.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
  descPara.style.marginBottom = '1rem';
  contentDiv.appendChild(descPara);

  // Specifications Section
  const specsDiv = document.createElement('div');
  specsDiv.className = 'room-specs';
  specsDiv.style.cssText = 'background: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;';

  const specsTitle = document.createElement('h3');
  specsTitle.textContent = 'Room Specifications';
  specsTitle.style.cssText = 'font-weight: bold; margin-bottom: 0.75rem; font-size: 1.1rem;';
  specsDiv.appendChild(specsTitle);

  const specsList = document.createElement('div');
  specsList.style.cssText = 'color: #4b5563; line-height: 1.8;';

  // Bedroom information
  if (roomData && roomData.bedrooms) {
    const bedroomInfo = document.createElement('p');
    bedroomInfo.innerHTML = `<strong>🛏️ Bedrooms:</strong> ${roomData.bedrooms}`;
    bedroomInfo.style.marginBottom = '0.5rem';
    specsList.appendChild(bedroomInfo);
  }

  // Living room information
  if (roomData && roomData.living_room) {
    const livingRoomInfo = document.createElement('p');
    livingRoomInfo.innerHTML = `<strong>🛋️ Living Room:</strong> ${roomData.living_room}`;
    livingRoomInfo.style.marginBottom = '0.5rem';
    specsList.appendChild(livingRoomInfo);
  }

  // Size information
  if (roomData && roomData.size) {
    const sizeInfo = document.createElement('p');
    sizeInfo.innerHTML = `<strong>📏 Size:</strong> ${roomData.size} m²`;
    sizeInfo.style.marginBottom = '0.5rem';
    specsList.appendChild(sizeInfo);
  }

  // Amenities list
  if (roomData && roomData.amenities && Array.isArray(roomData.amenities) && roomData.amenities.length > 0) {
    const amenitiesTitle = document.createElement('p');
    amenitiesTitle.innerHTML = '<strong>✓ Amenities:</strong>';
    amenitiesTitle.style.cssText = 'margin-top: 0.75rem; margin-bottom: 0.5rem;';
    specsList.appendChild(amenitiesTitle);

    const amenitiesGrid = document.createElement('div');
    amenitiesGrid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-left: 1rem;';

    roomData.amenities.forEach(amenity => {
      const amenityItem = document.createElement('div');
      amenityItem.innerHTML = `<span style="color: #10b981;">✓</span> ${amenity}`;
      amenityItem.style.cssText = 'font-size: 0.9rem; color: #4b5563;';
      amenitiesGrid.appendChild(amenityItem);
    });
    specsList.appendChild(amenitiesGrid);
  }

  // Additional specifications
  if (roomData && roomData.specifications && Array.isArray(roomData.specifications) && roomData.specifications.length > 0) {
    const additionalSpecs = document.createElement('div');
    additionalSpecs.style.cssText = 'margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e5e7eb;';

    const additionalTitle = document.createElement('p');
    additionalTitle.innerHTML = '<strong>Additional Features:</strong>';
    additionalTitle.style.marginBottom = '0.5rem';
    additionalSpecs.appendChild(additionalTitle);

    const specsGrid = document.createElement('div');
    specsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-left: 1rem;';

    roomData.specifications.forEach(spec => {
      const specItem = document.createElement('div');
      specItem.innerHTML = `<span style="color: #6366f1;">•</span> ${spec}`;
      specItem.style.cssText = 'font-size: 0.9rem; color: #4b5563;';
      specsGrid.appendChild(specItem);
    });
    additionalSpecs.appendChild(specsGrid);
    specsList.appendChild(additionalSpecs);
  }

  specsDiv.appendChild(specsList);
  contentDiv.appendChild(specsDiv);

  // Price Display (if available)
  if (roomData && roomData.price) {
    const priceDiv = document.createElement('div');
    priceDiv.style.cssText = 'background: #eef2ff; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center;';
    priceDiv.innerHTML = `<p style="font-size: 1.5rem; font-weight: bold; color: #4f46e5;">${roomData.price.toFixed(2)} ${roomData.currency}</p>`;
    contentDiv.appendChild(priceDiv);
  }

  // Book Button
  const bookBtn = document.createElement('button');
  bookBtn.className = 'btn btn-primary modal-book-btn';
  bookBtn.setAttribute('data-room-id', roomId);
  bookBtn.textContent = translator.get('modal-book-btn');
  bookBtn.setAttribute('aria-label', `Book ${roomTitle}`);
  bookBtn.style.cssText = 'width: 100%; padding: 0.75rem; background: #4f46e5; color: white; border: none; border-radius: 0.5rem; font-weight: bold; cursor: pointer;';

  contentDiv.appendChild(bookBtn);

  modal.open(roomTitle, contentDiv);

  // Track room selection for analytics
  if (typeof trackRoomSelected === 'function') {
    const roomPrice = roomData?.price || currentBooking?.price || 0;
    trackRoomSelected(roomId, roomPrice, roomTitle);
  }

  // Add event listener to book button
  bookBtn.addEventListener('click', () => {
    modal.close();
    // Scroll to booking form
    const bookingSection = document.querySelector('#booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/**
 * Get room images based on room ID and room data
 * @param {string} roomId - Room identifier
 * @param {Object} roomData - Optional room data from API with images
 * @returns {Array<string>} Array of image URLs
 */
function getRoomImages(roomId, roomData = null) {
  // If room data has images array, use those
  if (roomData && roomData.images && Array.isArray(roomData.images) && roomData.images.length > 0) {
    return roomData.images;
  }

  // Otherwise use default images based on room type
  const imageMap = {
    [ROOM_IDS.STANDARD_DOUBLE]: [
      '/Rooms/Standard Double Room/390594090.jpg',
      '/Rooms/Standard Double Room/396531572.jpg'
    ],
    [ROOM_IDS.SUPERIOR_SUITE]: [
      '/Rooms/Superior Suite/396552722.jpg',
      '/Rooms/Superior Suite/396532009.jpg'
    ],
    [ROOM_IDS.DOUBLE_TERRACE]: [
      '/Rooms/Double Room/396531596.jpg',
      '/Rooms/Double Room/396531928.jpg'
    ],
    [ROOM_IDS.STANDARD_QUEEN]: [
      '/Rooms/queen standard room/706475810.jpg',
      '/Rooms/queen standard room/706475998.jpg'
    ],
    [ROOM_IDS.SUPERIOR_APARTMENT]: [
      '/Rooms/Superior Apartment/714582257.jpg',
      '/Rooms/Superior Apartment/713093570.jpg'
    ],
    [ROOM_IDS.TWO_BEDROOM_DELUXE]: [
      '/Rooms/Two Bedroom Deluxe Apartment/714582553.jpg',
      '/Rooms/Two Bedroom Deluxe Apartment/714583127.jpg',
      '/Rooms/Two Bedroom Deluxe Apartment/706475998.jpg',
      '/Rooms/Two Bedroom Deluxe Apartment/706475998 .jpg'
    ]
  };

  return imageMap[roomId] || [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop'
  ];
}

/**
 * Open full-screen image viewer
 * @param {Array<string>} images - Array of image URLs
 * @param {number} startIndex - Starting image index
 */
function openImageViewer(images, startIndex = 0) {
  let currentIndex = startIndex;

  const viewerDiv = document.createElement('div');
  viewerDiv.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 9999; display: flex; align-items: center; justify-content: center;';

  const img = document.createElement('img');
  img.src = images[currentIndex];
  img.alt = 'Room image viewer';
  img.loading = 'eager'; // Eager loading for viewer (already open)
  img.decoding = 'async';
  img.style.cssText = 'max-width: 90%; max-height: 90vh; object-fit: contain;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = 'position: absolute; top: 1rem; right: 1rem; background: white; color: black; border: none; font-size: 2rem; width: 3rem; height: 3rem; border-radius: 50%; cursor: pointer;';
  closeBtn.onclick = () => document.body.removeChild(viewerDiv);

  // Navigation buttons
  if (images.length > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '‹';
    prevBtn.style.cssText = 'position: absolute; left: 1rem; background: white; color: black; border: none; font-size: 2rem; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;';
    prevBtn.onclick = () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      img.src = images[currentIndex];
    };

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '›';
    nextBtn.style.cssText = 'position: absolute; right: 1rem; background: white; color: black; border: none; font-size: 2rem; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;';
    nextBtn.onclick = () => {
      currentIndex = (currentIndex + 1) % images.length;
      img.src = images[currentIndex];
    };

    viewerDiv.appendChild(prevBtn);
    viewerDiv.appendChild(nextBtn);
  }

  viewerDiv.appendChild(img);
  viewerDiv.appendChild(closeBtn);

  // Close on background click
  viewerDiv.onclick = (e) => {
    if (e.target === viewerDiv) {
      document.body.removeChild(viewerDiv);
    }
  };

  // Close on Esc key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(viewerDiv);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  document.body.appendChild(viewerDiv);
}

// ============================================
// LANGUAGE SWITCHER
// ============================================

/**
 * Initialize language selector
 */
function initLanguageSelector() {
  const selector = document.getElementById(SELECTORS.LANGUAGE_SELECTOR);
  const languageDropdown = document.getElementById('language-dropdown-menu');

  // Handle desktop language selector
  if (selector) {
    selector.value = translator.currentLanguage;
    selector.addEventListener('change', (e) => {
      const newLang = e.target.value;
      translator.setLanguage(newLang);
      translator.updatePageTranslations();

      // Track language selection for analytics
      if (typeof trackLanguageSelected === 'function') {
        trackLanguageSelected(newLang);
      }
    });
  }

  // Handle mobile language dropdown
  if (languageDropdown) {
    languageDropdown.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newLang = btn.getAttribute('data-lang');
        translator.setLanguage(newLang);
        translator.updatePageTranslations();

        // Update desktop selector if it exists
        if (selector) {
          selector.value = newLang;
        }

        // Track language selection for analytics
        if (typeof trackLanguageSelected === 'function') {
          trackLanguageSelected(newLang);
        }
      });
    });
  }
}

// ============================================
// CONTACT FORM HANDLER
// ============================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid phone
 */
function isValidPhone(phone) {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return !phone || phoneRegex.test(phone); // Allow empty phone
}

/**
 * Initialize contact form
 */
function initContactForm() {
  const contactForm = document.querySelector(SELECTORS.CONTACT_FORM);
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const data = {
      name: formData.get('name')?.trim() || '',
      email: formData.get('email')?.trim() || '',
      phone: formData.get('phone')?.trim() || '',
      checkIn: formData.get('checkIn') || '',
      checkOut: formData.get('checkOut') || '',
      guests: formData.get('guests') || '1',
      message: formData.get('message')?.trim() || ''
    };

    // Validation
    if (!data.name) {
      toast.error('Please enter your name');
      return;
    }

    if (!data.email || !isValidEmail(data.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (data.phone && !isValidPhone(data.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (data.checkIn && data.checkOut) {
      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);
      if (checkOut <= checkIn) {
        toast.error('Check-out date must be after check-in date');
        return;
      }
    }

    // Track analytics - form submission
    if (typeof trackFormStart === 'function') {
      trackFormStart();
    }

    // Track stay duration for analytics
    if (data.checkIn && data.checkOut) {
      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      if (typeof trackStayDuration === 'function') {
        trackStayDuration(nights);
      }
    }

    // Set user ID for analytics if email available
    if (data.email && typeof setUserID === 'function') {
      setUserID(data.email);
    }

    // Log booking data (in production, send to server)
    console.log('Booking Data:', data);

    // Show success message
    toast.success('Thank you for your booking request! We will contact you soon.');
    contactForm.reset();
  });
}

// ============================================
// AOS INITIALIZATION
// ============================================

/**
 * Initialize AOS (Animate On Scroll) library
 */
function initAOS() {
  if (typeof AOS === 'undefined') {
    // Load AOS library dynamically
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
    script.onload = () => {
      AOS.init({
        duration: CONFIG.AOS_DURATION,
        easing: 'ease-in-out',
        once: true,
        offset: 100
      });
    };
    script.onerror = () => console.warn('Failed to load AOS library');
    document.head.appendChild(script);

    // Load AOS styles
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/aos@2.3.1/dist/aos.css';
    document.head.appendChild(css);
  } else {
    // AOS already loaded
    AOS.init({
      duration: CONFIG.AOS_DURATION,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }
}

// ============================================
// SCROLL LOCK UTILITIES
// ============================================

/**
 * Lock body scroll (for modals)
 */
function lockScroll() {
  document.body.style.overflow = 'hidden';
}

/**
 * Unlock body scroll
 */
function unlockScroll() {
  document.body.style.overflow = '';
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Main initialization function
 */
async function init() {
  // Initialize critical UI components FIRST - these must always work
  initHamburgerMenu();
  initLanguageSelector();
  initBackToTopButton();
  initAnchorLinks();

  try {
    // Initialize Google Analytics 4
    if (typeof initializeAnalytics === 'function') {
      initializeAnalytics('G-R0Z8HFEEVT');
      console.log('✓ Google Analytics 4 initialized');
    }

    // Load translations (non-blocking for UI)
    await translator.loadTranslations();
    translator.updatePageTranslations();

    console.log('✓ Translations loaded');
  } catch (error) {
    console.warn('Translations failed to load, using defaults:', error);
  }

  try {
    // Initialize remaining components
    initLazyLoading();
    initContactForm();
    initAOS();

    // Trigger initial scroll/resize calculations
    scrollManager.updateActiveNavLink();
    scrollManager.updateParallax();

    console.log('✓ Application initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
