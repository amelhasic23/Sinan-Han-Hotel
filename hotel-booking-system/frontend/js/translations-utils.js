/**
 * Translation DOM Utilities
 * Separates DOM manipulation from translation logic
 */

/**
 * Update all i18n elements on page with translations
 * @param {object} loader - Translation loader instance with get() method
 */
function updatePageTranslations(loader) {
  if (!loader || typeof loader.get !== 'function') {
    console.warn('Invalid translation loader');
    return;
  }

  // Update text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = loader.get(key);
    el.textContent = text;
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const text = loader.get(key);
    el.setAttribute('placeholder', text);
  });
}

/**
 * Update translation for a specific element
 * @param {string} selector - CSS selector for element
 * @param {string} key - Translation key
 * @param {object} loader - Translation loader instance
 */
function updateElementTranslation(selector, key, loader) {
  const el = document.querySelector(selector);
  if (el && loader) {
    el.textContent = loader.get(key);
  }
}

/**
 * Get translated text without updating DOM
 * @param {string} key - Translation key
 * @param {object} loader - Translation loader instance
 */
function getTranslation(key, loader) {
  if (!loader || typeof loader.get !== 'function') {
    return key;
  }
  return loader.get(key);
}

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updatePageTranslations,
    updateElementTranslation,
    getTranslation
  };
}
