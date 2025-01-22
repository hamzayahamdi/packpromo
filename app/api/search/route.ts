import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')

    if (!query) {
      return NextResponse.json([])
    }

    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { ref: { contains: query, mode: 'insensitive' } },
              { mainCategory: { contains: query, mode: 'insensitive' } },
              { subCategory: { contains: query, mode: 'insensitive' } }
            ]
          },
          {
            ...(category && category !== 'all' ? { mainCategory: category } : {}),
            isActive: true
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
} 