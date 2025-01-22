const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function generateSlug(text, attempt = 0) {
  if (!text) return ''; 
  
  const baseSlug = text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  return attempt === 0 ? baseSlug || 'product' : `${baseSlug || 'product'}-${attempt}`
}

async function main() {
  try {
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('Database connected successfully')

    // Get all products with empty slugs
    console.log('Fetching products with empty slugs...')
    const products = await prisma.product.findMany({
      where: {
        slug: ''
      },
      select: {
        id: true,
        name: true
      }
    })
    console.log(`Found ${products.length} products that need slugs`)

    // Update products with slugs
    for (const product of products) {
      let attempt = 0
      let slug = generateSlug(product.name)
      let success = false

      while (!success && attempt < 10) {
        try {
          console.log(`Trying to update product "${product.name}" with slug: "${slug}"`)
          await prisma.product.update({
            where: { id: product.id },
            data: { 
              slug: slug || `product-${product.id}`
            }
          })
          console.log(`✓ Updated product ${product.id}`)
          success = true
        } catch (error) {
          if (error.code === 'P2002') { // Unique constraint violation
            attempt++
            slug = generateSlug(product.name, attempt)
            console.log(`Slug "${slug}" already exists, trying "${slug}-${attempt}"`)
          } else {
            console.error(`Error updating product ${product.id}:`, error)
            throw error
          }
        }
      }

      if (!success) {
        const fallbackSlug = `product-${product.id}`
        console.log(`Using fallback slug for product ${product.id}: ${fallbackSlug}`)
        await prisma.product.update({
          where: { id: product.id },
          data: { slug: fallbackSlug }
        })
      }
    }
    
    console.log('✓ Finished processing')
  } catch (error) {
    console.error('Error during execution:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 