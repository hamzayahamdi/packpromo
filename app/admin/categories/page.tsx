'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'

type Categories = Record<string, string[]>

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Categories>({})
  const [newCategory, setNewCategory] = useState('')
  const [newSubCategory, setNewSubCategory] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to fetch categories:', err))
  }, [])

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    const formattedCategory = newCategory.trim().toUpperCase()
    
    try {
      const updatedCategories = {
        ...categories,
        [formattedCategory]: []
      }
      
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      })
      
      setCategories(updatedCategories)
      setNewCategory('')
    } catch (error) {
      console.error('Failed to add category:', error)
    }
  }

  const handleAddSubCategory = async (category: string) => {
    if (!newSubCategory.trim()) return
    
    try {
      const updatedCategories = {
        ...categories,
        [category]: [...categories[category], newSubCategory.trim()]
      }
      
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      })
      
      setCategories(updatedCategories)
      setNewSubCategory('')
      setSelectedCategory(null)
    } catch (error) {
      console.error('Failed to add subcategory:', error)
    }
  }

  const handleDeleteCategory = async (category: string) => {
    if (!window.confirm(`Delete category "${category}" and all its subcategories?`)) return
    
    try {
      const updatedCategories = Object.fromEntries(
        Object.entries(categories).filter(([key]) => key !== category)
      )
      
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      })
      
      setCategories(updatedCategories)
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

  const handleDeleteSubCategory = async (category: string, index: number) => {
    try {
      const updatedCategories = {
        ...categories,
        [category]: categories[category].filter((_, i) => i !== index)
      }
      
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      })
      
      setCategories(updatedCategories)
    } catch (error) {
      console.error('Failed to delete subcategory:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500">Manage your product categories and subcategories</p>
      </div>

      {/* Add Category Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-medium mb-4">Add New Category</h2>
        <div className="flex gap-3">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value.toUpperCase())}
            placeholder="Enter category name"
            className="max-w-md"
          />
          <Button onClick={handleAddCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories List */}
      <div className="grid gap-6">
        {Object.entries(categories).map(([category, subcategories]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Category Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <h3 className="text-lg font-medium text-gray-900">{category}</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subcategory
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteCategory(category)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add Subcategory Form */}
            {selectedCategory === category && (
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex gap-3">
                  <Input
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    placeholder="Enter subcategory name"
                    className="max-w-md"
                  />
                  <Button onClick={() => handleAddSubCategory(category)}>
                    Add Subcategory
                  </Button>
                </div>
              </div>
            )}

            {/* Subcategories List */}
            <div className="p-4">
              <div className="grid gap-2">
                {subcategories.map((subcategory, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span>{subcategory}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteSubCategory(category, index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {subcategories.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No subcategories yet
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 