import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProductGrid from '@/components/ProductGrid'
import PageLayout from '@/components/PageLayout'
import { Product } from '@prisma/client'

async function getProducts(category: string) {
  try {
    // Decode and normalize the category
    const decodedCategory = decodeURIComponent(category).toLowerCase()
    console.log('Processing category:', decodedCategory)

    // For 'tous' category, use EXACTLY the same logic as homepage
    if (decodedCategory === 'tous') {
      const products = await prisma.product.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      })
      return products
    }

    // For other categories - use raw SQL for better accent handling
    const products = await prisma.$queryRaw<Product[]>`
      SELECT * FROM "Product"
      WHERE LOWER(unaccent("mainCategory")) LIKE LOWER(unaccent(${`%${decodedCategory}%`}))
      OR LOWER(unaccent("subCategory")) LIKE LOWER(unaccent(${`%${decodedCategory}%`}))
      ORDER BY "createdAt" DESC
    `

    if (!products.length && decodedCategory !== 'tous') {
      // Log the query parameters for debugging
      console.log('No products found for category:', decodedCategory)
      return notFound()
    }

    console.log(`Found ${products.length} products for category:`, decodedCategory)
    return products
  } catch (error: any) {
    console.error('Error fetching products:', error)
    console.error('Error details:', error?.message || 'Unknown error')
    return []
  }
}

export default async function CategoryPage({
  params
}: {
  params: { category: string }
}) {
  const products = await getProducts(params.category)

  return (
    <PageLayout>
      <ProductGrid products={products} />
    </PageLayout>
  )
} 