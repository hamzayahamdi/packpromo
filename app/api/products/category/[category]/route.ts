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
    
    const decodedCategory = decodeURIComponent(params.category)
      .toUpperCase()
      .replace(/-/g, ' ')
    
    console.log('Requested category:', decodedCategory)

    // Handle both /categories/tous and homepage
    if (decodedCategory === 'TOUS' || decodedCategory === '' || !decodedCategory) {
      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: skip,
        }),
        prisma.product.count({ where: { isActive: true } })
      ])
      
      return NextResponse.json({
        success: true,
        products,
        hasMore: totalCount > skip + products.length,
        totalCount
      })
    }

    // Map URL slugs to actual category names
    const categoryMap: { [key: string]: string } = {
      'SALLE A MANGER': 'SALLE A MANGER',
      'SEJOUR': 'SEJOUR',
      'CHAMBRE A COUCHER': 'CHAMBRE A COUCHER',
      'ENSEMBLES DE JARDIN': 'ENSEMBLES DE JARDIN'
    }

    const actualCategory = categoryMap[decodedCategory]

    // For specific categories
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { mainCategory: actualCategory },
            { subCategory: actualCategory }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
      }),
      prisma.product.count({
        where: {
          isActive: true,
          OR: [
            { mainCategory: actualCategory },
            { subCategory: actualCategory }
          ]
        }
      })
    ])

    return NextResponse.json({
      success: true,
      products: products || [],
      hasMore: totalCount > skip + (products?.length || 0),
      totalCount: totalCount || 0
    })

  } catch (error: any) {
    console.error('Error in API route:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products',
      details: error?.message || 'Unknown error',
      products: [],
      hasMore: false,
      totalCount: 0
    })
  }
} 