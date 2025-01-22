import { Product } from './types'
import prisma from '@/lib/prisma'

export async function getProducts(): Promise<{ products: Product[] }> {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        ref: true,
        dimensions: true,
        mainCategory: true,
        subCategory: true,
        initialPrice: true,
        topDealsPrice: true,
        mainImage: true,
        gallery: true,
        isActive: true
      },
    })
    return { products }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [] }
  }
}

