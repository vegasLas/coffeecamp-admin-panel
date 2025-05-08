// src/composables/forms/useProductForm.ts
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductsStore } from '../../stores/products'
import { storeToRefs } from 'pinia'
import type { UploadUserFile } from 'element-plus'
import type { ProductFormData, ProductOriginalData } from '../../types/forms/ProductFormTypes'

export function useProductForm() {
  // Get store values
  const productsStore = useProductsStore()
  const { isEditMode, currentEditingProduct } = storeToRefs(productsStore)
  
  // Use computed values for reactivity
  const isEdit = computed(() => isEditMode.value)
  const product = computed(() => currentEditingProduct.value)
  const formVisible = ref(false)
  const isSubmitting = ref(false)
  const imageFiles = ref<File[]>([])
  const fileList = ref<UploadUserFile[]>([])
  
  // Store original data for comparison
  const originalData = ref<ProductOriginalData>({} as ProductOriginalData)
  
  // Form data
  const form = reactive<ProductFormData>({
    title: '',
    description: '',
    cost: 0,
    productGroupId: null,
    visible: true // Default to true
  })
  
  // Form validation
  const formValid = computed(() => {
    return (
      form.title && 
      form.title.trim() !== '' && 
      form.cost > 0 &&
      form.productGroupId !== null &&
      // In edit mode, we don't require a new image
      (isEdit.value || imageFiles.value.length > 0)
    )
  })
  
  const open = async () => {
    // First, reset the form state
    formVisible.value = true
    console.log("FORM OPEN")
    // Wait for the modal to be visible before setting data
    await nextTick()
    
    // Reset form if not in edit mode
    if (!isEdit.value) {
		console.log("Is not edit, resetting form")
      form.title = ''
      form.description = ''
      form.cost = 0
      form.productGroupId = null
      form.visible = true
      imageFiles.value = []
      fileList.value = []
      originalData.value = {} as ProductOriginalData
    } else if (product.value) {
		console.log("Is edit, resetting form")
      // Store original values for comparison
      originalData.value = {
        title: product.value.title || '',
        description: product.value.description || '',
        cost: product.value.cost || 0,
        productGroupId: product.value.productGroup?.id || null,
        images: product.value.images || [],
        visible: product.value.visible === undefined ? true : product.value.visible // Default to true if undefined
      }
      
      // Copy values from the provided product in edit mode
      form.title = product.value.title || ''
      form.description = product.value.description || ''
      form.cost = product.value.cost || 0
      form.productGroupId = product.value.productGroup?.id || null
      form.visible = product.value.visible === undefined ? true : product.value.visible // Default to true if undefined
      
      // Set image previews if available
      if (product.value.images && product.value.images.length > 0) {
        fileList.value = product.value.images.map((image, index) => ({
          name: `existing-image-${index}`,
          url: `https://coffeecamp.ru${image.path}`
        }))
      } else {
        fileList.value = []
      }
      imageFiles.value = []
    }
  }
  
  const close = () => {
    formVisible.value = false
    // Reset image files and file list when closing the form
    imageFiles.value = []
    fileList.value = []
  }
  
  // Compare current form data with original data
  const getChangedFields = () => {
    if (!isEdit.value || !originalData.value) return null
    
    const changes: Record<string, any> = {}
    
    // Check text and number fields
    if (form.title !== originalData.value.title) changes.title = form.title
    if (form.description !== originalData.value.description) changes.description = form.description
    if (form.cost !== originalData.value.cost) changes.cost = form.cost
    if (form.productGroupId !== originalData.value.productGroupId) changes.productGroupId = form.productGroupId
    if (form.visible !== originalData.value.visible) changes.visible = form.visible
    
    // Check if images have changed
    const hasNewImages = imageFiles.value.length > 0
    
    // Check if existing images were removed
    const originalImageCount = originalData.value.images?.length || 0
    const currentExistingImageCount = fileList.value.filter(file => 
      file.name.startsWith('existing-image-')
    ).length
    
    const imagesChanged = hasNewImages || (originalImageCount !== currentExistingImageCount)
    
    return { changes, imagesChanged }
  }
  
  const createFormData = () => {
    const formData = new FormData()
    
    if (isEdit.value && product.value) {
      // In edit mode, only send changed fields
      const { changes, imagesChanged } = getChangedFields() || {}
      
      // Add ID for edit mode
      if (product.value.id) {
        formData.append('id', product.value.id.toString())
      }
      
      // Add changed text fields
      Object.entries(changes || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString())
        }
      })
      
      // If images changed, handle them
      if (imagesChanged) {
        // When fileList is empty, pass an empty array to indicate all images should be removed
        if (fileList.value.length === 0) {
          formData.append('existingImages', "false")
        } else {
          // Append all new images
          if (imageFiles.value.length > 0) {
            imageFiles.value.forEach((file, index) => {
              formData.append(`images[${index}]`, file)
            })
          }
          
          // Find existing images that are still in the fileList
          if (product.value.images) {
            const existingImageIds = product.value.images
              .filter((_, index) => {
                // Check if this existing image is still in fileList
                return fileList.value.some(file => file.name === `existing-image-${index}`)
              })
              .map(image => image.id)
            
            // Append existing image IDs
            existingImageIds.forEach((id, index) => {
              formData.append(`existingImages[${index}]`, id.toString())
            })
          }
        }
      }
    } else {
      // In create mode, send all fields
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('cost', form.cost.toString())
      formData.append('productGroupId', form.productGroupId!.toString())
      formData.append('visible', form.visible.toString())
      
      // Append all new images
      if (imageFiles.value.length > 0) {
        imageFiles.value.forEach((file, index) => {
          formData.append(`images[${index}]`, file)
        })
      }
    }
    
    return formData
  }
  
  const handleSubmit = async () => {
    if (!formValid.value) {
      ElMessage.warning('Пожалуйста, заполните все обязательные поля')
      return null
    }
    
    isSubmitting.value = true
    
    try {
      const formData = createFormData()
      return formData
    } catch (error) {
      console.error('Form submission error:', error)
      return null
    } finally {
      isSubmitting.value = false
    }
  }
  
  const updateImageFiles = (files: File[]) => {
    imageFiles.value = files
  }
  
  return {
    form,
    formVisible,
    isSubmitting,
    formValid,
    fileList,
    imageFiles,
    open,
    close,
    handleSubmit,
    updateImageFiles
  }
}