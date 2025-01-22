'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'

interface ProductFormData {
  id?: string
  name: string
  ref: string
  dimensions: string
  mainCategory: string
  subCategory: string
  initialPrice: number
  topDealsPrice: number
  mainImage: string
  gallery: string[]
  isActive: boolean
  slug: string
}

interface ProductFormProps {
  initialData?: ProductFormData
  onSubmit: (data: ProductFormData) => Promise<void>
  buttonText?: string
}

export default function ProductForm({ 
  initialData, 
  onSubmit, 
  buttonText = "Save" 
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ProductFormData>({
    defaultValues: {
      id: initialData?.id || undefined,
      name: initialData?.name || '',
      ref: initialData?.ref || '',
      dimensions: initialData?.dimensions || '',
      mainCategory: initialData?.mainCategory || '',
      subCategory: initialData?.subCategory || '',
      initialPrice: initialData?.initialPrice || 0,
      topDealsPrice: initialData?.topDealsPrice || 0,
      mainImage: initialData?.mainImage || '',
      gallery: initialData?.gallery || [],
      isActive: initialData?.isActive ?? true,
      slug: initialData?.slug || '',
    }
  })

  const handleSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      // Generate slug if not provided
      if (!data.slug) {
        data.slug = data.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }

      await onSubmit(data)
    } catch (err) {
      console.error('Error saving product:', err)
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register('name')}
          required
        />
      </div>

      <div>
        <Label htmlFor="ref">Reference</Label>
        <Input
          id="ref"
          {...form.register('ref')}
          required
        />
      </div>

      {/* Add other fields similarly */}

      <div>
        <Label htmlFor="slug">Slug (Optional)</Label>
        <Input
          id="slug"
          {...form.register('slug')}
          placeholder="product-name"
        />
        <p className="text-sm text-gray-500 mt-1">
          URL-friendly version of the product name. Will be auto-generated if left empty.
        </p>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : buttonText}
      </Button>
    </form>
  )
} 