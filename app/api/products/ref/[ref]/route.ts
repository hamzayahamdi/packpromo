import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { ref: string } }
) {
  try {
    const decodedRef = decodeURIComponent(params.ref)
    console.log('Fetching product with ref:', decodedRef)
    
    const product = await prisma.product.findUnique({
      where: {
        ref: decodedRef
      }
    })

    if (!product) {
      console.log('Product not found for ref:', decodedRef)
      return new NextResponse('Product not found', { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 