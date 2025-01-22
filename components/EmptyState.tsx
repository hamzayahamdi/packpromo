import { motion } from 'framer-motion'
import { ShoppingBag, Sparkles, ArrowRight } from 'lucide-react'

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="mb-6 text-purple-600"
      >
        <ShoppingBag size={64} />
      </motion.div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Aucun produit trouvé dans cette catégorie</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Mais ne vous inquiétez pas ! Nous ajoutons constamment de nouveaux produits à notre collection.
      </p>
      <motion.div
        className="flex items-center justify-center space-x-2 text-purple-600 font-semibold"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles size={20} />
        <span>Découvrez nos autres catégories</span>
        <ArrowRight size={20} />
      </motion.div>
    </motion.div>
  )
}

