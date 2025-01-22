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
