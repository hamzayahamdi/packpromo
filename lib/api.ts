import { Product } from '@/lib/types'

export interface StoreAvailability {
  'Stock Casa': number;
  'Stock Rabat': number;
  'Stock Marrakech': number;
  'Stock Tanger': number;
}

export async function fetchStoreAvailability(productRef: string): Promise<StoreAvailability> {
  const response = await fetch(`https://phpstack-937973-4763176.cloudwaysapps.com/data1.php?type=search&query=${encodeURIComponent(productRef)}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch store availability');
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  if (data.length === 0) {
    throw new Error('No availability data found for this product');
  }

  return {
    'Stock Casa': parseInt(data[0]['Stock Casa']),
    'Stock Rabat': parseInt(data[0]['Stock Rabat']),
    'Stock Marrakech': parseInt(data[0]['Stock Marrakech']),
    'Stock Tanger': parseInt(data[0]['Stock Tanger']),
  };
}

interface FetchProductsParams {
  category?: string;
  page?: number;
}

export async function fetchProducts({ category, page = 1 }: FetchProductsParams) {
  try {
    const url = category 
      ? `/api/products/category/${encodeURIComponent(category)}?page=${page}`
      : `/api/products?page=${page}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], hasMore: false };
  }
}

