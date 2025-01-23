import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://sketch-design.ma'),
  title: {
    default: 'Packs Promos',
    template: '%s | Packs Promos'
  },
  description: 'Découvrez nos packs exclusifs de meubles à prix réduits',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <title>Packs Promos</title>
      </head>
      <body className={inter.className}>
        <Header />
        <main>
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  )
}
