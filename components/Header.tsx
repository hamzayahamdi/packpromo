'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, ChevronDown, Sofa, Bed, Table2 as Table, Armchair as Chair, Palmtree, Home, LayoutGrid } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import SearchModal from './SearchModal'

// Update category type
type Category = 'Tous' | 'Salle à Manger' | 'Séjour' | 'Chambre à coucher' | 'Ensembles de Jardin'

const categories: Category[] = [
  'Tous', 'Salle à Manger', 'Séjour', 'Chambre à coucher', 'Ensembles de Jardin'
]

const categoryIcons: { [key in Category]: JSX.Element } = {
  'Tous': <LayoutGrid size={18} />,
  'Salle à Manger': <Table size={18} />,
  'Séjour': <Sofa size={18} />,
  'Chambre à coucher': <Bed size={18} />,
  'Ensembles de Jardin': <Palmtree size={18} />
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<Category | null>('Tous')

  // Update getActiveCategory to use the Category type
  const getActiveCategory = useCallback((): Category | null => {
    if (pathname?.startsWith('/products/')) return null;
    
    if (pathname === '/categories/tous' || pathname === '/') return 'Tous';
    const match = pathname.match(/\/categories\/([^/]+)/);
    if (match) {
      const categorySlug = decodeURIComponent(match[1]);
      return categories.find(cat => 
        cat.toLowerCase().replace(/\s+/g, '-') === categorySlug
      ) as Category || 'Tous';
    }
    return 'Tous';
  }, [pathname]);

  useEffect(() => {
    setActiveCategory(getActiveCategory())
  }, [pathname, getActiveCategory])

  const handleCategoryClick = (category: Category) => {
    if (category === activeCategory) return;

    setActiveCategory(category)
    setIsMobileMenuOpen(false)

    const categorySlug = category
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zà-ÿ0-9-]/g, '')

    router.push(`/categories/${categorySlug}`, { scroll: false })
  }

  // Logo click handler - now goes to "Tous" category
  const handleLogoClick = () => {
    handleCategoryClick('Tous')
  }

  // Update the click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const menuButton = document.getElementById('mobile-menu-button')
      
      // If clicking the menu button, let the onClick handler handle it
      if (menuButton?.contains(target)) {
        return
      }

      // Otherwise, close the menu when clicking outside
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  return (
    <>
      <header className="fixed w-full top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-stretch justify-between relative h-[80px]">
            {/* Logo */}
            <Link 
              href="/" 
              onClick={handleLogoClick}
              className="flex items-center h-full shrink-0 px-2"
            >
              <Image
                src="/topdeal.svg"
                alt="Top Deal"
                width={240}
                height={100}
                priority
                className="w-auto h-full"
              />
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-stretch mx-auto">
              <div className="flex items-stretch gap-2">
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/categories/${category.toLowerCase()}`}
                    className="relative group h-full flex items-center px-4"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryClick(category);
                    }}
                  >
                    <div
                      className={`
                        absolute inset-0 transform -skew-x-12 transition-all duration-300
                        ${activeCategory === category && activeCategory !== null
                          ? 'bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm shadow-lg' 
                          : 'bg-white/5 group-hover:bg-white/10'
                        }
                      `}
                    />
                    
                    <div
                      className={`
                        absolute inset-0 transform -skew-x-12 
                        bg-gradient-to-r from-transparent via-white/20 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      `}
                    />
                    
                    <span
                      className={`
                        relative z-10 text-sm font-medium transition-colors duration-300 px-4
                        ${activeCategory === category && activeCategory !== null
                          ? 'text-gray-900' 
                          : 'text-gray-300 group-hover:text-white'
                        }
                      `}
                    >
                      {category}
                    </span>
                  </Link>
                ))}
              </div>
            </nav>

            {/* Desktop Search */}
            <div className="hidden md:flex items-stretch">
              <button 
                onClick={() => setIsSearchOpen(true)} 
                className="relative group h-full flex items-center px-4 cursor-pointer"
              >
                {/* Skewed background */}
                <div className={`
                  absolute inset-0 transform -skew-x-12 transition-all duration-300
                  bg-white/5 group-hover:bg-white/10
                `} />
                
                {/* Hover effect */}
                <div className={`
                  absolute inset-0 transform -skew-x-12 
                  bg-gradient-to-r from-transparent via-white/20 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500
                `} />
                
                {/* Search Icon and Text */}
                <div className="relative z-10 flex items-center gap-2 text-gray-300 group-hover:text-white transition-colors">
                  <Search className="w-4 h-4" />
                  <span className="text-sm font-medium">Rechercher</span>
                </div>
              </button>
            </div>

            {/* Mobile Menu and Search Controls */}
            <div className="md:hidden flex items-center gap-2">
              {/* Category Selector */}
              <div className="relative group">
                <div className="absolute inset-0 transform -skew-x-12 transition-all duration-300 bg-white/5 group-hover:bg-white/10" />
                <button
                  id="mobile-menu-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMobileMenuOpen(!isMobileMenuOpen)
                  }}
                  className="relative z-10 flex items-center gap-1.5 px-4 py-2.5"
                >
                  <Menu size={18} className="text-gray-300 group-hover:text-white transition-colors" />
                  <span className="text-gray-300 group-hover:text-white text-sm font-medium transition-colors">
                    {activeCategory}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`
                      text-gray-300 group-hover:text-white transition-all duration-200
                      ${isMobileMenuOpen ? 'rotate-180' : ''}
                    `}
                  />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="flex items-center">
                <div className="relative group">
                  <div className="absolute inset-0 transform -skew-x-12 transition-all duration-300 bg-white/5 group-hover:bg-white/10" />
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="relative z-10 p-2.5"
                  >
                    <Search className="w-[18px] h-[18px] text-gray-300 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mobile Menu - Updated positioning and z-index */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Content - Updated positioning */}
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 right-0 top-[80px] bg-gradient-to-b from-gray-900/95 to-gray-800/95 z-50"
            >
              <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
              
              <div className="container mx-auto p-3 relative">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      href={`/categories/${category.toLowerCase()}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleCategoryClick(category);
                      }}
                      className={`
                        relative group overflow-hidden rounded-xl transition-all duration-300
                        ${activeCategory === category 
                          ? 'bg-white/20 shadow-lg' 
                          : 'bg-white/5 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
                      
                      <div className="relative px-4 py-3 flex items-center gap-3">
                        <div className={`
                          p-2 rounded-lg
                          ${activeCategory === category 
                            ? 'bg-white/30 text-white' 
                            : 'bg-white/10 text-gray-300 group-hover:bg-white/20'
                          }
                          transition-all duration-300
                        `}>
                          {categoryIcons[category]}
                        </div>
                        <span className={`
                          text-sm font-medium
                          ${activeCategory === category 
                            ? 'text-white' 
                            : 'text-gray-300 group-hover:text-white'
                          }
                        `}>
                          {category}
                        </span>
                      </div>

                      <div className={`
                        absolute bottom-0 left-0 right-0 h-[1px]
                        ${activeCategory === category 
                          ? 'bg-gradient-to-r from-transparent via-white/40 to-transparent' 
                          : 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
                        }
                      `} />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

