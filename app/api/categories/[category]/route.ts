import { NextResponse } from 'next/server'
import { PREDEFINED_CATEGORIES } from '@/lib/categories'

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const category = params.category
    const subcategories = PREDEFINED_CATEGORIES[category as keyof typeof PREDEFINED_CATEGORIES] || []

    if (!subcategories) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      name: category,
      subcategories
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const data = await request.json()
    const categoryName = params.category

    return NextResponse.json({
      name: categoryName,
      subcategories: data.subcategories
    })
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    return NextResponse.json({ 
      message: 'Category deleted successfully' 
    })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
} 