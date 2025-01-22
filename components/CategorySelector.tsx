import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CATEGORY_DISPLAY_NAMES, MainCategory } from '@/lib/categories'

interface Category {
  name: MainCategory
  subcategories: string[]
}

const categories: Category[] = [
  { name: 'TOUS', subcategories: [] },
  { name: 'SALLE A MANGER', subcategories: ['SALLE A MANGER'] },
  { name: 'SEJOUR', subcategories: ['SEJOUR'] },
  { name: 'CHAMBRE A COUCHER', subcategories: ['CHAMBRE A COUCHER'] },
  { name: 'ENSEMBLES DE JARDIN', subcategories: ['ENSEMBLES DE JARDIN'] },
]

interface CategorySelectorProps {
  categories: Category[]
  onCategorySelect: (category: Category) => void
  selectedCategory?: Category
}

export default function CategorySelector({ 
  categories, 
  onCategorySelect,
  selectedCategory 
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCategoryClick = (category: Category) => {
    onCategorySelect(category)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50"
      >
        <span className="text-sm text-gray-700">
          {selectedCategory 
            ? CATEGORY_DISPLAY_NAMES[selectedCategory.name]
            : 'Select Category'
          }
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          <div className="p-2 space-y-1">
            {categories.map((category) => (
              <motion.button
                key={category.name}
                onClick={() => handleCategoryClick(category)}
                className={`w-full px-3 py-2 text-left text-sm rounded-md transition-colors
                  ${selectedCategory?.name === category.name 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                {CATEGORY_DISPLAY_NAMES[category.name]}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

