/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/types'
import { Tag, Ruler, Truck, Check, AlertCircle, Loader2 } from 'lucide-react'
import { fetchStoreAvailability } from '@/lib/api'
import type { StoreAvailability } from '@/lib/api'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
  onQuickView?: () => void
}

const getCategoryColor = (category: string) => {
  const stringToColor = (str: string, lightness: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 30%, ${lightness}%)`;
  };

  const baseColor = stringToColor(category, 30);
  const lighterColor = stringToColor(category, 40);
  return { baseColor, lighterColor };
};

export default function ProductCard({ product, className, onQuickView }: ProductCardProps) {
  const [availability, setAvailability] = useState<StoreAvailability | null>(null)
  const { baseColor, lighterColor } = getCategoryColor(product.mainCategory);
  const discountPercentage = Math.round((1 - product.topDealsPrice / product.initialPrice) * 100)

  useEffect(() => {
    let mounted = true;
    
    const getAvailability = async () => {
      try {
        const data = await fetchStoreAvailability(product.ref)
        if (mounted) {
          setAvailability(data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    getAvailability()
    return () => { mounted = false }
  }, [product.ref])

  const { stockStatus, totalStock } = useMemo(() => {
    if (!availability) return {
      stockStatus: {
        icon: <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />,
        text: "Vérification...",
        textColor: "text-gray-500",
        bgColor: "bg-gray-100",
        borderColor: "border-gray-200"
      },
      totalStock: 0
    }

    const totalStock = Object.values(availability)
      .reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0)

    if (totalStock > 5) {
      return {
        stockStatus: {
          icon: <Check className="h-4 w-4 text-emerald-50" />,
          text: "En stock",
          textColor: "text-white",
          bgColor: "bg-emerald-500",
          borderColor: "border-emerald-600"
        },
        totalStock
      }
    } else if (totalStock > 0) {
      return {
        stockStatus: {
          icon: <AlertCircle className="h-4 w-4 text-amber-50" />,
          text: `${totalStock} restant${totalStock > 1 ? 's' : ''}`,
          textColor: "text-white",
          bgColor: "bg-amber-500",
          borderColor: "border-amber-600"
        },
        totalStock
      }
    } else {
      return {
        stockStatus: {
          icon: <AlertCircle className="h-4 w-4 text-red-50" />,
          text: "Rupture de stock",
          textColor: "text-white",
          bgColor: "bg-red-500",
          borderColor: "border-red-600"
        },
        totalStock
      }
    }
  }, [availability])

  return (
    <Link 
      href={`/products/${product.slug}`}
      className={`block h-full ${className}`}
      prefetch={true}
    >
      <Card className="overflow-hidden h-full flex flex-col bg-white rounded-none border">
        <CardContent className="p-0 relative">
          <div className="relative aspect-square">
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority={false}
            />
            
            <div className="absolute left-2 top-2 z-20">
              <div className="absolute inset-0 blur-md bg-orange-400/30 rounded-none" />
              <Image
                src="https://sketch-design.ma/wp-content/uploads/2024/12/topdeal.svg"
                alt="Top Deal"
                width={160}
                height={48}
                className="w-auto h-12 relative z-20"
                priority
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-sm p-2">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-none">
                    <Truck className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-white text-xs font-medium">
                      Livraison Gratuite
                    </span>
                    <span className="text-white/80 text-[9px]">
                      En ligne uniquement
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-[#e95123] to-[#641910] px-2.5 py-1 rounded-none">
                  <span className="text-[10px] font-bold text-white flex items-center gap-1">
                    <span>✨</span>
                    <span>OFFERT</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute top-3 right-3">
              <span className="inline-block bg-red-600 -skew-x-12 px-3 py-1.5 text-base font-bold text-white shadow-sm">
                <span className="inline-block skew-x-12">
                  -{discountPercentage}%
                </span>
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-grow flex flex-col justify-between w-full py-3 px-2">
          <div className="mb-2 w-full">
            <h3 className="font-semibold text-base mb-1 uppercase line-clamp-2">{product.name}</h3>
            <div className="flex flex-wrap gap-1">
              <Badge 
                variant="custom"
                className="text-xs font-semibold px-2 py-0.5 text-white border-none rounded-none"
                style={{
                  background: `linear-gradient(to right, ${baseColor}, ${lighterColor})`
                }}
              >
                <Tag className="h-3 w-3 mr-1" />
                {product.subCategory}
              </Badge>
              <Badge 
                variant="outline" 
                className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded-none"
              >
                <Ruler className="h-3 w-3 mr-1" />
                {product.dimensions}
              </Badge>
            </div>
          </div>

          <div className="mt-auto w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <div className="relative">
                  <span className="px-3 py-1.5 inline-block bg-[#FBCF38] -skew-x-12 rounded-none text-lg font-bold text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1),4px_4px_12px_-2px_rgba(251,207,56,0.3)]">
                    <span className="inline-block skew-x-12">
                      {product.topDealsPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                    </span>
                  </span>
                </div>
                <span className="text-sm text-gray-400 line-through">
                  {product.initialPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                </span>
              </div>

              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-none border ${stockStatus.bgColor} ${stockStatus.borderColor}`}>
                {stockStatus.icon}
                <span className={`text-xs font-medium ${stockStatus.textColor}`}>
                  {stockStatus.text}
                </span>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

