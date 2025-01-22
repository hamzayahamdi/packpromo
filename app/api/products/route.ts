import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PREDEFINED_CATEGORIES, normalizeCategory } from '@/lib/categories';

const ITEMS_PER_PAGE = 12;

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const product = await prisma.product.create({
      data: {
        ...data,
        isActive: true,
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active') === 'true';

    const skip = (page - 1) * ITEMS_PER_PAGE;
    
    console.log('Requested category:', category);

    const where: any = {
      isActive: true,
    };

    if (category && category !== 'TOUS') {
      // Keep the exact category name with accents
      where.mainCategory = {
        equals: category,
        mode: 'insensitive'  // This will make the search case-insensitive but keep accents
      };
    }

    // Debug log the query
    console.log('Query where clause:', JSON.stringify(where, null, 2));

    // First, let's check what categories exist in the database
    const existingCategories = await prisma.product.findMany({
      select: {
        mainCategory: true
      },
      distinct: ['mainCategory']
    });
    console.log('Existing categories in DB:', existingCategories);

    const totalCount = await prisma.product.count({ where });

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: ITEMS_PER_PAGE,
      skip,
    });

    console.log(`Found ${products.length} products for category: ${category}`);

    return NextResponse.json({
      products,
      hasMore: skip + products.length < totalCount,
      total: totalCount
    });

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    await prisma.product.delete({ where: { id } })
    return new Response('OK')
  } catch (error) {
    console.error('Error deleting product:', error)
    return new Response('Error deleting product', { status: 500 })
  }
} 