<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductGroupsStore } from '../stores/product-groups'
import { storeToRefs } from 'pinia'
import type { Product } from '../types'
import BaseFormModal from './BaseFormModal.vue'
import { Plus, Delete, ZoomIn } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile, UploadFile } from 'element-plus'

interface Props {
  product: Product | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  product: undefined,
  isEdit: false
})

const emit = defineEmits<{
  (e: 'submit', formData: FormData): void
  (e: 'cancel'): void
}>()

const formVisible = ref(false)
const modalTitle = computed(() => props.isEdit ? 'Редактировать продукт' : 'Добавить продукт')
const submitLabel = computed(() => props.isEdit ? 'Сохранить' : 'Добавить')
const isSubmitting = ref(false)
const imageFiles = ref<File[]>([])
const fileList = ref<UploadUserFile[]>([])

// Store original data for comparison
const originalData = ref<{
  title: string
  description: string
  cost: number
  productGroupId: number | null
  images?: any[]
}>({} as any)

// Get product groups for the dropdown
const productGroupsStore = useProductGroupsStore()
const { sortedProductGroups, isLoading: isLoadingGroups } = storeToRefs(productGroupsStore)

onMounted(() => {
  if (sortedProductGroups.value.length === 0) {
    productGroupsStore.fetchProductGroups()
  }
  // Note: Window resize event listener is already set up above
})

// Form data
const form = reactive<{
  title: string
  description: string
  cost: number
  productGroupId: number | null
}>({ 
  title: '',
  description: '',
  cost: 0,
  productGroupId: null
})



// Form validation
const formValid = computed(() => {
  return (
    form.title && 
    form.title.trim() !== '' && 
    form.cost > 0 &&
    form.productGroupId !== null &&
    // In edit mode, we don't require a new image
    (props.isEdit || imageFiles.value.length > 0)
  )
})

