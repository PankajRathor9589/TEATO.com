/**
 * Default / fallback food images for menu items and hero.
 * Used when no custom image is uploaded so the platform looks premium out of the box.
 * High-quality Unsplash URLs (w=400 for consistent size, q=80 for balance).
 */

const BY_CATEGORY = {
  starters: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
  'main-course': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  maincourse: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
  desserts: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
};

const FALLBACK_FOOD = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';

/**
 * Get default image URL for a menu item (when item.image is null/empty).
 * @param {Object} item - Menu item with optional category (populated or id)
 * @param {string} [item.category] - Category name or object with .name / .slug
 * @returns {string} Image URL
 */
function getDefaultImageForItem(item) {
  if (!item) return FALLBACK_FOOD;
  const cat = item.category;
  const slug = (cat?.slug || (cat?.name && cat.name.toLowerCase().replace(/\s+/g, '-')) || '').toLowerCase();
  const name = (cat?.name || '').toLowerCase().replace(/\s+/g, '-');
  return BY_CATEGORY[slug] || BY_CATEGORY[name] || FALLBACK_FOOD;
}

/**
 * Apply default image to a single item (mutates or returns new object).
 * @param {Object} item - Menu item (plain object)
 * @returns {Object} Item with image set (default if was empty)
 */
function applyDefaultImage(item) {
  if (!item) return item;
  const url = item.image && item.image.trim() ? item.image : getDefaultImageForItem(item);
  return { ...item, image: url };
}

/**
 * Apply default images to an array of menu items.
 */
function applyDefaultImages(items) {
  if (!Array.isArray(items)) return items;
  return items.map(applyDefaultImage);
}

module.exports = {
  getDefaultImageForItem,
  applyDefaultImage,
  applyDefaultImages,
  FALLBACK_FOOD,
  BY_CATEGORY,
};
