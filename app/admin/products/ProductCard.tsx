'use client';

import { useState, useEffect } from 'react';
import { Product } from '@prisma/client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Package } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ProductForm from '@/components/admin/ProductForm';
import { Badge } from '@/components/ui/badge';
import { fetchStoreAvailability } from '@/lib/api';
import { Card } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onEdit: (product: Product) => void;
  onDeleteClick: (product: Product) => void;
  onUpdate: () => void;
}

function getStatusBadge(product: Product, totalStock: number) {
  if (!product.isActive) {
    return <Badge variant="secondary">Inactive</Badge>
  }
  
  return totalStock > 0 
    ? <Badge variant="success">In Stock</Badge>
    : <Badge variant="destructive">Out of Stock</Badge>
}

export function ProductCard({ 
  product, 
  viewMode, 
  onEdit,
  onDeleteClick,
  onUpdate 
}: ProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalStock, setTotalStock] = useState(0);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const data = await fetchStoreAvailability(product.ref)
        const total = Object.values(data).reduce((sum, stock) => sum + stock, 0)
        setTotalStock(total)
      } catch (error) {
        console.error('Failed to fetch stock:', error)
      }
    }

    fetchStock()
  }, [product.ref])

  return (
    <Card className="overflow-hidden">
      <div className={`
        bg-white rounded-lg shadow-sm border overflow-hidden
        ${!product.isActive ? 'opacity-60' : ''}
        ${viewMode === 'list' ? 'flex' : ''}
      `}>
        <div className={`
          relative aspect-square
          ${viewMode === 'list' ? 'w-48 shrink-0' : ''}
        `}>
          {!product.isActive && (
            <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] z-10" />
          )}
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2 z-20">
            {getStatusBadge(product, totalStock)}
          </div>
        </div>
        <div className={`
          p-4
          ${viewMode === 'list' ? 'flex-1' : ''}
        `}>
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-1">Ref: {product.ref}</p>
          <p className="text-gray-600 text-sm mb-1">Category: {product.mainCategory}</p>
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {totalStock} units available
            </span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className="text-gray-500 line-through">{product.initialPrice} DH</p>
              <p className="text-blue-600 font-bold">{product.topDealsPrice} DH</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(product)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => onDeleteClick(product)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-[90vw] xl:max-w-[80vw] 2xl:max-w-[1400px]">
          <ProductForm
            initialData={product}
            onSubmit={async (data) => {
              try {
                const response = await fetch(`/api/products/${product.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                
                if (!response.ok) throw new Error('Failed to update product');
                
                setIsEditing(false);
                onUpdate();
              } catch (error) {
                console.error('Error updating product:', error);
                alert('Failed to update product');
              }
            }}
            buttonText="Update Product"
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
} 