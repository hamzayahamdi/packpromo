'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Grid } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    {
      href: '/admin/products',
      label: 'Products',
      icon: Package,
    },
    {
      href: '/admin/categories',
      label: 'Categories',
      icon: Grid,
    },
  ]

  return (
    <div className="w-64 bg-white border-r h-full">
      <nav className="p-4 space-y-2">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                transition-colors duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 