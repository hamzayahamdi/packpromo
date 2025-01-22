'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <motion.div
        animate={{ 
          opacity: [0.5, 1, 0.5],
          scale: [0.98, 1, 0.98]
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-48 h-24"
      >
        <Image
          src="/topdeal.svg"
          alt="Top Deal"
          fill
          className="object-contain"
          priority
        />
      </motion.div>
    </div>
  )
} 