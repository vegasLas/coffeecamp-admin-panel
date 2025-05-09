// src/types/forms/ProductGroupFormTypes.ts
import type { ProductGroup } from '../index'

export interface ProductGroupFormData {
  title: string
  priority: number
  visible: boolean
}

export interface ProductGroupOriginalData extends ProductGroupFormData {}

export interface ProductGroupFormProps {
  productGroup: ProductGroup | null
  isEdit?: boolean
}

export interface ProductGroupFormEmits {
  (e: 'submit', group: Partial<ProductGroup>): void
  (e: 'cancel'): void
}