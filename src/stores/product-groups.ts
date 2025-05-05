import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getProductGroups, createProductGroup, updateProductGroup, deleteProductGroup } from '../services/api'
import type { ProductGroup } from '../types'

export const useProductGroupsStore = defineStore('productGroups', () => {
  // State
  const productGroups = ref<ProductGroup[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const sortedProductGroups = computed(() => {
    return [...productGroups.value].sort((a, b) => {
      // Sort by priority (higher first) then by title
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return a.title.localeCompare(b.title)
    })
  })

  // Actions
  async function fetchProductGroups() {
    isLoading.value = true
    error.value = null
    
    try {
      productGroups.value = await getProductGroups()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch product groups'
      console.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  async function addProductGroup(groupData: Partial<ProductGroup>) {
    isLoading.value = true
    error.value = null
    
    try {
      const newGroup = await createProductGroup(groupData)
      productGroups.value.push(newGroup)
      return newGroup
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add product group'
      console.error(error.value)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  async function editProductGroup(id: number, groupData: Partial<ProductGroup>) {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedGroup = await updateProductGroup(id, groupData)
      const index = productGroups.value.findIndex(g => g.id === id)
      if (index !== -1) {
        productGroups.value[index] = updatedGroup
      }
      return updatedGroup
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update product group'
      console.error(error.value)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  async function removeProductGroup(id: number) {
    isLoading.value = true
    error.value = null
    
    try {
      await deleteProductGroup(id)
      const index = productGroups.value.findIndex(g => g.id === id)
      if (index !== -1) {
        productGroups.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete product group'
      console.error(error.value)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    productGroups,
    isLoading,
    error,
    // Getters
    sortedProductGroups,
    // Actions
    fetchProductGroups,
    addProductGroup,
    editProductGroup,
    removeProductGroup
  }
})