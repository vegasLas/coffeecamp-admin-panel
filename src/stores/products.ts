import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api'
import type { Product } from '../types'

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Form state
  const isEditMode = ref(false)
  const currentEditingProduct = ref<Product | null>(null)

  // Getters
  const sortedProducts = computed(() => {
    return [...products.value].sort((a, b) => {
      // Sort by product group priority (higher first) then by product name
      if (a.productGroup.priority !== b.productGroup.priority) {
        return b.productGroup.priority - a.productGroup.priority
      }
      return a.title.localeCompare(b.title)
    })
  })

  const getProductsByGroup = computed(() => {
    const groupMap = new Map<number, Product[]>()
    
    products.value.forEach(product => {
      const groupId = product.productGroup.id
      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, [])
      }
      groupMap.get(groupId)?.push(product)
    })
    
    return groupMap
  })

  // Actions
  async function fetchProducts() {
    isLoading.value = true
    error.value = null
    
    try {
      products.value = await getProducts()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch products'
      console.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  async function addProduct(productData: FormData) {
    isLoading.value = true
    error.value = null
    
    try {
      const newProduct = await createProduct(productData)
      products.value.push(newProduct)
      return newProduct
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add product'
      console.error(error.value)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  async function editProduct(id: number, productData: FormData) {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedProduct = await updateProduct(id, productData)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      return updatedProduct
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update product'
      console.error(error.value)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  async function removeProduct(id: number) {
    isLoading.value = true
    error.value = null
    
    try {
      await deleteProduct(id)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete product'
      console.error(error.value)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  // Form state management
  function setEditMode(product: Product | null) {
    isEditMode.value = !!product
    currentEditingProduct.value = product
  }
  
  return {
    // State
    products,
    isLoading,
    error,
    // Form state
    isEditMode,
    currentEditingProduct,
    // Getters
    sortedProducts,
    getProductsByGroup,
    // Actions
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
    // Form actions
    setEditMode
  }
})