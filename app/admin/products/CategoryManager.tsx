import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, X, Edit, Check } from 'lucide-react'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PREDEFINED_CATEGORIES } from '@/lib/categories'

interface CategoryManagerProps {
  onClose: () => void
  onSave: () => void
}

// Simplified category structure
type Categories = Record<string, string[]>;

// Convert readonly categories to mutable
const mutableCategories: Categories = Object.fromEntries(
  Object.entries(PREDEFINED_CATEGORIES).map(([key, value]) => [key, [...value]])
);

export function CategoryManager({ onClose, onSave }: CategoryManagerProps) {
  // Initialize with mutable categories
  const [categories, setCategories] = useState<Categories>(mutableCategories)
  const [newCategory, setNewCategory] = useState('')
  const [newSubCategory, setNewSubCategory] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState<{ key: string; value: string } | null>(null)
  const [editingSubCategory, setEditingSubCategory] = useState<{ 
    category: string; 
    index: number; 
    value: string 
  } | null>(null)

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
    if (formattedCategory in categories) {
      alert('Category already exists')
      return
    }
    
    const updatedCategories = {
      ...categories,
      [formattedCategory]: []
    }
    
    try {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      })
      
      setCategories(updatedCategories)
      setNewCategory('')
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('Failed to save category')
    }
  }

  const handleAddSubCategory = async () => {
    if (!selectedCategory || !newSubCategory.trim()) return
    const formattedSubCategory = newSubCategory.trim()
    if (categories[selectedCategory].includes(formattedSubCategory)) {
      alert('Subcategory already exists')
      return
    }
    
    const updatedCategories = {
      ...categories,
      [selectedCategory]: [...categories[selectedCategory], formattedSubCategory]
    }
    
    try {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      })
      
      setCategories(updatedCategories)
      setNewSubCategory('')
    } catch (error) {
      console.error('Failed to save subcategory:', error)
      alert('Failed to save subcategory')
    }
  }

  const handleDeleteCategory = async (category: string) => {
    if (!window.confirm(`Are you sure you want to delete "${category}" and all its subcategories?`)) {
      return
    }
    
    const updatedCategories = Object.fromEntries(
      Object.entries(categories).filter(([key]) => key !== category)
    )
    
    try {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      })
      
      setCategories(updatedCategories)
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Failed to delete category')
    }
  }

  const handleDeleteSubCategory = async (category: string, index: number) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) {
      return
    }
    
    const updatedCategories = {
      ...categories,
      [category]: categories[category].filter((_, i) => i !== index)
    }
    
    try {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      })
      
      setCategories(updatedCategories)
    } catch (error) {
      console.error('Failed to delete subcategory:', error)
      alert('Failed to delete subcategory')
    }
  }

  const handleSaveCategory = async () => {
    if (!editingCategory) return
    const { key, value } = editingCategory
    const newKey = value.toUpperCase()
    if (!value.trim() || newKey === key || (newKey in categories)) {
      setEditingCategory(null)
      return
    }
    
    const { [key]: subcategories, ...rest } = categories
    const updatedCategories = {
      ...rest,
      [newKey]: subcategories
    }
    
    try {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      })
      
      setCategories(updatedCategories)
      setEditingCategory(null)
    } catch (error) {
      console.error('Failed to update category:', error)
      alert('Failed to update category')
    }
  }

  const handleSaveSubCategory = async () => {
    if (!editingSubCategory) return
    const { category, index, value } = editingSubCategory
    
    const updatedCategories = {
      ...categories,
      [category]: categories[category].map((sub, i) => 
        i === index ? value : sub
      )
    }
    
    try {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategories)
      })
      
      setCategories(updatedCategories)
      setEditingSubCategory(null)
    } catch (error) {
      console.error('Failed to update subcategory:', error)
      alert('Failed to update subcategory')
    }
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Manage Categories</DialogTitle>
      </DialogHeader>
      
      <div className="mt-6 space-y-6">
        {/* Add new category */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium">Add New Category</h3>
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value.toUpperCase())}
              placeholder="New category name"
              className="bg-white"
            />
            <Button onClick={handleAddCategory} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Add new subcategory */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium">Add New Subcategory</h3>
          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(categories).map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={newSubCategory}
              onChange={(e) => setNewSubCategory(e.target.value)}
              placeholder="New subcategory name"
              className="bg-white"
            />
            <Button 
              onClick={handleAddSubCategory} 
              className="shrink-0"
              disabled={!selectedCategory}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Categories list */}
        <div className="space-y-4">
          {Object.entries(categories).map(([category, subcategories]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                {editingCategory?.key === category ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editingCategory.value}
                      onChange={(e) => setEditingCategory({ 
                        key: category, 
                        value: e.target.value.toUpperCase() 
                      })}
                      className="flex-1 bg-white"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSaveCategory}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingCategory(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">{category}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingCategory({ 
                        key: category, 
                        value: category 
                      })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteCategory(category)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {subcategories.map((subcategory, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    {editingSubCategory?.category === category && 
                     editingSubCategory.index === index ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingSubCategory.value}
                          onChange={(e) => setEditingSubCategory({
                            category,
                            index,
                            value: e.target.value
                          })}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveSubCategory}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingSubCategory(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{subcategory}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingSubCategory({
                            category,
                            index,
                            value: subcategory
                          })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteSubCategory(category, index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          Save Changes
        </Button>
      </div>
    </div>
  )
} 