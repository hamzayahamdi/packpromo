'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import ProductCard from './ProductCard'
import { Product } from '@/lib/types'
import { fetchProducts } from '@/lib/api'

interface ProductGridProps {
  products: Product[]
  category?: string
}

export default function ProductGrid({ products: initialProducts, category }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { ref, inView } = useInView()

  useEffect(() => {
    setProducts(initialProducts)
    setPage(1)
    setHasMore(true)
  }, [initialProducts])

  useEffect(() => {
    const loadMoreProducts = async () => {
      if (!isLoading && hasMore && inView) {
        setIsLoading(true)
        try {
          const nextPage = page + 1
          const data = await fetchProducts({
            category,
            page: nextPage
          })
          
          if (data.products.length === 0) {
            setHasMore(false)
          } else {
            setProducts(prev => [...prev, ...data.products])
            setPage(nextPage)
            setHasMore(data.hasMore)
          }
        } catch (error) {
          console.error('Error loading more products:', error)
          setHasMore(false)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadMoreProducts()
  }, [inView, hasMore, page, isLoading, category])

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
        {products.map((product) => (
          <div key={product.id} className="w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div
          ref={ref}
          className="w-full h-20 flex items-center justify-center"
        >
          {isLoading && (
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}
    </div>
  )
}

