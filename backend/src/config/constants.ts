// backend/src/config/constants.ts

// Main Navigation Categories for the store
export const CATEGORIES = [
  'Skincare', 
  'Haircare', 
  'Bodycare', 
  'Baby & Mother', 
  'Hygiene', 
  'Supplements & Wellness'
] as const;
export type Category = typeof CATEGORIES[number];

export const SKIN_TYPES = ['Normal', 'Oily', 'Dry', 'Combination', 'Sensitive'] as const;
export type SkinType = typeof SKIN_TYPES[number];

export const SKIN_CONCERNS = [
  'Acne', 
  'Aging/Wrinkles', 
  'Dark Spots/Hyperpigmentation', 
  'Redness/Rosacea', 
  'Dehydration', 
  'Dullness'
] as const;
export type SkinConcern = typeof SKIN_CONCERNS[number];

export const HAIR_TYPES = [
  'Normal', 
  'Oily', 
  'Dry', 
  'Damaged/Frizzy', 
  'Thinning/Hair Loss', 
  'Dandruff-Prone'
] as const;
export type HairType = typeof HAIR_TYPES[number];

export const ALLERGIES = [
  'Fragrance', 
  'Parabens', 
  'Sulfates', 
  'Silicones', 
  'Essential Oils'
] as const;
export type Allergy = typeof ALLERGIES[number];

// Standardized tags for products (feeds our matching recommendation logic)
export const PRODUCT_TAGS = [
  // Skin Suitability
  'for-normal-skin', 'for-oily-skin', 'for-dry-skin', 'for-combination-skin', 'for-sensitive-skin',
  
  // Skin Concern Treatment
  'anti-acne', 'anti-aging', 'brightening', 'soothing', 'hydrating',
  
  // Hair Suitability & Treatment
  'for-normal-hair', 'for-oily-hair', 'for-dry-hair', 'for-damaged-hair', 'hair-loss', 'anti-dandruff',
  
  // Allergens Contained
  'contains-fragrance', 'contains-parabens', 'contains-sulfates', 'contains-silicones', 'contains-essential-oils',

  // Steps in Skincare Routine
  'cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'mask',

  // Steps in Haircare Routine
  'shampoo', 'conditioner', 'hair-mask', 'hair-serum'
] as const;
export type ProductTag = typeof PRODUCT_TAGS[number];

export const DELIVERY_COMPANIES = ['Yalidine', 'Yassir Express'] as const;
export type DeliveryCompany = typeof DELIVERY_COMPANIES[number];

export const DELIVERY_TYPES = ['HOME_DELIVERY', 'STOP_DESK'] as const;
export type DeliveryType = typeof DELIVERY_TYPES[number];