'use client'

import { useState, useEffect } from 'react'
import { Product } from '@prisma/client'
import { ProductCard } from './ProductCard'
import { AddProductForm } from './AddProductForm'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PREDEFINED_CATEGORIES } from '@/lib/categories'
import { Plus, Search, Settings, Grid, List } from 'lucide-react'
import Spinner from '@/components/Spinner'
import Toast from '@/components/Toast'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CategoryManager } from './CategoryManager'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { EditProductForm } from './EditProductForm'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ViewModeValue = 'grid' | 'list'
type SortByValue = 'date' | 'name' | 'price'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [viewMode, setViewMode] = useState<ViewModeValue>('grid')
  const [sortBy, setSortBy] = useState<SortByValue>('date')
  const [sortOrder] = useState<'asc' | 'desc'>('desc')
  const [showInactive, setShowInactive] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/admin/products?showInactive=${showInactive}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching products:', err)
      showToastMessage('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [showInactive]) // eslint-disable-line react-hooks/exhaustive-deps

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const categories = ['all', ...Object.keys(PREDEFINED_CATEGORIES)]

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.ref.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      product.mainCategory === selectedCategory
    
    const matchesStatus = showInactive ? true : product.isActive

    return matchesSearch && matchesCategory && matchesStatus
  })

  const sortProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? 
          a.name.localeCompare(b.name) : 
          b.name.localeCompare(a.name)
      }
      if (sortBy === 'price') {
        return sortOrder === 'asc' ? 
          a.topDealsPrice - b.topDealsPrice : 
          b.topDealsPrice - a.topDealsPrice
      }
      // date sorting
      return sortOrder === 'asc' ? 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() :
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  const filteredAndSortedProducts = sortProducts(filteredProducts)

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Products Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Total Products</div>
            <div className="text-2xl font-bold">{products.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Active Products</div>
            <div className="text-2xl font-bold">
              {products.filter(p => p.isActive).length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Inactive Products</div>
            <div className="text-2xl font-bold">
              {products.filter(p => !p.isActive).length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Categories</div>
            <div className="text-2xl font-bold">
              {Object.keys(PREDEFINED_CATEGORIES).length}
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => setShowCategoryManager(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Settings size={18} />
          Manage Categories
        </Button>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5
                   flex items-center gap-2 rounded-lg shadow-lg 
                   hover:shadow-blue-500/25 transition-all duration-200
                   font-medium"
        >
          <Plus size={20} />
          Add New Product
        </Button>
      </div>

      {/* Search, Filter, and View Controls */}
      <Card className="p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: SortByValue) => setSortBy(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as ViewModeValue)}
          >
            <TabsList>
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid size={18} />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List size={18} />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Switch
              checked={showInactive}
              onCheckedChange={setShowInactive}
              id="show-inactive"
            />
            <label 
              htmlFor="show-inactive" 
              className="text-sm text-gray-600 cursor-pointer"
            >
              Show Inactive Products
            </label>
          </div>
        </div>
      </Card>

      {/* Products Display */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner />
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "flex flex-col gap-4"
        }>
          {filteredAndSortedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              onEdit={() => setProductToEdit(product)}
              onDeleteClick={() => setProductToDelete(product)}
              onUpdate={fetchProducts}
            />
          ))}
        </div>
      )}

      {filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {showInactive 
              ? 'No products found' 
              : 'No active products found. Toggle "Show Inactive Products" to see all products.'}
          </p>
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <AddProductForm
            onClose={() => setShowAddForm(false)}
            onProductAdded={() => {
              setShowAddForm(false)
              fetchProducts()
              showToastMessage('Product added successfully')
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Category Manager Dialog */}
      <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
        <DialogContent className="max-w-3xl">
          <CategoryManager
            onClose={() => setShowCategoryManager(false)}
            onSave={() => {
              setShowCategoryManager(false)
              showToastMessage('Categories updated successfully')
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!productToEdit} onOpenChange={() => setProductToEdit(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          {productToEdit && (
            <EditProductForm
              product={productToEdit}
              onClose={() => setProductToEdit(null)}
              onProductUpdated={() => {
                setProductToEdit(null)
                fetchProducts()
                showToastMessage('Product updated successfully')
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={async () => {
                if (!productToDelete) return
                
                try {
                  const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
                    method: 'DELETE',
                  })
                  
                  if (!response.ok) {
                    throw new Error('Failed to delete product')
                  }
                  
                  fetchProducts()
                  showToastMessage('Product deleted successfully')
                } catch (error) {
                  showToastMessage('Failed to delete product', 'error')
                } finally {
                  setProductToDelete(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
} 