import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const products = await prisma.product.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {})
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
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