const open = async () => {
  // First, reset the form state
  formVisible.value = true
  
  // Wait for the modal to be visible before setting data
  await nextTick()
  
  // Reset form if not in edit mode
  if (!props.isEdit) {
    form.title = ''
    form.description = ''
    form.cost = 0
    form.productGroupId = null
    imageFiles.value = []
    fileList.value = []
    originalData.value = {} as any
  } else if (props.product) {
    // Store original values for comparison
    originalData.value = {
      title: props.product.title || '',
      description: props.product.description || '',
      cost: props.product.cost || 0,
      productGroupId: props.product.productGroup?.id || null,
      images: props.product.images || []
    }
    
    // Copy values from the provided product in edit mode
    form.title = props.product.title || ''
    form.description = props.product.description || ''
    form.cost = props.product.cost || 0
    form.productGroupId = props.product.productGroup?.id || null
    
    // Set image previews if available
    if (props.product.images && props.product.images.length > 0) {
      fileList.value = props.product.images.map((image, index) => ({
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
}

const handleCancel = () => {
  emit('cancel')
  close()
}

const handleExceed = (files: File[]) => {
  ElMessage.warning(`Максимальное количество изображений: 5. Вы пытаетесь добавить еще ${files.length} изображений.`)
}

const handleRemove = (file: UploadFile) => {
  // Remove from fileList
  const index = fileList.value.findIndex(item => item.name === file.name)
  if (index !== -1) {
    fileList.value.splice(index, 1)
  }
  
  // Remove from imageFiles if it's a new upload
  if (file.raw) {
    const fileIndex = imageFiles.value.findIndex(f => f === file.raw)
    if (fileIndex !== -1) {
      imageFiles.value.splice(fileIndex, 1)
    }
  }
}

const handlePreview = (file: UploadFile) => {
  // Open image in a new tab for preview
  if (file.url) {
    window.open(file.url)
  }
}

const handleChange: UploadProps['onChange'] = (file, uploadFiles) => {
  // Update fileList for UI
  fileList.value = uploadFiles
  
  // Update imageFiles for form submission
  if (file.raw && !imageFiles.value.includes(file.raw)) {
    imageFiles.value.push(file.raw)
  }
}

const beforeImageUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('Можно загружать только изображения!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('Размер изображения не должен превышать 2MB!')
    return false
  }
  return true
}

// Compare current form data with original data
const getChangedFields = () => {
  if (!props.isEdit || !originalData.value) return null
  
  const changes: Record<string, any> = {}
  
  // Check text and number fields
  if (form.title !== originalData.value.title) changes.title = form.title
  if (form.description !== originalData.value.description) changes.description = form.description
  if (form.cost !== originalData.value.cost) changes.cost = form.cost
  if (form.productGroupId !== originalData.value.productGroupId) changes.productGroupId = form.productGroupId
  
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

const handleSubmit = async () => {
  if (!formValid.value) {
    ElMessage.warning('Пожалуйста, заполните все обязательные поля')
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Create FormData object for file upload
    const formData = new FormData()
    
    if (props.isEdit) {
      // In edit mode, only send changed fields
      const { changes, imagesChanged } = getChangedFields() || {}
      
      // Add ID for edit mode
      if (props.product?.id) {
        formData.append('id', props.product.id.toString())
      }
      
      // Add changed text fields
      Object.entries(changes || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString())
        }
      })
      
      // If images changed, handle them
      if (imagesChanged) {
        // Append all new images
        if (imageFiles.value.length > 0) {
          imageFiles.value.forEach((file, index) => {
            formData.append(`images[${index}]`, file)
          })
        }
        
        // Find existing images that are still in the fileList
        if (props.product?.images) {
          const existingImageIds = props.product.images
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
    } else {
      // In create mode, send all fields
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('cost', form.cost.toString())
      formData.append('productGroupId', form.productGroupId!.toString())
      
      // Append all new images
      if (imageFiles.value.length > 0) {
        imageFiles.value.forEach((file, index) => {
          formData.append(`images[${index}]`, file)
        })
      }
    }
    
    emit('submit', formData)
    close()
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Expose methods to parent component
defineExpose({
  open,
  close
})
</script>

<template>
  <BaseFormModal
    v-model:visible="formVisible"
    :title="modalTitle"
    :loading="isSubmitting"
    :submit-disabled="!formValid"
    :submit-label="submitLabel"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <el-form :model="form" label-position="top">
      <el-form-item label="Название" required>
        <el-input v-model="form.title" placeholder="Введите название продукта" />
      </el-form-item>
      
      <el-form-item label="Описание">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="3"
          placeholder="Введите описание продукта" 
        />
      </el-form-item>
      
      <el-form-item label="Цена" required>
        <el-input-number 
          v-model="form.cost" 
          :min="0.01" 
          :precision="2"
          :step="0.5"
          placeholder="Введите цену"
        />
      </el-form-item>
      
      <el-form-item label="Группа продуктов" required>
        <el-select 
          v-model="form.productGroupId" 
          placeholder="Выберите группу продуктов"
          style="width: 100%"
          :loading="isLoadingGroups"
        >
          <el-option 
            v-for="group in sortedProductGroups" 
            :key="group.id" 
            :label="group.title" 
            :value="group.id" 
          />
        </el-select>
      </el-form-item>
      
      <el-form-item :label="props.isEdit ? 'Изменить изображения' : 'Изображения'" :required="!props.isEdit">
        <el-upload
          class="mr-4"
          action="#"
          :auto-upload="false"
          list-type="picture-card"
          :file-list="fileList"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :on-preview="handlePreview"
          :before-upload="beforeImageUpload"
          :on-exceed="handleExceed"
          :limit="5"
          multiple
        >
          <el-icon><Plus /></el-icon>
          <template #file="{ file }">
            <div> 
            <img class="el-upload-list__item-thumbnail" :src="`${file.url}`" alt="" />
              <span class="el-upload-list__item-actions">
                <span class="el-upload-list__item-preview" @click="handlePreview(file)">
                  <el-icon><zoom-in /></el-icon>
                </span>
                <span class="el-upload-list__item-delete" @click="handleRemove(file)">
                  <el-icon><Delete /></el-icon>
                </span>
              </span>
            </div>
          </template>
        </el-upload>
        <div class="text-xs text-gray-500 mt-1">
          Вы можете загрузить до 5 изображений (макс. 2MB каждое)
        </div>
      </el-form-item>
    </el-form>
  </BaseFormModal>
</template>

<style scoped></style>