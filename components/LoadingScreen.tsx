'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function LoadingScreen() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-64 h-32"
      >
        <Image
          src="/topdeal.svg"
          alt="Top Deal"
          fill
          className="object-contain"
          priority
        />
      </motion.div>
      <motion.div 
        className="mt-8 h-1 w-48 bg-gradient-to-r from-transparent via-purple-600 to-transparent rounded-full"
        animate={{
          opacity: [0.3, 1, 0.3],
          scaleX: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
} 