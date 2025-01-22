'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PREDEFINED_CATEGORIES } from '@/lib/categories';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, Info } from 'lucide-react';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import ImageUpload from './ImageUpload';

interface AddProductFormProps {
  onClose: () => void;
  onProductAdded: () => void;
}

// Image Preview Component
function ImagePreview({ 
  url, 
  onDelete,
  isMain = false 
}: { 
  url: string; 
  onDelete: () => void;
  isMain?: boolean;
}) {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
      <Image
        src={url}
        alt="Product image"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
        {isMain && (
          <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full">
            Main Image
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Image Upload Box Component
function ImageUploadBox({ 
  onUpload, 
  isUploading = false,
  label = "Upload Image",
  hint = "Click or drag to upload",
  maxSize = 5 // 5MB limit
}: { 
  onUpload: (file: File) => void;
  isUploading?: boolean;
  label?: string;
  hint?: string;
  maxSize?: number;
}) {
  const handleFileValidation = (file: File) => {
    // Check file size (in MB)
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return false;
    }

    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPEG, PNG and WebP files are allowed');
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && handleFileValidation(file)) {
      onUpload(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && handleFileValidation(file)) {
      onUpload(file);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`
        relative h-40 rounded-lg border-2 border-dashed
        flex flex-col items-center justify-center gap-2
        cursor-pointer transition-colors
        ${isUploading 
          ? 'border-gray-300 bg-gray-50' 
          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
        }
      `}
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
          <span className="text-sm text-gray-500">Uploading...</span>
        </div>
      ) : (
        <>
          <svg 
            className="h-8 w-8 text-blue-500"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
            />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-xs text-gray-500">{hint}</p>
          </div>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
      />
    </div>
  );
}

export function AddProductForm({ onClose, onProductAdded }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    ref: '',
    dimensions: '',
    mainCategory: Object.keys(PREDEFINED_CATEGORIES)[0],
    subCategory: '',
    initialPrice: '',
    topDealsPrice: '',
    mainImage: '',
    gallery: [] as string[],
    isActive: true
  });

  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_GALLERY_IMAGES = 4;
  const MAX_FILE_SIZE = 5; // 5MB

  const handleImageUpload = async (file: File, isMainImage: boolean = false) => {
    // Check if gallery is full
    if (!isMainImage && formData.gallery.length >= MAX_GALLERY_IMAGES) {
      alert(`Maximum ${MAX_GALLERY_IMAGES} gallery images allowed`);
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      
      if (isMainImage) {
        setFormData(prev => ({ ...prev, mainImage: data.url }));
      } else {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, data.url] }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          initialPrice: Number(formData.initialPrice),
          topDealsPrice: Number(formData.topDealsPrice),
          gallery: formData.gallery || []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product');
      }

      onProductAdded();
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <DialogHeader>
        <DialogTitle>Add New Product</DialogTitle>
      </DialogHeader>

      <div className="space-y-8 pb-20">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border space-y-4">
              <h3 className="font-medium text-gray-900">Main Image</h3>
              {formData.mainImage ? (
                <ImagePreview
                  url={formData.mainImage}
                  onDelete={() => setFormData(prev => ({ ...prev, mainImage: '' }))}
                  isMain
                />
              ) : (
                <ImageUploadBox
                  onUpload={(file) => handleImageUpload(file, true)}
                  isUploading={uploading}
                  label="Upload Main Image"
                  hint="Drag and drop or click to upload"
                />
              )}
            </div>

            <div className="bg-white rounded-lg p-6 border space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Gallery Images</h3>
                <span className="text-sm text-gray-500">
                  {formData.gallery.length}/{MAX_GALLERY_IMAGES} images
                </span>
              </div>
              
              <div className="text-xs text-gray-500 mb-4">
                <p>• Maximum {MAX_GALLERY_IMAGES} gallery images</p>
                <p>• Maximum {MAX_FILE_SIZE}MB per image</p>
                <p>• Supported formats: JPEG, PNG, WebP</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {formData.gallery.map((url, index) => (
                  <ImagePreview
                    key={index}
                    url={url}
                    onDelete={() => setFormData(prev => ({
                      ...prev,
                      gallery: prev.gallery.filter((_, i) => i !== index)
                    }))}
                  />
                ))}
                
                {formData.gallery.length < 4 && (
                  <ImageUploadBox
                    onUpload={(file) => handleImageUpload(file, false)}
                    isUploading={uploading}
                    label="Add Gallery Image"
                    hint={`${formData.gallery.length}/4 images`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex-1 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-lg text-gray-900">Basic Information</h3>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Reference</label>
                  <Input
                    value={formData.ref}
                    onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                    placeholder="Enter product reference"
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Dimensions</label>
                  <Input
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="Enter dimensions"
                    className="bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <h3 className="font-medium text-lg text-gray-900">Categories</h3>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Main Category</label>
                  <Select
                    value={selectedMainCategory}
                    onValueChange={(value) => {
                      setSelectedMainCategory(value);
                      setFormData(prev => ({ ...prev, mainCategory: value, subCategory: '' }));
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {Object.keys(PREDEFINED_CATEGORIES).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMainCategory && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Subcategory</label>
                    <Select
                      value={formData.subCategory}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subCategory: value }))}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {PREDEFINED_CATEGORIES[selectedMainCategory as keyof typeof PREDEFINED_CATEGORIES].map((subCategory) => (
                          <SelectItem key={subCategory} value={subCategory}>
                            {subCategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-lg text-gray-900">Pricing</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Initial Price (DH)</label>
                  <Input
                    type="number"
                    value={formData.initialPrice}
                    onChange={(e) => setFormData({ ...formData, initialPrice: e.target.value })}
                    placeholder="0.00"
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">TopDeals Price (DH)</label>
                  <Input
                    type="number"
                    value={formData.topDealsPrice}
                    onChange={(e) => setFormData({ ...formData, topDealsPrice: e.target.value })}
                    placeholder="0.00"
                    className="bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky buttons */}
      <div className="sticky bottom-0 left-0 right-0 -mx-6 -mb-6 px-6 py-4 bg-white border-t flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="min-w-[100px] bg-white hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={uploading}
          className="min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white shadow-lg
                   hover:shadow-blue-500/25 transition-all duration-200"
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Adding...</span>
            </div>
          ) : (
            'Add Product'
          )}
        </Button>
      </div>
    </form>
  );
} 