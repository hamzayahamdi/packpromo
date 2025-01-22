import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET method for fetching a product
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const product = await prisma.product.findFirst({
      where: {
        slug: slug,
        isActive: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT method for updating a product
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json()

    // First check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })

    if (!existingProduct) {
      return new NextResponse(
        JSON.stringify({ error: 'Product not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { slug },
      data: {
        name: body.name,
        ref: body.ref,
        dimensions: body.dimensions,
        mainCategory: body.mainCategory,
        subCategory: body.subCategory,
        initialPrice: Number(body.initialPrice),
        topDealsPrice: Number(body.topDealsPrice),
        mainImage: body.mainImage,
        gallery: body.gallery,
        isActive: body.isActive,
      }
    })

    return new NextResponse(
      JSON.stringify(updatedProduct),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Update product error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update product' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// DELETE method for deleting a product
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // First check if product exists
    const product = await prisma.product.findUnique({
      where: { slug }
    })

    if (!product) {
      return new NextResponse(
        JSON.stringify({ error: 'Product not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Delete the product
    await prisma.product.delete({
      where: { slug }
    })

    return new NextResponse(
      JSON.stringify({ message: 'Product deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Delete product error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete product' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 