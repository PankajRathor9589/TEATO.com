/**
 * Default / fallback image URLs for menu items when API doesn't provide one.
 * Keeps UI consistent and premium even without custom uploads.
 */

export const FALLBACK_FOOD =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';

/**
 * @param {Object} item - Menu item with optional image
 * @returns {string} Image URL to display
 */
export function getItemImage(item) {
  return item?.image?.trim() ? item.image : FALLBACK_FOOD;
}
