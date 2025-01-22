/* eslint-disable react/no-unescaped-entities */

'use client'

import { useState, useEffect } from 'react'
import { Product, MainCategory, SubCategory } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  X, 
  Image as ImageIcon, 
  Plus,
  Tag,
  Ruler,
  DollarSign,
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react'

interface ProductModalProps {
  product?: Product | null
  onClose: () => void
  onSave: () => void
}

const ERROR_MESSAGES = {
  SAVE_FAILED: "Échec de l'enregistrement du produit",
  UNEXPECTED_ERROR: "Une erreur inattendue s'est produite"
} as const

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    ref: '',
    name: '',
    dimensions: '',
    mainCategory: 'SALONS',
    subCategory: '',
    initialPrice: 0,
    topDealsPrice: 0,
  })
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string>('')
  const [gallery, setGallery] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (product) {
      setFormData(product)
      setMainImagePreview(product.mainImage)
      setGalleryPreviews(product.gallery)
    }
  }, [product])

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please upload an image file')
        return
      }
      setMainImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setUploadError('')
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleGalleryFiles(files)
  }

  const handleGalleryFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length !== files.length) {
      setUploadError('Please upload only image files')
      return
    }
    
    setGallery(prev => [...prev, ...imageFiles])
    
    const previews = imageFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(previews).then(newPreviews => {
      setGalleryPreviews(prev => [...prev, ...newPreviews])
    })
    setUploadError('')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleGalleryFiles(files)
  }

  const removeGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    const submitData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if ((key === 'mainImage' || key === 'gallery') && !mainImage && gallery.length === 0) {
          return
        }
        submitData.append(key, value.toString())
      }
    })

    if (mainImage) {
      submitData.append('mainImage', mainImage)
    }

    gallery.forEach((file) => {
      submitData.append('gallery', file)
    })

    try {
      const url = product
        ? `/api/products/${product.id}`
        : '/api/products'
      
      const method = product ? 'PUT' : 'POST'
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('adminAuth='))
        ?.split('=')[1];

      const response = await fetch(url, {
        method,
        body: submitData,
        headers: {
          'Authorization': `Basic ${token}`
        }
      })

      if (response.ok) {
        onSave()
      } else {
        const errorData = await response.json()
        setError(errorData.error || ERROR_MESSAGES.SAVE_FAILED)
      }
    } catch (error) {
      setError(ERROR_MESSAGES.UNEXPECTED_ERROR)
      console.error('Error saving product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {product ? 'Modification d&apos;un produit' : 'Ajout d&apos;un produit'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Images du Produit</h3>
                  <span className="text-sm text-gray-500">Image principale requise</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Principale
                    </label>
                    <div className="relative">
                      <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors">
                        {mainImagePreview ? (
                          <div className="relative w-full h-full group">
                            <Image
                              src={mainImagePreview}
                              alt="Image principale du produit"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-sm">Cliquez pour modifier</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-1 text-sm text-gray-500">Cliquez pour télécharger l'image principale</p>
                          </div>
                        )}
                        <input
                          type="file"
                          onChange={handleMainImageChange}
                          accept="image/*"
                          required={!product}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gallery */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Galerie d'Images
                    </label>
                    <div 
                      className={`p-4 border-2 border-dashed rounded-lg ${
                        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      } transition-colors`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {galleryPreviews.map((preview, index) => (
                          <div key={index} className="aspect-square relative rounded-lg overflow-hidden group">
                            <Image
                              src={preview}
                              alt={`Image de galerie ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                          <Plus className="h-8 w-8 text-gray-400" />
                          <span className="mt-1 text-xs text-gray-500">Ajouter plus</span>
                          <input
                            type="file"
                            multiple
                            onChange={handleGalleryChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="text-center text-sm text-gray-500">
                        <p>Glissez et déposez des images ici ou cliquez pour sélectionner</p>
                        <p className="text-xs mt-1">Supporte plusieurs fichiers</p>
                      </div>
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    <span>{uploadError === 'Please upload an image file' ? 'Veuillez télécharger un fichier image' : 
                           uploadError === 'Please upload only image files' ? 'Veuillez télécharger uniquement des fichiers image' : 
                           uploadError}</span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <Tag size={16} />
                        Référence
                      </div>
                    </label>
                    <input
                      type="text"
                      value={formData.ref}
                      onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du Produit
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <Ruler size={16} />
                        Dimensions
                      </div>
                    </label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie Principale
                    </label>
                    <select
                      value={formData.mainCategory}
                      onChange={(e) => setFormData({
                        ...formData,
                        mainCategory: e.target.value as MainCategory,
                        subCategory: ''
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {Object.keys(SubCategory).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sous-Catégorie
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionner une sous-catégorie</option>
                      {formData.mainCategory &&
                        SubCategory[formData.mainCategory as MainCategory].map((subCat) => (
                          <option key={subCat} value={subCat}>{subCat}</option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          Prix Initial
                        </div>
                      </label>
                      <input
                        type="number"
                        value={formData.initialPrice}
                        onChange={(e) => setFormData({ ...formData, initialPrice: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix Top Deals
                      </label>
                      <input
                        type="number"
                        value={formData.topDealsPrice}
                        onChange={(e) => setFormData({ ...formData, topDealsPrice: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div 
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                  dangerouslySetInnerHTML={{
                    __html: error === ERROR_MESSAGES.SAVE_FAILED ? ERROR_MESSAGES.SAVE_FAILED :
                           error === ERROR_MESSAGES.UNEXPECTED_ERROR ? ERROR_MESSAGES.UNEXPECTED_ERROR :
                           error
                  }}
                />
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer le Produit
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
} 