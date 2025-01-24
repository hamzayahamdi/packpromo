/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/types'
import { Tag, Ruler, Truck, Check, AlertCircle, Loader2, Package } from 'lucide-react'
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

  const packItems = useMemo(() => {
    const parts = product.dimensions.split('+').map(part => part.trim());
    
    return parts.map(part => {
      // Check if the part contains a quantity (e.g., "2x Fauteuils")
      const qtyMatch = part.match(/(\d+)x\s*(.+)/);
      if (qtyMatch) {
        return {
          name: qtyMatch[2].trim(),
          qty: parseInt(qtyMatch[1])
        };
      }
      // If no quantity specified, assume quantity of 1
      return {
        name: part,
        qty: 1
      };
    });
  }, [product.dimensions]);

  const isPackProduct = packItems.length > 1;

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
            
            {isPackProduct && (
              <div className="absolute inset-0 flex flex-col justify-end">
                <div className="relative z-10 p-3">
                  <div className="space-y-1">
                    {packItems.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between px-2.5 py-1.5 bg-black/30 backdrop-blur-[2px] border-l-2 border-white/20 hover:bg-black/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-white/80" />
                          <span className="text-xs font-medium text-white">
                            {item.name}
                          </span>
                        </div>
                        {item.qty > 1 && (
                          <div className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 border border-white/30">
                            <span className="text-[10px] font-bold text-white">
                              {item.qty}×
                            </span>
                            <span className="text-[9px] text-white uppercase font-medium">
                              unités
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="absolute top-3 right-3">
              <span className="inline-block bg-red-600 -skew-x-12 px-2 py-1 text-sm font-bold text-white shadow-sm">
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
