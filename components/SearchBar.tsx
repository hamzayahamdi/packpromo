'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, ArrowRight, Tag, Ruler } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { fetchStoreAvailability } from '@/lib/api'
import type { StoreAvailability } from '@/lib/api'

interface SearchBarProps {
  onClose?: () => void;
  className?: string;
  onClick?: () => void;
}

export default function SearchBar({ onClose, className, onClick }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [availabilities, setAvailabilities] = useState<{ [key: string]: StoreAvailability | null }>({})

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchProducts = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) {
          throw new Error('Search failed')
        }
        const data = await response.json()
        console.log('Search results:', data) // Debug log
        
        // Filter active products
        const activeProducts = data
          .filter((product: Product) => product.isActive)
          .map((product: Product) => ({
            ...product,
            mainImage: product.mainImage.startsWith('http') 
              ? product.mainImage 
              : `${process.env.NEXT_PUBLIC_BLOB_PATH_PREFIX}/${product.mainImage}`,
            gallery: product.gallery.map((img: string) => 
              img.startsWith('http') 
                ? img 
                : `${process.env.NEXT_PUBLIC_BLOB_PATH_PREFIX}/${img}`
            )
          }))
        
        setResults(activeProducts.slice(0, 6))
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounce)
  }, [query])

  useEffect(() => {
    const fetchAvailabilities = async () => {
      const promises = results.map(async (product) => {
        try {
          const data = await fetchStoreAvailability(product.ref)
          return [product.id, data]
        } catch (err) {
          console.error(err)
          return [product.id, null]
        }
      })
      
      const availabilityData = await Promise.all(promises)
      setAvailabilities(Object.fromEntries(availabilityData))
    }

    if (results.length > 0) {
      fetchAvailabilities()
    }
  }, [results])

  const handleProductClick = (product: Product) => {
    router.push(`/products/${product.slug}`)
    setIsOpen(false)
    setQuery('')
  }

  const handleClose = () => {
    setIsOpen(false)
    setQuery('')
    onClose?.()
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
    onClick?.();
  }

  return (
    <div ref={searchRef}>
      {/* Search Icon */}
      <div
        onClick={handleClick}
        className={className}
      >
        <div className="flex items-center gap-2 text-gray-300 group-hover:text-white transition-colors">
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Rechercher</span>
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={handleClose}
            />

            {/* Search Container - Centered */}
            <div className="fixed inset-x-0 top-[80px] z-50 flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-3xl mx-4"
              >
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                  {/* Search Input */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3.5">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher un produit..."
                        className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
                        autoFocus
                      />
                      {query && (
                        <button 
                          onClick={() => setQuery('')}
                          className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Results */}
                  {(isLoading || results.length > 0 || query.trim()) && (
                    <div className="border-t border-white/10">
                      <div className="max-h-[60vh] overflow-y-auto">
                        {isLoading ? (
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-[2px] border-white/20 border-b-transparent" />
                          </div>
                        ) : results.length > 0 ? (
                          <div className="divide-y divide-white/10">
                            {results.map((product) => (
                              <div
                                key={product.id}
                                onClick={() => handleProductClick(product)}
                                className="flex items-start gap-4 p-4 hover:bg-white/5 cursor-pointer group"
                              >
                                <div className="relative w-20 h-20 bg-black/20 rounded-lg overflow-hidden shrink-0">
                                  <Image
                                    src={product.mainImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg">
                                    -{Math.round((1 - product.topDealsPrice / product.initialPrice) * 100)}%
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/90">
                                      <Tag className="w-3 h-3" />
                                      {product.mainCategory}
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/90">
                                      <Ruler className="w-3 h-3" />
                                      {product.dimensions}
                                    </div>
                                  </div>
                                  
                                  <h3 className="text-sm font-medium text-white mb-1.5 truncate">
                                    {product.name}
                                  </h3>
                                  
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-base font-bold text-white">
                                        {product.topDealsPrice.toLocaleString('fr-FR')} DH
                                      </span>
                                      <span className="text-sm text-white/40 line-through">
                                        {product.initialPrice.toLocaleString('fr-FR')} DH
                                      </span>
                                    </div>

                                    {/* Stock Status */}
                                    <div className="flex items-center gap-2">
                                      {availabilities[product.id] && (() => {
                                        const totalStock = Object.values(availabilities[product.id] || {})
                                          .reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
                                        
                                        if (totalStock === 0) return null;

                                        if (totalStock <= 2) {
                                          return (
                                            <div className="flex items-center gap-1.5 bg-amber-500/20 px-2 py-0.5 rounded-full">
                                              <span className="w-1 h-1 rounded-full bg-amber-400" />
                                              <span className="text-[10px] font-medium text-amber-400">
                                                {totalStock} en stock
                                              </span>
                                            </div>
                                          );
                                        }

                                        return (
                                          <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                            <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                            <span className="text-[10px] font-medium text-emerald-400">
                                              En stock
                                            </span>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>

                                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/60 shrink-0 transition-all group-hover:translate-x-1" />
                              </div>
                            ))}
                          </div>
                        ) : query.trim() ? (
                          <div className="p-8 text-center text-gray-400">
                           Aucun résultat pour &quot;{query}&quot;
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

