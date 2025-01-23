'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Product } from '@/lib/types'
import { WhatsappIcon } from 'react-share'
import { fetchStoreAvailability } from '@/lib/api'
import { 
  MapPin, 
  Tag, 
  Ruler, 
  ShoppingBag, 
  Eye, 
  Clock, 
  Flame as Fire, 
  X, 
  Truck, 
  Check, 
  Shield, 
  Star, 
  Timer, 
  Headphones, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  Package
} from 'lucide-react'
import { track } from '@vercel/analytics'
import useEmblaCarousel from 'embla-carousel-react'

interface QuickViewProps {
  product: Product
  isOpen?: boolean
  onClose?: () => void
  fullPage?: boolean
}

const cityIcons: { [key: string]: JSX.Element } = {
  Casa: <MapPin size={14} />,
  Rabat: <MapPin size={14} />,
  Marrakech: <MapPin size={14} />,
  Tanger: <MapPin size={14} />,
}

export default function QuickView({ product, isOpen = false, onClose = () => {}, fullPage = false }: QuickViewProps) {
  const [availability, setAvailability] = useState<{
    'Stock Casa': number;
    'Stock Rabat': number;
    'Stock Marrakech': number;
    'Stock Tanger': number;
  } | null>(null)
  const [viewersCount, setViewersCount] = useState(25) // Start with a fixed number
  const [isClient, setIsClient] = useState(false) // Add this to track hydration
  const images = [product.mainImage, ...product.gallery].filter(Boolean)
  const [mainViewRef, mainEmbla] = useEmblaCarousel({ 
    loop: false,
    align: 'center',
    containScroll: false
  })
  const [mobileViewRef, mobileEmbla] = useEmblaCarousel({ 
    loop: false,
    align: 'center',
    containScroll: false
  })
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [detectedProducts, setDetectedProducts] = useState<string[]>([])

  const packItems = useMemo(() => {
    const parts = product.dimensions.split('+').map(part => part.trim());
    
    if (parts.length === 1) {
      return [{
        name: parts[0],
        qty: 1
      }];
    }

    return [
      {
        name: parts[0],
        qty: 1
      },
      {
        name: parts[1].split('x')[0],
        qty: parseInt(parts[1].split('x')[1] || '1')
      }
    ];
  }, [product.dimensions]);

  const isPackProduct = packItems.length > 1;

  useEffect(() => {
    // Mark component as hydrated
    setIsClient(true)
    
    // Set initial random value after hydration
    setViewersCount(Math.floor(Math.random() * 15) + 18)

    // Simulate changing viewers count
    const viewersInterval = setInterval(() => {
      setViewersCount(prev => {
        const change = Math.floor(Math.random() * 3) - 1
        const newCount = prev + change
        return newCount < 18 ? 18 : newCount > 33 ? 33 : newCount
      })
    }, 3000)

    return () => {
      clearInterval(viewersInterval)
    }
  }, []) // Only run once on mount

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const data = await fetchStoreAvailability(product.ref)
        setAvailability(data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchAvailability()

    // Simulate changing viewers count
    const viewersInterval = setInterval(() => {
      setViewersCount(prev => {
        const change = Math.floor(Math.random() * 3) - 1
        const newCount = prev + change
        return newCount < 18 ? 18 : newCount > 33 ? 33 : newCount
      })
    }, 3000)

    return () => {
      clearInterval(viewersInterval)
    }
  }, [product.ref])

  useEffect(() => {
    if (!mainEmbla && !mobileEmbla) return;

    const onMainSelect = () => {
      if (mainEmbla) {
        setCurrentImageIndex(mainEmbla.selectedScrollSnap());
      }
    };

    const onMobileSelect = () => {
      if (mobileEmbla) {
        setCurrentImageIndex(mobileEmbla.selectedScrollSnap());
      }
    };

    mainEmbla?.on('select', onMainSelect);
    mobileEmbla?.on('select', onMobileSelect);
    
    // Force reinitialization with specific options
    mainEmbla?.reInit({
      loop: false,
      align: 'center',
      containScroll: false,
      dragFree: false
    });

    mobileEmbla?.reInit({
      loop: false,
      align: 'center',
      containScroll: false,
      dragFree: false
    });

    return () => {
      mainEmbla?.off('select', onMainSelect);
      mobileEmbla?.off('select', onMobileSelect);
    };
  }, [mainEmbla, mobileEmbla]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mainEmbla) return;
      
      if (e.key === 'ArrowLeft') {
        mainEmbla.scrollPrev();
      } else if (e.key === 'ArrowRight') {
        mainEmbla.scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mainEmbla]);

  const handleWhatsAppOrder = () => {
    // Track the WhatsApp button click
    track('whatsapp_order_click', {
      productId: product.id,
      productName: product.name,
      productPrice: product.topDealsPrice,
      category: product.mainCategory
    });

    const message = encodeURIComponent(`Bonjour, je suis intéressé par l'achat de ${product.name} (${product.id}) pour ${product.topDealsPrice.toLocaleString('fr-FR').replace(',', ' ')} DH.`)
    const apiUrl = `https://api.whatsapp.com/send?phone=212666013108&text=${message}`
    window.open(apiUrl, '_blank')
  }

  const storeOrder = ['Casa', 'Rabat', 'Marrakech', 'Tanger']

  const discountPercentage = Math.round((1 - product.topDealsPrice / product.initialPrice) * 100)

  const handlePrevClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mainEmbla?.scrollPrev();
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mainEmbla?.scrollNext();
  };

  const detectProductsInImage = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/detect-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });
      
      const data = await response.json();
      setDetectedProducts(data.products);
    } catch (error) {
      console.error('Error detecting products:', error);
    }
  };

  const DesktopImageGallery = (
    <div className="embla h-full overflow-hidden" ref={mainViewRef}>
      <div className="embla__container h-full flex">
        {images.map((image, index) => (
          <div 
            key={image} 
            className="embla__slide relative w-full h-full flex-[0_0_100%]"
          >
            <Image
              src={image}
              alt={`${product.name} - Vue ${index + 1}`}
              fill
              className={`select-none ${
                index === 0 
                  ? "object-cover"
                  : "object-contain"
              }`}
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority={index === 0}
              draggable={false}
              quality={100}
            />
            {isPackProduct && (
              <div className="absolute inset-0 flex flex-col justify-end">
                <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-sm">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-white/90">Contenu du Pack</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {packItems.map((item, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-1.5 whitespace-nowrap"
                        >
                          <span className="text-sm font-medium text-white/90">
                            {item.name}
                          </span>
                          {item.qty > 1 && (
                            <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5">
                              <span className="text-xs font-bold text-white">×{item.qty}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="absolute top-4 left-4 z-20">
              {detectedProducts.map((product, index) => (
                <div 
                  key={index}
                  className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 text-sm mb-2 animate-fade-in"
                >
                  {product}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-4 pointer-events-none">
          <button
            onClick={handlePrevClick}
            className="p-2 bg-white/90 shadow-lg hover:bg-white transition-all duration-200 group z-10 pointer-events-auto rounded-none"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800 group-hover:text-gray-600" />
          </button>
          <button
            onClick={handleNextClick}
            className="p-2 bg-white/90 shadow-lg hover:bg-white transition-all duration-200 group z-10 pointer-events-auto rounded-none"
          >
            <ChevronRight className="w-6 h-6 text-gray-800 group-hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-none">
          <span className="text-white text-sm font-medium">
            {currentImageIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );

  const MobileImageGallery = (
    <div className="embla h-full overflow-hidden" ref={mobileViewRef}>
      <div className="embla__container h-full flex">
        {images.map((image, index) => (
          <div 
            key={image} 
            className="embla__slide relative w-full h-full flex-[0_0_100%]"
          >
            <Image
              src={image}
              alt={`${product.name} - Vue ${index + 1}`}
              fill
              className={`select-none ${
                index === 0 
                  ? "object-cover"
                  : "object-contain p-4"
              }`}
              sizes="100vw"
              priority={index === 0}
              draggable={false}
              quality={100}
            />
            {isPackProduct && (
              <div className="absolute inset-0 flex flex-col justify-end">
                <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-sm">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-white/90">Contenu du Pack</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {packItems.map((item, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-1.5 whitespace-nowrap"
                        >
                          <span className="text-sm font-medium text-white/90">
                            {item.name}
                          </span>
                          {item.qty > 1 && (
                            <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5">
                              <span className="text-xs font-bold text-white">×{item.qty}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="absolute top-4 left-4 z-20">
              {detectedProducts.map((product, index) => (
                <div 
                  key={index}
                  className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 text-sm mb-2 animate-fade-in"
                >
                  {product}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Image Counter for Mobile */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-none">
          <span className="text-white text-sm font-medium">
            {currentImageIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );

  const content = (
    <>
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col">
        <div className="w-full relative aspect-[4/3] bg-[#E8E8E6]">
          {MobileImageGallery}
        </div>

        {/* Content Section for Mobile */}
        <div className="flex-1 bg-white pb-24">
          <div className="p-4">
            {/* Product Info */}
            <div className="space-y-4">
              {/* Product Name and Category */}
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 uppercase leading-tight sm:leading-tight lg:leading-tight"
                    style={{ 
                      wordBreak: 'break-word',
                    }}
                  >
                    {product.name}
                  </h1>
                  <div className="flex-shrink-0 px-1 bg-gradient-to-r from-emerald-400 to-green-500 shadow-sm">
                    <span className="text-[9px] font-medium text-white uppercase tracking-wide leading-[12px] block">
                      {product.mainCategory}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Section - Bigger with Enhanced Styling */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-baseline gap-2">
                  <span className="px-3 py-1.5 inline-block bg-[#FBCF38] -skew-x-12 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1),4px_4px_12px_-2px_rgba(251,207,56,0.3)]">
                    <span className="inline-block skew-x-12">
                      {product.topDealsPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                    </span>
                  </span>
                  <span className="text-sm sm:text-base text-gray-400 line-through">
                    {product.initialPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="bg-red-500 px-2 py-1"
                  >
                    <span className="text-sm font-bold text-white">
                      -{discountPercentage}%
                    </span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-1.5 bg-emerald-500 px-2 py-1"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clock className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-medium text-white whitespace-nowrap">
                      Offre Limitée
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Promotion Banner */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-lg border border-amber-100">
                <div className="shrink-0 p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
                  <Truck size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-amber-800">
                      Livraison gratuite
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full uppercase tracking-wider">
                      En ligne
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Commandez en ligne pour bénéficier de la livraison gratuite
                  </p>
                </div>
              </div>

              {/* Marketing Features */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { 
                    icon: <Shield size={16} />, 
                    title: "Satisfaction Client", 
                    desc: "100% Garantie",
                    color: "blue" 
                  },
                  { 
                    icon: <Star size={16} />, 
                    title: "Design Moderne", 
                    desc: "Style unique",
                    color: "purple" 
                  },
                  { 
                    icon: <Check size={16} />, 
                    title: "Qualité Premium", 
                    desc: "Matériaux nobles",
                    color: "emerald" 
                  },
                  { 
                    icon: <Timer size={16} />, 
                    title: "Service Client", 
                    desc: "Support dédié",
                    color: "amber" 
                  }
                ].map((feature) => (
                  <div 
                    key={feature.title}
                    className={`p-2 sm:p-2.5 rounded-none bg-${feature.color}-50 border border-${feature.color}-100`}
                  >
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <div className={`p-1 sm:p-1.5 bg-${feature.color}-100 rounded-none`}>
                        {feature.icon}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{feature.title}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Store Availability */}
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center">
                  <ShoppingBag size={12} className="mr-2" />
                  Disponibilité en magasin
                </h3>
                {availability && (
                  <div className="grid grid-cols-2 gap-3">
                    {storeOrder.map((store) => {
                      const stockKey = `Stock ${store}` as keyof typeof availability
                      const stock = availability[stockKey]
                      const getStockStatus = () => {
                        if (stock > 2) return { color: 'emerald', text: 'En stock', bg: 'bg-emerald-50' }
                        if (stock === 0) return { color: 'red', text: 'Épuisé', bg: 'bg-red-50' }
                        return { color: 'amber', text: `${stock} restant${stock > 1 ? 's' : ''}`, bg: 'bg-amber-50' }
                      }
                      const status = getStockStatus()

                      return (
                        <motion.div 
                          key={store}
                          whileHover={{ scale: 1.02 }}
                          className={`${status.bg} p-2 sm:p-3 rounded-none border border-${status.color}-200`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className={`p-1 sm:p-1.5 rounded-none bg-${status.color}-100`}>
                                {cityIcons[store]}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{store}</p>
                                <p className={`text-[10px] sm:text-xs font-medium text-${status.color}-600`}>
                                  {status.text}
                                </p>
                              </div>
                            </div>
                            <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-none text-[10px] sm:text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
                              {stock > 2 ? 'Disponible' : 
                               stock === 0 ? 'Indisponible' : 
                               'Stock limité'}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Social Proof */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between bg-white/50 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="p-1 bg-blue-100 rounded-full"
                    >
                      <Eye size={16} className="text-blue-600" />
                    </motion.div>
                    <div className="flex items-center gap-1">
                      {isClient && (
                        <motion.span 
                          className="text-base font-bold text-blue-700"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {viewersCount}
                        </motion.span>
                      )}
                      <span className="text-sm text-blue-600">personnes regardent</span>
                    </div>
                  </div>
                  <motion.div 
                    className="flex items-center px-2 py-1 bg-red-100 text-red-600 rounded-full"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Fire size={12} className="mr-1" />
                    <span className="text-xs font-medium">Forte demande</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating WhatsApp Button for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white/95 to-transparent z-50">
          <button
            onClick={handleWhatsAppOrder}
            className="group relative w-full bg-[#23D366] hover:bg-[#1fb855] text-white py-3 px-4 flex items-center justify-center gap-2.5 
            transition-all duration-300 overflow-hidden 
            rounded-xl
            shadow-[0_4px_12px_rgba(35,211,102,0.4),0_2px_4px_rgba(35,211,102,0.3)]
            hover:shadow-[0_6px_16px_rgba(35,211,102,0.5),0_2px_4px_rgba(35,211,102,0.4)]
            active:shadow-[0_2px_8px_rgba(35,211,102,0.3)]
            active:transform active:translate-y-0.5"
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 flex overflow-hidden rounded-xl">
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer" />
            </div>

            {/* Pulsing icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75" />
              <WhatsappIcon 
                size={22} 
                className="relative z-10" 
                round={true}
                bgStyle={{ fill: "transparent" }}
                iconFillColor="white"
              />
            </div>

            {/* Text */}
            <span className="text-sm font-semibold relative z-10 flex items-center gap-1.5">
              Commander via WhatsApp
              <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-200">
                →
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-[calc(100vh-80px)]">
        {/* Image Section - Full height on desktop */}
        <div className="w-1/2 bg-[#E8E8E6] relative">
          {DesktopImageGallery}
        </div>

        {/* Content Section for Desktop */}
        <div className="w-1/2 bg-white">
          <div className="h-full overflow-y-auto hide-scrollbar">
            <div className="p-8">
          {/* Product Info */}
          <div className="space-y-4">
            {/* Product Name and Category */}
            <div className="pt-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 uppercase leading-tight sm:leading-tight lg:leading-tight"
                  style={{ 
                    wordBreak: 'break-word',
                  }}
                >
                  {product.name}
                </h1>
                <div className="flex-shrink-0 px-1 bg-gradient-to-r from-emerald-400 to-green-500 shadow-sm">
                  <span className="text-[9px] font-medium text-white uppercase tracking-wide leading-[12px] block">
                    {product.mainCategory}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Section - Bigger with Enhanced Styling */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-baseline gap-2">
                <span className="px-3 py-1.5 inline-block bg-[#FBCF38] -skew-x-12 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1),4px_4px_12px_-2px_rgba(251,207,56,0.3)]">
                  <span className="inline-block skew-x-12">
                    {product.topDealsPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                  </span>
                </span>
                <span className="text-sm sm:text-base text-gray-400 line-through">
                  {product.initialPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                </span>
              </div>

              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="bg-red-500 px-2 py-1"
                >
                  <span className="text-sm font-bold text-white">
                    -{discountPercentage}%
                  </span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-1.5 bg-emerald-500 px-2 py-1"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-medium text-white whitespace-nowrap">
                    Offre Limitée
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Promotion Banner */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-lg border border-amber-100">
              <div className="shrink-0 p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
                <Truck size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-amber-800">
                    Livraison gratuite
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full uppercase tracking-wider">
                    En ligne
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Commandez en ligne pour bénéficier de la livraison gratuite
                </p>
              </div>
            </div>

            {/* Marketing Features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { 
                  icon: <Shield size={16} />, 
                  title: "Satisfaction Client", 
                  desc: "100% Garantie",
                  color: "blue" 
                },
                { 
                  icon: <Star size={16} />, 
                  title: "Design Moderne", 
                  desc: "Style unique",
                  color: "purple" 
                },
                { 
                  icon: <Check size={16} />, 
                  title: "Qualité Premium", 
                  desc: "Matériaux nobles",
                  color: "emerald" 
                },
                { 
                  icon: <Timer size={16} />, 
                  title: "Service Client", 
                  desc: "Support dédié",
                  color: "amber" 
                }
              ].map((feature) => (
                <div 
                  key={feature.title}
                  className={`p-2 sm:p-2.5 rounded-none bg-${feature.color}-50 border border-${feature.color}-100`}
                >
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <div className={`p-1 sm:p-1.5 bg-${feature.color}-100 rounded-none`}>
                      {feature.icon}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{feature.title}</p>
                      <p className="text-[10px] sm:text-xs text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Store Availability */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center">
                <ShoppingBag size={12} className="mr-2" />
                Disponibilité en magasin
              </h3>
              {availability && (
                <div className="grid grid-cols-2 gap-3">
                  {storeOrder.map((store) => {
                    const stockKey = `Stock ${store}` as keyof typeof availability
                    const stock = availability[stockKey]
                    const getStockStatus = () => {
                      if (stock > 2) return { color: 'emerald', text: 'En stock', bg: 'bg-emerald-50' }
                      if (stock === 0) return { color: 'red', text: 'Épuisé', bg: 'bg-red-50' }
                      return { color: 'amber', text: `${stock} restant${stock > 1 ? 's' : ''}`, bg: 'bg-amber-50' }
                    }
                    const status = getStockStatus()

                    return (
                      <motion.div 
                        key={store}
                        whileHover={{ scale: 1.02 }}
                        className={`${status.bg} p-2 sm:p-3 rounded-none border border-${status.color}-200`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className={`p-1 sm:p-1.5 rounded-none bg-${status.color}-100`}>
                              {cityIcons[store]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{store}</p>
                              <p className={`text-[10px] sm:text-xs font-medium text-${status.color}-600`}>
                                {status.text}
                              </p>
                            </div>
                          </div>
                          <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-none text-[10px] sm:text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
                            {stock > 2 ? 'Disponible' : 
                             stock === 0 ? 'Indisponible' : 
                             'Stock limité'}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Social Proof */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between bg-white/50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="p-1 bg-blue-100 rounded-full"
                  >
                    <Eye size={16} className="text-blue-600" />
                  </motion.div>
                  <div className="flex items-center gap-1">
                    {isClient && (
                      <motion.span 
                        className="text-base font-bold text-blue-700"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {viewersCount}
                      </motion.span>
                    )}
                    <span className="text-sm text-blue-600">personnes regardent</span>
                  </div>
                </div>
                <motion.div 
                  className="flex items-center px-2 py-1 bg-red-100 text-red-600 rounded-full"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Fire size={12} className="mr-1" />
                  <span className="text-xs font-medium">Forte demande</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

            {/* WhatsApp button for desktop - removed sticky positioning */}
            <div className="bg-white border-t">
              <div className="p-6">
            <button
              onClick={handleWhatsAppOrder}
              className="group relative w-full bg-[#23D366] hover:bg-[#1fb855] text-white rounded-none py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 flex">
                <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer" />
              </div>

              {/* Pulsing icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75" />
                <WhatsappIcon 
                  size={28} 
                  className="sm:w-8 sm:h-8 relative z-10" 
                  round={false}
                  bgStyle={{ fill: "transparent" }}  // Make background transparent
                  iconFillColor="white"              // Make icon white
                />
              </div>

              {/* Text with hover effect */}
              <span className="text-lg sm:text-xl font-semibold relative z-10 flex items-center gap-2 transform group-hover:scale-105 transition-transform duration-200">
                Commander via WhatsApp
                
                {/* Arrow animation */}
                <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-200">
                  →
                </span>
              </span>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 transform rotate-45 translate-x-1/2 -translate-y-1/2" />
            </button>
            <p className="text-center text-xs sm:text-sm text-gray-600 mt-3 flex items-center justify-center gap-2">
              <Headphones 
                size={16} 
                className="text-[#23D366] bg-[#23D366]/10 p-1 rounded-none transition-colors duration-200 hover:bg-[#23D366] hover:text-white" 
              />
              Notre équipe est prête à vous aider
              <MessageCircle 
                size={16} 
                className="text-[#23D366] bg-[#23D366]/10 p-1 rounded-none transition-colors duration-200 hover:bg-[#23D366] hover:text-white" 
              />
            </p>
          </div>
        </div>
      </div>
    </div>
      </div>
    </>
  );

  // Return content directly if fullPage is true
  if (fullPage) {
    return content
  }

  // Otherwise wrap in Dialog for modal view
  return (
    <AnimatePresence>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="!p-0 !pr-0 rounded-none max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] lg:max-w-[1500px] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-[100] p-2 sm:p-2.5 bg-black/80 hover:bg-black/90 backdrop-blur-sm rounded-none shadow-lg transition-all duration-200 border border-white/20 group"
            aria-label="Fermer"
          >
            <X 
              size={24} 
              className="text-white/90 group-hover:text-white group-hover:scale-110 transition-transform duration-200" 
            />
          </button>
          {content}
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  )
}
