export const PREDEFINED_CATEGORIES = {
  "TOUS": [
    "Tous les produits"
  ],
  "SALLE A MANGER": [
    "Salle à Manger"
  ],
  "SEJOUR": [
    "Séjour"
  ],
  "CHAMBRE A COUCHER": [
    "Chambre à coucher"
  ],
  "ENSEMBLES DE JARDIN": [
    "Ensembles de Jardin"
  ]
} as const;

export type MainCategory = keyof typeof PREDEFINED_CATEGORIES;
export type SubCategory = typeof PREDEFINED_CATEGORIES[MainCategory][number];

// Export the category display names
export const CATEGORY_DISPLAY_NAMES: Record<MainCategory, string> = {
  "TOUS": "Tous",
  "SALLE A MANGER": "Salle à Manger",
  "SEJOUR": "Séjour",
  "CHAMBRE A COUCHER": "Chambre à coucher",
  "ENSEMBLES DE JARDIN": "Ensembles de Jardin"
} as const;

// Update the category to slug mapping
export const CATEGORY_TO_SLUG: Record<MainCategory, string> = {
  "TOUS": "tous",
  "SALLE A MANGER": "salle-a-manger",
  "SEJOUR": "sejour",
  "CHAMBRE A COUCHER": "chambre-a-coucher",
  "ENSEMBLES DE JARDIN": "ensembles-de-jardin"
} as const;

// Update the slug to category mapping
export const SLUG_TO_CATEGORY: Record<string, MainCategory> = Object.entries(CATEGORY_TO_SLUG).reduce(
  (acc, [category, slug]) => ({
    ...acc,
    [slug]: category as MainCategory,
  }),
  {} as Record<string, MainCategory>
);

export const normalizeCategory = (category: string): string => {
  return category
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toUpperCase();
};

export const isValidCategory = (category: string): boolean => {
  const normalizedCategory = normalizeCategory(category);
  return Object.keys(PREDEFINED_CATEGORIES).includes(normalizedCategory);
};

export const getCategoryDisplay = (category: MainCategory): string => {
  return CATEGORY_DISPLAY_NAMES[category];
};

// Add a mapping for database categories
export const DISPLAY_TO_DB_CATEGORY: Record<MainCategory, string> = {
  "TOUS": "TOUS",
  "SALLE A MANGER": "SALLE A MANGER",
  "SEJOUR": "SEJOUR",
  "CHAMBRE A COUCHER": "CHAMBRE A COUCHER",
  "ENSEMBLES DE JARDIN": "ENSEMBLES DE JARDIN"
} as const;
