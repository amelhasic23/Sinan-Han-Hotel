/**
 * Minimal Translation Loader Module
 * Handles loading and storing translations without DOM manipulations
 * Keep this lightweight (~2KB) to allow lazy loading
 */

/**
 * Simple translation loader - handles JSON loading and caching
 */
class MinimalTranslationLoader {
  constructor() {
    this.translations = {};
    this.currentLanguage = this.getSavedLanguage();
    this.supportedLanguages = ['en', 'bs', 'de', 'fr', 'it'];
  }

  /**
   * Get saved language from localStorage or default
   */
  getSavedLanguage() {
    const saved = localStorage.getItem('language');
    return this.supportedLanguages.includes(saved) ? saved : 'en';
  }

  /**
   * Load all translation files
   */
  async load() {
    const promises = this.supportedLanguages.map(lang =>
      fetch(`/languages/${lang}.json`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    );

    const results = await Promise.all(promises);
    this.supportedLanguages.forEach((lang, i) => {
      this.translations[lang] = results[i] || {};
    });
  }

  /**
   * Get translation by key
   */
  get(key) {
    const text = this.translations[this.currentLanguage]?.[key];
    return text || key;
  }

  /**
   * Change language
   */
  setLanguage(lang) {
    if (this.supportedLanguages.includes(lang)) {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      return true;
    }
    return false;
  }
}

// Export for use in other modules
const translationLoader = new MinimalTranslationLoader();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { translationLoader, MinimalTranslationLoader };
}
