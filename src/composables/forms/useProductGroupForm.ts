// src/composables/forms/useProductGroupForm.ts
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductGroupsStore } from '../../stores/product-groups'
import { storeToRefs } from 'pinia'
import type { ProductGroupFormData, ProductGroupOriginalData } from '../../types/forms/ProductGroupFormTypes'

export function useProductGroupForm() {
  // Get store values
  const productGroupsStore = useProductGroupsStore()
  const { isEditMode, currentEditingProductGroup } = storeToRefs(productGroupsStore)
  
  // Use computed values for reactivity
  const isEdit = computed(() => isEditMode.value)
  const productGroup = computed(() => currentEditingProductGroup.value)
  const formVisible = ref(false)
  const isSubmitting = ref(false)
  
  // Store original data for comparison
  const originalData = ref<ProductGroupOriginalData>({} as ProductGroupOriginalData)
  
  // Form data
  const form = reactive<ProductGroupFormData>({
    title: '',
    priority: 0
  })
  
  // Form validation
  const formValid = computed(() => {
    return form.title && form.title.trim() !== '' && form.priority !== undefined
  })
  
  const open = async () => {
    // First, reset the form state
    formVisible.value = true
    
    // Wait for the modal to be visible before setting data
    await nextTick()
    
    // Reset form if not in edit mode
    if (!isEdit.value) {
      form.title = ''
      form.priority = 0
      originalData.value = {} as ProductGroupOriginalData
    } else if (productGroup.value) {
      // Store original values for comparison
      originalData.value = {
        title: productGroup.value.title || '',
        priority: productGroup.value.priority || 0
      }
      
      // Copy values from the provided product group in edit mode
      form.title = productGroup.value.title || ''
      form.priority = productGroup.value.priority || 0
    }
  }
  
  const close = () => {
    formVisible.value = false
  }
  
  // Compare current form data with original data
  const getChangedFields = () => {
    if (!isEdit.value || !originalData.value) return null
    
    const changes: Record<string, any> = {}
    
    // Check text and number fields
    if (form.title !== originalData.value.title) changes.title = form.title
    if (form.priority !== originalData.value.priority) changes.priority = form.priority
    
    return Object.keys(changes).length > 0 ? changes : null
  }
  
  const handleSubmit = async () => {
    if (!formValid.value) {
      ElMessage.warning('Пожалуйста, заполните все обязательные поля')
      return null
    }
    
    isSubmitting.value = true
    
    try {
      if (isEdit.value && productGroup.value) {
        // In edit mode, only send changed fields and ID
        const changes = getChangedFields()
        
        if (changes) {
          return {
            ...changes,
            id: productGroup.value.id
          }
        } else {
          // No changes, just close the form
          ElMessage.info('Нет изменений для сохранения')
          return null
        }
      } else {
        // In create mode, send all fields
        return { ...form }
      }
    } catch (error) {
      console.error('Form submission error:', error)
      return null
    } finally {
      isSubmitting.value = false
    }
  }
  
  return {
    form,
    formVisible,
    isSubmitting,
    formValid,
    open,
    close,
    handleSubmit
  }
}