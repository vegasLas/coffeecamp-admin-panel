<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductGroupsStore } from '../stores/product-groups'
import { storeToRefs } from 'pinia'
import type { Product } from '../types'

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
const isSubmitting = ref(false)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string>('')

// Get product groups for the dropdown
const productGroupsStore = useProductGroupsStore()
const { sortedProductGroups, isLoading: isLoadingGroups } = storeToRefs(productGroupsStore)

onMounted(() => {
  if (sortedProductGroups.value.length === 0) {
    productGroupsStore.fetchProductGroups()
  }
})

// Form data
const form = reactive<{
  title: string
  description: string
  cost: number
  productGroupId: number | null
}>({ 
  title: props.product?.title || '',
  description: props.product?.description || '',
  cost: props.product?.cost || 0,
  productGroupId: props.product?.productGroup?.id || null
})

// Form validation
const formValid = computed(() => {
  return (
    form.title && 
    form.title.trim() !== '' && 
    form.cost > 0 &&
    form.productGroupId !== null &&
    // In edit mode, we don't require a new image
    (props.isEdit || imageFile.value !== null)
  )
})

const open = () => {
  // Reset form if not in edit mode
  if (!props.isEdit) {
    form.title = ''
    form.description = ''
    form.cost = 0
    form.productGroupId = null
    imageFile.value = null
    imagePreview.value = ''
  } else if (props.product) {
    // Copy values from the provided product in edit mode
    form.title = props.product.title
    form.description = props.product.description
    form.cost = props.product.cost
    form.productGroupId = props.product.productGroup.id
    
    // Set image preview if available
    if (props.product.images && props.product.images.length > 0) {
      imagePreview.value = props.product.images[0].path
    } else {
      imagePreview.value = ''
    }
  }
  
  formVisible.value = true
}

const close = () => {
  formVisible.value = false
}

const handleCancel = () => {
  emit('cancel')
  close()
}

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    imageFile.value = target.files[0]
    imagePreview.value = URL.createObjectURL(imageFile.value)
  }
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
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('cost', form.cost.toString())
    formData.append('productGroupId', form.productGroupId!.toString())
    
    // Only append image if it's a new product or if a new image was selected
    if (imageFile.value) {
      formData.append('image', imageFile.value)
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
  <el-dialog
    v-model="formVisible"
    :title="props.isEdit ? 'Редактировать продукт' : 'Добавить продукт'"
    width="40%"
    center
    destroy-on-close
    @close="handleCancel"
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
      
      <el-form-item :label="props.isEdit ? 'Изменить изображение' : 'Изображение'" :required="!props.isEdit">
        <input 
          type="file" 
          accept="image/*" 
          @change="handleImageChange"
          class="mb-2"
        />
        
        <div v-if="imagePreview" class="mt-2">
          <p class="text-sm text-gray-500 mb-1">Предпросмотр:</p>
          <img :src="imagePreview" class="max-w-full h-auto max-h-40 object-contain" />
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" :disabled="isSubmitting">Отмена</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit" 
          :loading="isSubmitting"
          :disabled="!formValid"
        >
          {{ props.isEdit ? 'Сохранить' : 'Добавить' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>