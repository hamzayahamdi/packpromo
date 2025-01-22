import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CATEGORY_DISPLAY_NAMES } from '@/lib/categories'

interface Category {
  name: string
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
  onSelectCategory: (category: string) => void
}

export default function CategorySelector({ onSelectCategory }: CategorySelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('TOUS');
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (selectorRef.current) {
        const { top } = selectorRef.current.getBoundingClientRect();
        if (top <= 0) {
          selectorRef.current.classList.add('sticky-selector');
        } else {
          selectorRef.current.classList.remove('sticky-selector');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    const categorySlug = category === 'TOUS' 
      ? 'tous'
      : category.toLowerCase().replace(/\s+/g, '-');
    onSelectCategory(categorySlug);
  };

  return (
    <div ref={selectorRef} className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 py-4 shadow-lg transition-all duration-300 ease-in-out">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto hide-scrollbar">
          <div className="flex space-x-2 md:justify-center">
            {categories.map((category) => (
              <motion.button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
                  activeCategory === category.name
                    ? 'bg-white text-purple-900 shadow-glow'
                    : 'bg-transparent text-white border border-white/30 hover:bg-white/10'
                } whitespace-nowrap`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {CATEGORY_DISPLAY_NAMES[category.name]}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

