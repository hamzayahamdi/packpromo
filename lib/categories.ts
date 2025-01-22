export const PREDEFINED_CATEGORIES = {
  "TOUS": [
    "Tous les produits"
  ],
  "SALONS": [
    "Salon en L",
    "Salon en U"
  ],
  "CANAPÉS": [
    "Canapé 2 Places",
    "Canapé 3 Places",
    "Fauteuils"
  ],
  "CHAMBRE": [
    "Lits",
    "Matelas",
    "Table de Chevet"
  ],
  "TABLES": [
    "Table Basse",
    "Table de Salle à Manger",
    "Table D'appoint"
  ],
  "CHAISES": [
    "Chaises"
  ],
  "JARDIN": [
    "Ensemble D'extérieur",
    "Salle à Manger + Chaises"
  ],
  "MEUBLES": [
    "Consoles",
    "Armoires",
    "Bibliothèques",
    "Buffets",
    "Meubles TV"
  ],
  "DECO": [
    "Mirroirs"
  ]
} as const;

export type MainCategory = keyof typeof PREDEFINED_CATEGORIES;
export type SubCategory = typeof PREDEFINED_CATEGORIES[MainCategory][number];
