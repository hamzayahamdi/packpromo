const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function generateSlug(text: string, attempt = 0): string {
  if (!text) return ''
  
  const baseSlug = text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  
  return attempt === 0 ? baseSlug || 'product' : `${baseSlug || 'product'}-${attempt}`
}

async function main() {
  try {
    console.log('Starting slug generation for existing products...')
    
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      }
    })

    console.log(`Found ${products.length} products to process`)

    for (const product of products) {
      let attempt = 0
      let slug = generateSlug(product.name)
      let success = false

      while (!success && attempt < 100) {
        try {
          // Try to update with current slug
          await prisma.product.update({
            where: { id: product.id },
            data: { slug }
          })
          console.log(`✓ Updated "${product.name}" with slug: "${slug}"`)
          success = true
        } catch (error: any) { // Type error as any for CommonJS compatibility
          if (error?.code === 'P2002') { // Unique constraint error
            attempt++
            slug = generateSlug(product.name, attempt)
            console.log(`Slug "${slug}" already exists, trying "${slug}-${attempt}"`)
            continue
          }
          throw error
        }
      }

      if (!success) {
        // Use ID as fallback
        const fallbackSlug = `product-${product.id}`
        await prisma.product.update({
          where: { id: product.id },
          data: { slug: fallbackSlug }
        })
        console.log(`⚠ Used fallback slug for "${product.name}": ${fallbackSlug}`)
      }
    }

    console.log('✅ Slug generation completed successfully')
  } catch (error) {
    console.error('❌ Error during slug generation:', error)
    throw error
  }
}

main()
  .catch((error) => {
    console.error('Failed to generate slugs:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 