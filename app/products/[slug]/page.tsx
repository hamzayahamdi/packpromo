import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import QuickView from '@/components/QuickView'
import Header from '@/components/Header'
import { notFound } from 'next/navigation'

interface Props {
  params: {
    slug: string
  }
}

// Force dynamic rendering for product pages
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: params.slug,
      },
    })

    if (!product) {
      return {
        title: 'Product Not Found - Top Deal Maroc',
      }
    }

    return {
      title: `${product.name} - Top Deal Maroc`,
      description: `${product.name} - ${product.subCategory} - ${product.dimensions}`,
      openGraph: {
        images: [product.mainImage],
      },
    }
  } catch (error) {
    console.error('Error fetching product metadata:', error)
    return {
      title: 'Top Deal Maroc',
    }
  }
}

export default async function ProductPage({ params }: Props) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: params.slug,
      },
    })

    if (!product) {
      notFound()
    }

    return (
      <>
        <Header />
        <main className="pt-[80px]">
          <QuickView product={product} fullPage={true} />
        </main>
      </>
    )
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

// Remove generateStaticParams to ensure dynamic routing
  