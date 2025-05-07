// src/types/forms/ProductFormTypes.ts
import type { Product, ProductImage } from '../index'

export interface ProductFormData {
  title: string
  description: string
  cost: number
  productGroupId: number | null
}

export interface ProductOriginalData extends ProductFormData {
  images?: ProductImage[]
}

export interface ProductFormProps {
  product: Product | null
  isEdit?: boolean
}

export interface ProductFormEmits {
  (e: 'submit', formData: FormData): void
  (e: 'cancel'): void
}