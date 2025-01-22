import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()

    const product = await prisma.product.update({
      where: { id },
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
        isActive: data.isActive
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
} 