require('dotenv').config()
const { list } = require('@vercel/blob')
const prismaDb = require('../lib/prisma')

interface BlobItem {
  pathname: string
  url: string
}

async function updateImageUrls() {
  // First, get all blob files
  const { blobs } = await list()
  console.log('Found blobs:', blobs.map((b: BlobItem) => b.url))

  const products = await prismaDb.product.findMany()
  
  for (const product of products) {
    try {
      // Find matching blob URL for main image by checking if any blob URL contains the base filename
      const mainImageBase = product.mainImage.split('/').pop()?.split('-').slice(0, -1).join('-')
      const mainImageBlob = blobs.find((blob: BlobItem) => blob.url.includes(mainImageBase || ''))
      const mainImageUrl = mainImageBlob?.url || product.mainImage

      // Find matching blob URLs for gallery
      const galleryUrls = product.gallery.map((image: string) => {
        const galleryBase = image.split('/').pop()?.split('-').slice(0, -1).join('-')
        const galleryBlob = blobs.find((blob: BlobItem) => blob.url.includes(galleryBase || ''))
        return galleryBlob?.url || image
      })

      // Update the product with complete URLs
      await prismaDb.product.update({
        where: { id: product.id },
        data: {
          mainImage: mainImageUrl,
          gallery: galleryUrls,
        },
      })

      console.log(`Updated product ${product.id}:`)
      console.log('Main image:', mainImageUrl)
      console.log('Gallery:', galleryUrls)
    } catch (error) {
      console.error(`Error updating product ${product.id}:`, error)
    }
  }
}

updateImageUrls()
  .then(() => console.log('Done updating image URLs'))
  .catch(console.error)
  .finally(() => prismaDb.$disconnect()) 