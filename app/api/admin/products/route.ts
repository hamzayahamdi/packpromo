import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const showInactive = searchParams.get('showInactive') === 'true'

    const products = await prisma.product.findMany({
      where: showInactive ? undefined : { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Generate slug from name
    const slug = generateSlug(data.name)

    // Create product using same structure as edit
    const product = await prisma.product.create({
      data: {
        name: data.name,
        ref: data.ref,
        dimensions: data.dimensions,
        mainCategory: data.mainCategory,
        subCategory: data.subCategory,
        initialPrice: Number(data.initialPrice),
        topDealsPrice: Number(data.topDealsPrice),
        mainImage: data.mainImage,
        gallery: data.gallery,
        isActive: data.isActive,
        slug: slug
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.slug) {
      data.slug = generateSlug(data.name)
    }

    const product = await prisma.product.update({
      where: { id: data.id },
      data: {
        ...data,
        gallery: Array.isArray(data.gallery) ? data.gallery : [],
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
} 