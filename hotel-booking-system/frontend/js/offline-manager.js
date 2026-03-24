/**
 * Offline Request Manager
 * Queues failed requests for retry when online
 */

class OfflineRequestManager {
  constructor() {
    this.queue = [];
    this.storageKey = 'offline_request_queue';
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Load queued requests from localStorage
   */
  loadQueue() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.queue = stored ? JSON.parse(stored) : [];
      console.log(`📦 Loaded ${this.queue.length} offline requests`);
    } catch (e) {
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  saveQueue() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('Failed to save offline queue:', e);
    }
  }

  /**
   * Queue a request for retry
   */
  queueRequest(method, url, options = {}) {
    const request = {
      id: Date.now(),
      method,
      url,
      options,
      timestamp: new Date().toISOString(),
      retries: 0
    };

    this.queue.push(request);
    this.saveQueue();
    console.log(`📥 Queued request: ${method} ${url}`);
    return request.id;
  }

  /**
   * Setup listener for online event
   */
  setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('🟢 Online! Processing offline requests...');
      this.processQueue();
    });
  }

  /**
   * Process all queued requests
   */
  async processQueue() {
    if (this.queue.length === 0) {
      console.log('✓ Offline queue is empty');
      return;
    }

    const processed = [];

    for (const request of this.queue) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          ...request.options
        });

        if (response.ok) {
          console.log(`✓ Processed: ${request.method} ${request.url}`);
          processed.push(request.id);
        } else {
          console.warn(`⚠ Failed: ${request.method} ${request.url} (${response.status})`);
        }
      } catch (error) {
        console.warn(`⚠ Error processing: ${request.method} ${request.url}`, error.message);
      }
    }

    // Remove processed requests
    this.queue = this.queue.filter(r => !processed.includes(r.id));
    this.saveQueue();

    console.log(`✓ Processed ${processed.length} requests, ${this.queue.length} remaining`);
  }

  /**
   * Clear entire queue
   */
  clearQueue() {
    this.queue = [];
    this.saveQueue();
    console.log('🗑️ Offline queue cleared');
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      count: this.queue.length,
      oldest: this.queue[0]?.timestamp,
      requests: this.queue.map(r => ({ method: r.method, url: r.url }))
    };
  }
}

// Initialize offline manager
const offlineManager = new OfflineRequestManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { offlineManager, OfflineRequestManager };
}
