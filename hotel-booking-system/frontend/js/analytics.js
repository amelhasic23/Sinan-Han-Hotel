/**
 * Google Analytics 4 Tracking Module
 * Handles all conversion tracking events for the hotel booking funnel
 */

/**
 * Initialize Google Analytics 4
 * @param {string} measurementId - GA4 Measurement ID (G-XXXXXXXXXX)
 */
function initializeAnalytics(measurementId) {
  if (!measurementId || !measurementId.startsWith('G-')) {
    console.warn('Google Analytics: Invalid or missing Measurement ID');
    return false;
  }

  // Initialize gtag if not already done
  if (typeof gtag === 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    gtag('js', new Date());
    gtag('config', measurementId, {
      'anonymize_ip': true,
      'allow_google_signals': false,
      'allow_ad_personalization_signals': false
    });
  }

  return true;
}

/**
 * Track a custom event in Google Analytics
 * @param {string} eventName - Event name (snake_case)
 * @param {object} eventData - Event data object with properties
 */
function trackEvent(eventName, eventData = {}) {
  if (typeof gtag === 'undefined') {
    console.warn('Google Analytics: gtag not initialized. Call initializeAnalytics first.');
    return false;
  }

  // Validate event name
  if (!eventName || typeof eventName !== 'string') {
    console.warn('Google Analytics: Invalid event name:', eventName);
    return false;
  }

  try {
    gtag('event', eventName, eventData);
    console.log(`📊 GA Event: ${eventName}`, eventData);
    return true;
  } catch (error) {
    console.error('Google Analytics: Error tracking event:', error);
    return false;
  }
}

/**
 * Set user properties in Google Analytics
 * @param {object} userProperties - User properties to set
 */
function setUserProperties(userProperties) {
  if (typeof gtag === 'undefined') {
    console.warn('Google Analytics: gtag not initialized');
    return false;
  }

  if (!userProperties || typeof userProperties !== 'object') {
    console.warn('Google Analytics: Invalid user properties');
    return false;
  }

  try {
    gtag('set', { 'user_properties': userProperties });
    console.log('📊 GA User Properties Set:', userProperties);
    return true;
  } catch (error) {
    console.error('Google Analytics: Error setting user properties:', error);
    return false;
  }
}

/**
 * Set User-ID for cross-device tracking
 * @param {string} userId - Unique user identifier (usually email)
 */
function setUserID(userId) {
  if (typeof gtag === 'undefined') {
    console.warn('Google Analytics: gtag not initialized');
    return false;
  }

  if (!userId || typeof userId !== 'string') {
    console.warn('Google Analytics: Invalid User ID');
    return false;
  }

  try {
    gtag('config', {
      'user_id': userId
    });
    console.log('📊 GA User ID Set:', userId);
    return true;
  } catch (error) {
    console.error('Google Analytics: Error setting User ID:', error);
    return false;
  }
}

/**
 * Track booking form start event
 * User has started filling out booking form
 */
function trackFormStart() {
  trackEvent('form_start', {
    'event_category': 'booking_funnel',
    'event_label': 'user_started_form'
  });
}

/**
 * Track room search event
 * @param {number} roomCount - Number of rooms found
 */
function trackRoomSearch(roomCount) {
  trackEvent('room_search', {
    'event_category': 'booking_funnel',
    'event_label': 'searched_available_rooms',
    'rooms_found': roomCount
  });
}

/**
 * Track room selection event
 * @param {string} roomId - Selected room ID
 * @param {number} price - Room price
 * @param {string} roomName - Room name/type
 */
function trackRoomSelected(roomId, price, roomName) {
  trackEvent('room_selected', {
    'event_category': 'booking_funnel',
    'event_label': 'user_selected_room',
    'room_id': roomId || 'unknown',
    'room_name': roomName || 'Unknown Room',
    'value': price || 0,
    'currency': 'BAM'
  });

  // Also track as e-commerce item for funnel analysis
  gtag('event', 'view_item', {
    'items': [
      {
        'item_id': roomId,
        'item_name': roomName,
        'price': price,
        'currency': 'BAM'
      }
    ]
  });
}

/**
 * Track payment initiation event
 * @param {number} amount - Payment amount
 * @param {string} currency - Currency code
 */
function trackPaymentInit(amount, currency = 'BAM') {
  trackEvent('payment_init', {
    'event_category': 'booking_funnel',
    'event_label': 'initiated_payment',
    'value': amount,
    'currency': currency
  });

  // Also track as begin_checkout for e-commerce
  gtag('event', 'begin_checkout', {
    'value': amount,
    'currency': currency
  });
}

/**
 * Track successful payment completion
 * @param {number} amount - Payment amount
 * @param {string} transactionId - Transaction ID
 */
function trackPaymentComplete(amount, transactionId) {
  trackEvent('payment_complete', {
    'event_category': 'booking_funnel',
    'event_label': 'payment_successful',
    'value': amount,
    'currency': 'BAM',
    'transaction_id': transactionId || 'unknown'
  });

  // Also track as purchase for e-commerce
  gtag('event', 'purchase', {
    'transaction_id': transactionId,
    'value': amount,
    'currency': 'BAM',
    'tax': 0,
    'shipping': 0
  });
}

/**
 * Track payment failure event
 * @param {string} reason - Failure reason
 */
function trackPaymentFailed(reason = 'declined') {
  trackEvent('payment_failed', {
    'event_category': 'booking_funnel',
    'event_label': 'payment_declined',
    'failure_reason': reason
  });
}

/**
 * Track language selection
 * @param {string} language - Selected language code
 */
function trackLanguageSelected(language) {
  setUserProperties({
    'language': language
  });

  trackEvent('language_changed', {
    'event_category': 'user_preferences',
    'event_label': 'selected_language',
    'language': language
  });
}

/**
 * Track stay duration for analysis
 * @param {number} nights - Number of nights
 */
function trackStayDuration(nights) {
  if (nights > 0) {
    setUserProperties({
      'stay_duration': nights
    });
  }
}

/**
 * Track error for debugging
 * @param {string} errorType - Type of error
 * @param {string} errorMessage - Error message
 */
function trackError(errorType, errorMessage) {
  trackEvent('booking_error', {
    'event_category': 'errors',
    'event_label': errorType,
    'error_message': errorMessage
  });
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeAnalytics,
    trackEvent,
    setUserProperties,
    setUserID,
    trackFormStart,
    trackRoomSearch,
    trackRoomSelected,
    trackPaymentInit,
    trackPaymentComplete,
    trackPaymentFailed,
    trackLanguageSelected,
    trackStayDuration,
    trackError
  };
}
