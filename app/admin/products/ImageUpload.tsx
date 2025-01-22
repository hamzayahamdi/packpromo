'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { put } from '@vercel/blob'

interface ImageUploadProps {
  mainImage: string
  gallery: string[]
  onImagesUpdated: (mainImage: string, gallery: string[]) => void
}

export default function ImageUpload({ mainImage, gallery, onImagesUpdated }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    setUploading(true)
    setError('')

    try {
      const file = e.target.files[0]
      const blob = await put(file.name, file, {
        access: 'public',
      })

      onImagesUpdated(blob.url, gallery)
    } catch (err) {
      setError('Failed to upload image')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)
    setError('')

    try {
      const files = Array.from(e.target.files)
      const uploads = await Promise.all(
        files.map(async (file) => {
          const blob = await put(file.name, file, {
            access: 'public',
          })
          return blob.url
        })
      )

      onImagesUpdated(mainImage, [...gallery, ...uploads])
    } catch (err) {
      setError('Failed to upload images')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index)
    onImagesUpdated(mainImage, newGallery)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div>
        <label className="block text-sm font-medium mb-2">Main Image</label>
        <div className="flex items-start gap-4">
          {mainImage && (
            <div className="relative w-32 h-32">
              <Image
                src={mainImage}
                alt="Main product image"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              className="hidden"
              id="main-image-upload"
            />
            <label htmlFor="main-image-upload">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                className="cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Main Image'}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div>
        <label className="block text-sm font-medium mb-2">Gallery Images</label>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {gallery.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full h-24">
                <Image
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <button
                onClick={() => removeGalleryImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryUpload}
          className="hidden"
          id="gallery-upload"
        />
        <label htmlFor="gallery-upload">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="cursor-pointer"
            asChild
          >
            <span>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Add Gallery Images'}
            </span>
          </Button>
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
} 