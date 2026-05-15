// ============================================
// HOTEL API CLIENT
// ============================================

class HotelAPIClient {
  constructor(baseURL = null) {
    // Auto-detect environment: use current origin in production, localhost for dev
    if (!baseURL) {
      const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      this.baseURL = isLocalhost
        ? 'http://localhost:10000'
        : window.location.origin;
    } else {
      this.baseURL = baseURL;
    }
    this.cache = {};
    this.cacheTimeout = 3600000; // 1 hour
    console.log(`🔗 API Client initialized with baseURL: ${this.baseURL}`);
  }

  /**
   * Make API request with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API Request Failed (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Get complete hotel information
   */
  async getHotel() {
    if (this.cache.hotel && this.isValidCache('hotel')) {
      return this.cache.hotel;
    }

    try {
      const data = await this.request('/hotel');
      this.cache.hotel = { data, timestamp: Date.now() };
      return data;
    } catch (error) {
      console.error('Failed to fetch hotel data:', error);
      return null;
    }
  }

  /**
   * Get room prices
   */
  async getPrices() {
    if (this.cache.prices && this.isValidCache('prices')) {
      return this.cache.prices;
    }

    try {
      const data = await this.request('/hotel/prices');
      this.cache.prices = { data, timestamp: Date.now() };
      return data;
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      return null;
    }
  }

  /**
   * Get all policies (hotel + cancellation + privacy)
   */
  async getPolicies() {
    if (this.cache.policies && this.isValidCache('policies')) {
      return this.cache.policies;
    }

    try {
      const data = await this.request('/hotel/policies');
      this.cache.policies = { data, timestamp: Date.now() };
      return data;
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      return null;
    }
  }

  /**
   * Get cancellation policy
   */
  async getCancellationPolicy() {
    if (this.cache.cancellation && this.isValidCache('cancellation')) {
      return this.cache.cancellation;
    }

    try {
      const data = await this.request('/hotel/cancellation');
      this.cache.cancellation = { data, timestamp: Date.now() };
      return data;
    } catch (error) {
      console.error('Failed to fetch cancellation policy:', error);
      return null;
    }
  }

  /**
   * Get privacy policy
   */
  async getPrivacyPolicy() {
    if (this.cache.privacy && this.isValidCache('privacy')) {
      return this.cache.privacy;
    }

    try {
      const data = await this.request('/hotel/privacy');
      this.cache.privacy = { data, timestamp: Date.now() };
      return data;
    } catch (error) {
      console.error('Failed to fetch privacy policy:', error);
      return null;
    }
  }

  /**
   * Create a booking
   */
  async createBooking(bookingData) {
    try {
      const data = await this.request('/bookings', {
        method: 'POST',
        body: bookingData
      });
      return data;
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    }
  }

  /**
   * Check if cache is still valid
   */
  isValidCache(key) {
    const cached = this.cache[key];
    if (!cached) return false;
    return (Date.now() - cached.timestamp) < this.cacheTimeout;
  }

  /**
   * Clear cache
   */
  clearCache(key = null) {
    if (key) {
      delete this.cache[key];
    } else {
      this.cache = {};
    }
  }
}

// Create global instance
const hotelAPI = new HotelAPIClient();
