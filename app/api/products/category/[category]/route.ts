import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Product } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '16')
    const skip = (page - 1) * limit
    
    const decodedCategory = decodeURIComponent(params.category).toLowerCase()
    console.log('Requested category:', decodedCategory)

    // Handle both /categories/tous and homepage
    if (decodedCategory === 'tous' || !decodedCategory) {
      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          orderBy: {
            createdAt: 'desc'
          },
          take: limit,
          skip: skip,
        }),
        prisma.product.count()
      ])
      
      return NextResponse.json({
        products,
        hasMore: totalCount > skip + products.length
      })
    }

    // For specific categories - use raw SQL for better accent handling
    const [products, totalCount] = await Promise.all([
      prisma.$queryRaw<Product[]>`
        SELECT * FROM "Product"
        WHERE LOWER(unaccent("mainCategory")) LIKE LOWER(unaccent(${`%${decodedCategory}%`}))
        OR LOWER(unaccent("subCategory")) LIKE LOWER(unaccent(${`%${decodedCategory}%`}))
        ORDER BY "createdAt" DESC
        LIMIT ${limit}
        OFFSET ${skip}
      `,
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM "Product"
        WHERE LOWER(unaccent("mainCategory")) LIKE LOWER(unaccent(${`%${decodedCategory}%`}))
        OR LOWER(unaccent("subCategory")) LIKE LOWER(unaccent(${`%${decodedCategory}%`}))
      `
    ])

    console.log(`Found ${products.length} products for category ${decodedCategory}`)

    return NextResponse.json({
      products,
      hasMore: Number(totalCount[0].count) > skip + products.length
    })

  } catch (error: any) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch products', 
        details: error?.message || 'Unknown error'
      }, 
      { status: 500 }
    )
  }
} 