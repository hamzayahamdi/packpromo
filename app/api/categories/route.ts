import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { PREDEFINED_CATEGORIES } from '@/lib/categories'

export async function GET() {
  try {
    return NextResponse.json(PREDEFINED_CATEGORIES)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const categories = await request.json()
    const filePath = path.join(process.cwd(), 'lib/categories.ts')
    
    const fileContent = `
export const PREDEFINED_CATEGORIES = ${JSON.stringify(categories, null, 2)} as const;

export type MainCategory = keyof typeof PREDEFINED_CATEGORIES;
export type SubCategory = typeof PREDEFINED_CATEGORIES[MainCategory][number];
`;

    await fs.writeFile(filePath, fileContent)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving categories:', error)
    return NextResponse.json(
      { error: 'Failed to save categories' },
      { status: 500 }
    )
  }
} 