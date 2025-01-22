import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Category {
  name: string
  subcategories: string[]
}

const categories: Category[] = [
  { name: 'Tous', subcategories: [] },
  { name: 'Salons', subcategories: ['Salon en L', 'Salon en U'] },
  { name: 'Canapés', subcategories: ['Canapés'] },
  { name: 'Chambre', subcategories: ['Lits', 'Matelas', 'Commodes', 'Tables de chevet'] },
  { name: 'Tables', subcategories: ['Tables basses', 'Tables de salle à manger', "Tables d'appoint"] },
  { name: 'Chaises', subcategories: ['Chaises'] },
  { name: 'Jardin', subcategories: ['Jardin'] },
  { name: 'Meubles', subcategories: ['Consoles', 'Armoires', 'Bibliothèques', 'Buffets', 'Meubles TV'] },
]

interface CategorySelectorProps {
  onSelectCategory: (category: string) => void
}

export default function CategorySelector({ onSelectCategory }: CategorySelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Tous');
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
    onSelectCategory(category === 'Tous' ? '' : category);
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
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

