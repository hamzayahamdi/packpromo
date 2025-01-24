import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProductGrid from '@/components/ProductGrid'
import PageLayout from '@/components/PageLayout'
import { Product } from '@prisma/client'
import { 
  CATEGORY_DISPLAY_NAMES, 
  MainCategory, 
  SLUG_TO_CATEGORY,
  DISPLAY_TO_DB_CATEGORY 
} from '@/lib/categories'

// Helper function to get display name
function getCategoryDisplayName(category: string): string {
  const normalizedCategory = category
    .toUpperCase()
    .replace(/-/g, ' ') as MainCategory;
  
  return CATEGORY_DISPLAY_NAMES[normalizedCategory] || category;
}

async function getProducts(category: string) {
  try {
    // First, convert the URL slug to the proper category format
    const decodedCategory = decodeURIComponent(category);
    const mainCategory = SLUG_TO_CATEGORY[decodedCategory];
    
    console.log('URL category:', decodedCategory);
    console.log('Mapped to category:', mainCategory);

    // For 'TOUS' category or invalid category
    if (!mainCategory || mainCategory === 'TOUS') {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
      return products;
    }

    // Get the database category format
    const dbCategory = DISPLAY_TO_DB_CATEGORY[mainCategory];
    console.log('Database category:', dbCategory);

    // For specific categories
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { mainCategory: dbCategory },
          { subCategory: dbCategory }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${products.length} products for category:`, dbCategory);
    return products;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    console.error('Error details:', error?.message || 'Unknown error');
    return [];
  }
}

export default async function CategoryPage({
  params
}: {
  params: { category: string }
}) {
  const products = await getProducts(params.category)
  const currentCategory = SLUG_TO_CATEGORY[params.category]
  const dbCategory = currentCategory ? DISPLAY_TO_DB_CATEGORY[currentCategory] : undefined

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
      <ProductGrid 
        products={products} 
        category={dbCategory}
        initialCategory={params.category}
      />
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