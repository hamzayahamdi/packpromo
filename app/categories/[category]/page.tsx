import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProductGrid from '@/components/ProductGrid'
import PageLayout from '@/components/PageLayout'
import { Product } from '@prisma/client'
import { CATEGORY_DISPLAY_NAMES, MainCategory } from '@/lib/categories'

// Helper function to get display name
function getCategoryDisplayName(category: string): string {
  const normalizedCategory = category
    .toUpperCase()
    .replace(/-/g, ' ') as MainCategory;
  
  return CATEGORY_DISPLAY_NAMES[normalizedCategory] || category;
}

async function getProducts(category: string) {
  try {
    const decodedCategory = decodeURIComponent(category)
      .toUpperCase()
      .replace(/-/g, ' ')

    console.log('Processing category:', decodedCategory)

    // For 'TOUS' category or empty category (homepage)
    if (decodedCategory === 'TOUS' || decodedCategory === '' || !decodedCategory) {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return products
    }

    // Map URL slugs to actual category names
    const categoryMap: { [key: string]: string } = {
      'SALLE A MANGER': 'SALLE A MANGER',
      'SEJOUR': 'SEJOUR',
      'CHAMBRE A COUCHER': 'CHAMBRE A COUCHER',
      'ENSEMBLES DE JARDIN': 'ENSEMBLES DE JARDIN'
    }

    const actualCategory = categoryMap[decodedCategory]
    console.log('Mapped to actual category:', actualCategory)

    if (!actualCategory) {
      console.log('Invalid category:', decodedCategory)
      return []
    }

    // For specific categories
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { mainCategory: actualCategory },
          { subCategory: actualCategory }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) || []

    console.log(`Found ${products.length} products for category:`, actualCategory)
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

  // If no products found, show message without category name
  if (!products.length) {
    return (
      <PageLayout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-gray-700">
            Aucun produit trouvé dans cette catégorie
          </h2>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <ProductGrid products={products} />
    </PageLayout>
  )
}

// Dynamic metadata for tab title
export async function generateMetadata({ params }: { params: { category: string } }) {
  const categoryDisplayName = getCategoryDisplayName(params.category)
  
  return {
    title: categoryDisplayName
  }
} 