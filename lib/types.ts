export const SubCategory = {
  'SALONS': ['Salon en L', 'Salon en U'],
  'CANAPES': ['Canapé 2 Places', 'Canapé 3 Places', 'Fauteuils'],
  'CHAMBRE': ['Lits', 'Matelas', 'Table de Chevet'],
  'TABLES': ['Tables Basses', 'Tables à Manger', 'Tables d\'Appoint'],
  'CHAISES': ['Chaises de Salle à Manger', 'Chaises de Bureau'],
  'RANGEMENT': ['Armoires', 'Bibliothèques', 'Commodes', 'Buffets'],
  'DECO': ['Tapis', 'Miroirs', 'Tableaux', 'Vases']
} as const;

export type MainCategory = keyof typeof SubCategory;
export type SubCategoryType = typeof SubCategory[MainCategory][number];

export interface Product {
  id: string;
  ref: string;
  name: string;
  slug: string;
  dimensions: string;
  mainCategory: string;
  subCategory: string;
  initialPrice: number;
  topDealsPrice: number;
  mainImage: string;
  gallery: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StoreAvailability {
  'Stock Casa': number;
  'Stock Rabat': number;
  'Stock Marrakech': number;
  'Stock Tanger': number;
}

