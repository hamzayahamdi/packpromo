import { useState } from 'react'
import { Plus, Check, Edit, Trash2, X } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'
import Toast, { ToastType } from '@/components/Toast'
import { SubCategory } from '@/lib/types'

interface CategoryModalProps {
  onClose: () => void
  onSave: () => void
}

// Convert readonly SubCategory to mutable Record<string, string[]>
const mutableCategories: Record<string, string[]> = Object.fromEntries(
  Object.entries(SubCategory).map(([key, value]) => [key, [...value]])
)

// Add ConfirmDialogType
type ConfirmDialogType = 'danger' | 'warning';

export default function CategoryModal({ onClose, onSave }: CategoryModalProps) {
  const [categories, setCategories] = useState<Record<string, string[]>>(mutableCategories)
  const [newCategory, setNewCategory] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [newSubCategory, setNewSubCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState<{ old: string, new: string } | null>(null)
  const [editingSubCategory, setEditingSubCategory] = useState<{ category: string, old: string, new: string } | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ 
    show: boolean; 
    message: string; 
    type: ToastType;
  }>({ 
    show: false, 
    message: '', 
    type: 'success' 
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: ConfirmDialogType;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ show: true, message, type })
  }

  const handleAddCategory = () => {
    if (!newCategory) return
    if (categories[newCategory]) {
      showToast('Category already exists', 'error')
      return
    }
    setCategories({ ...categories, [newCategory]: [] })
    setNewCategory('')
    showToast('Category added successfully')
  }

  const handleDeleteCategory = (category: string) => {
    setConfirmDialog({
      show: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category}" and all its subcategories? This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => {
        const newCategories = { ...categories }
        delete newCategories[category]
        setCategories(newCategories)
        setConfirmDialog({ ...confirmDialog, show: false })
        showToast('Category deleted successfully')
      }
    })
  }

  const handleAddSubCategory = () => {
    if (!selectedCategory || !newSubCategory) return
    if (categories[selectedCategory].includes(newSubCategory)) {
      showToast('Subcategory already exists', 'error')
      return
    }
    setCategories({
      ...categories,
      [selectedCategory]: [...categories[selectedCategory], newSubCategory]
    })
    setNewSubCategory('')
    showToast('Subcategory added successfully')
  }

  const handleDeleteSubCategory = (category: string, subCategory: string) => {
    setConfirmDialog({
      show: true,
      title: 'Delete Subcategory',
      message: `Are you sure you want to delete "${subCategory}" from ${category}? This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => {
        setCategories({
          ...categories,
          [category]: categories[category].filter(sub => sub !== subCategory)
        })
        setConfirmDialog({ ...confirmDialog, show: false })
        showToast('Subcategory deleted successfully')
      }
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const token = btoa(`:admin123`)
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${token}`
        },
        body: JSON.stringify(categories)
      })

      if (response.ok) {
        showToast('Categories saved successfully')
        onSave()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save categories')
        showToast(data.error || 'Failed to save categories', 'error')
      }
    } catch (error) {
      const message = 'An unexpected error occurred'
      setError(message)
      showToast(message, 'error')
      console.error('Error saving categories:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (JSON.stringify(categories) !== JSON.stringify(mutableCategories)) {
      setConfirmDialog({
        show: true,
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close without saving?',
        type: 'warning',
        onConfirm: () => {
          setConfirmDialog({ ...confirmDialog, show: false })
          onClose()
        }
      })
    } else {
      onClose()
    }
  }

  const handleStartEditCategory = (category: string) => {
    setEditingCategory({ old: category, new: category })
  }

  const handleSaveEditCategory = () => {
    if (!editingCategory) return
    if (editingCategory.old === editingCategory.new) {
      setEditingCategory(null)
      return
    }
    if (categories[editingCategory.new]) {
      showToast('Category already exists', 'error')
      return
    }
    const newCategories = { ...categories }
    newCategories[editingCategory.new] = newCategories[editingCategory.old]
    delete newCategories[editingCategory.old]
    setCategories(newCategories)
    setEditingCategory(null)
    showToast('Category updated successfully')
  }

  const handleStartEditSubCategory = (category: string, subCategory: string) => {
    setEditingSubCategory({ category, old: subCategory, new: subCategory })
  }

  const handleSaveEditSubCategory = () => {
    if (!editingSubCategory) return
    if (editingSubCategory.old === editingSubCategory.new) {
      setEditingSubCategory(null)
      return
    }
    if (categories[editingSubCategory.category].includes(editingSubCategory.new)) {
      showToast('Subcategory already exists', 'error')
      return
    }
    setCategories({
      ...categories,
      [editingSubCategory.category]: categories[editingSubCategory.category].map(sub =>
        sub === editingSubCategory.old ? editingSubCategory.new : sub
      )
    })
    setEditingSubCategory(null)
    showToast('Subcategory updated successfully')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Manage Categories
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Add Category */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium text-gray-900">Add Category</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value.toUpperCase())}
                placeholder="New category name"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add
              </button>
            </div>
          </div>

          {/* Add Subcategory */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium text-gray-900">Add Subcategory</h3>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {Object.keys(categories).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                placeholder="New subcategory name"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddSubCategory}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Current Categories</h3>
            {Object.entries(categories).map(([category, subcategories]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  {editingCategory?.old === category ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editingCategory.new}
                        onChange={(e) => setEditingCategory({ ...editingCategory, new: e.target.value.toUpperCase() })}
                        className="flex-1 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEditCategory()
                          if (e.key === 'Escape') setEditingCategory(null)
                        }}
                      />
                      <button
                        onClick={handleSaveEditCategory}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="p-1 text-gray-600 hover:text-gray-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="text-md font-medium text-gray-900">{category}</h4>
                      <button
                        onClick={() => handleStartEditCategory(category)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="space-y-2">
                  {subcategories.map((sub) => (
                    <div key={sub} className="flex items-center justify-between bg-white p-2 rounded">
                      {editingSubCategory?.category === category && editingSubCategory.old === sub ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingSubCategory.new}
                            onChange={(e) => setEditingSubCategory({ ...editingSubCategory, new: e.target.value })}
                            className="flex-1 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditSubCategory()
                              if (e.key === 'Escape') setEditingSubCategory(null)
                            }}
                          />
                          <button
                            onClick={handleSaveEditSubCategory}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingSubCategory(null)}
                            className="p-1 text-gray-600 hover:text-gray-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{sub}</span>
                          <button
                            onClick={() => handleStartEditSubCategory(category, sub)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteSubCategory(category, sub)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {subcategories.length === 0 && (
                    <div className="text-sm text-gray-500 italic p-2">
                      No subcategories
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
        type={confirmDialog.type}
      />

      {/* Toast Notification */}
      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  )
} 