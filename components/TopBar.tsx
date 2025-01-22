'use client'

import { Phone, MapPin, Clock } from 'lucide-react'

export default function TopBar() {
  return (
    <div className="bg-gray-900 text-white py-2 px-4">
      <div className="container mx-auto flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Phone size={14} className="mr-1" />
            <span>0666-013108</span>
          </div>
          <div className="hidden sm:flex items-center">
            <MapPin size={14} className="mr-1" />
            <span>Casablanca, Rabat, Marrakech, Tanger</span>
          </div>
        </div>
        <div className="flex items-center">
          <Clock size={14} className="mr-1" />
          <span>Lun-Sam: 9h-19h</span>
        </div>
      </div>
    </div>
  )
}

