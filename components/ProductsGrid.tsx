'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/lib/types'
import ProductCard from './ProductCard'
import QuickView from './QuickView'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    // Reset loading state when products change
    setImagesLoaded(false)

    // Preload all product images
    Promise.all(
      products.map(product => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.src = product.mainImage
          img.onload = resolve
          img.onerror = reject
        })
      })
    ).then(() => {
      setImagesLoaded(true)
    }).catch((error) => {
      console.error('Error loading images:', error)
      setImagesLoaded(true)
    })
  }, [products])

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product)
  }

  if (!imagesLoaded) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="bg-gray-200 rounded-lg aspect-[3/4]"
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onQuickView={() => handleQuickView(product)}
          />
        ))}
      </div>

      {selectedProduct && (
        <QuickView 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </>
  )
} 