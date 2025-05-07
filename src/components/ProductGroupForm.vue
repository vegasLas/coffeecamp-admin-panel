<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { ProductGroup } from '../types'
import BaseFormModal from './BaseFormModal.vue'

interface Props {
  productGroup: ProductGroup | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  productGroup: undefined,
  isEdit: false
})

const emit = defineEmits<{
  (e: 'submit', group: Partial<ProductGroup>): void
  (e: 'cancel'): void
}>()

const formVisible = ref(false)
const modalTitle = computed(() => props.isEdit ? 'Редактировать группу продуктов' : 'Добавить группу продуктов')
const submitLabel = computed(() => props.isEdit ? 'Сохранить' : 'Добавить')
const isSubmitting = ref(false)

// Store original data for comparison
const originalData = ref<Partial<ProductGroup>>({})

// Form data
const form = reactive<Partial<ProductGroup>>({
  title: props.productGroup?.title || '',
  priority: props.productGroup?.priority || 0
})

// Form validation
const formValid = computed(() => {
  return form.title && form.title.trim() !== '' && form.priority !== undefined
})



const open = () => {
  // Reset form if not in edit mode
  if (!props.isEdit) {
    form.title = ''
    form.priority = 0
    originalData.value = {}
  } else if (props.productGroup) {
    // Store original values for comparison
    originalData.value = {
      title: props.productGroup.title,
      priority: props.productGroup.priority
    }
    
    // Copy values from the provided product group in edit mode
    form.title = props.productGroup.title
    form.priority = props.productGroup.priority
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

// Compare current form data with original data
const getChangedFields = () => {
  if (!props.isEdit || !originalData.value) return null
  
  const changes: Record<string, any> = {}
  
  // Check text and number fields
  if (form.title !== originalData.value.title) changes.title = form.title
  if (form.priority !== originalData.value.priority) changes.priority = form.priority
  
  return Object.keys(changes).length > 0 ? changes : null
}

const handleSubmit = async () => {
  if (!formValid.value) {
    ElMessage.warning('Пожалуйста, заполните все обязательные поля')
    return
  }
  
  isSubmitting.value = true
  
  try {
    if (props.isEdit && props.productGroup) {
      // In edit mode, only send changed fields and ID
      const changes = getChangedFields()
      
      if (changes) {
        emit('submit', {
          ...changes,
          id: props.productGroup.id
        })
      } else {
        // No changes, just close the form
        ElMessage.info('Нет изменений для сохранения')
        close()
        return
      }
    } else {
      // In create mode, send all fields
      emit('submit', { ...form })
    }
    
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
    <el-form :model="form" label-position="top" status-icon>
      <el-form-item label="Название" required :error="!form.title && 'Название обязательно'">
        <el-input 
          v-model="form.title" 
          placeholder="Введите название группы" 
          clearable 
          :maxlength="50"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="Приоритет" required :error="form.priority === undefined && 'Приоритет обязателен'">
          <el-slider 
            v-model="form.priority" 
            :min="0" 
            :max="10" 
            :step="1"
            show-stops
            show-tooltip
          />
        <div class="text-xs text-gray-500 mt-1">
          Группы с более высоким приоритетом отображаются первыми (0-100)
        </div>
      </el-form-item>
    </el-form>
  </BaseFormModal>
</template>

<style scoped></style>