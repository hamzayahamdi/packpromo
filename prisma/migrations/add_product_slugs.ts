import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Define the generateSlug function with proper type annotation
function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normalize diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
}

async function main(): Promise<void> {
  try {
    const products = await prisma.product.findMany()
    
    for (const product of products) {
      const slug = generateSlug(product.name)
      console.log(`Updating product ${product.name} with slug: ${slug}`)
      
      await prisma.product.update({
        where: { id: product.id },
        data: { slug }
      })
    }
  } catch (error) {
    console.error('Error during migration:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 