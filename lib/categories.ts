export const PREDEFINED_CATEGORIES = {
  "TOUS": [
    "Tous les produits"
  ],
  "SALLE À MANGER": [
    "Salle à Manger"
  ],
  "SÉJOUR": [
    "Séjour"
  ],
  "CHAMBRE À COUCHER": [
    "Chambre à coucher"
  ],
  "ENSEMBLES DE JARDIN": [
    "Ensembles de Jardin"
  ]
} as const;

export type MainCategory = keyof typeof PREDEFINED_CATEGORIES;
export type SubCategory = typeof PREDEFINED_CATEGORIES[MainCategory][number];
