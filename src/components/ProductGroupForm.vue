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
  } else if (props.productGroup) {
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

const handleSubmit = async () => {
  if (!formValid.value) {
    ElMessage.warning('Пожалуйста, заполните все обязательные поля')
    return
  }
  
  isSubmitting.value = true
  
  try {
    emit('submit', {
      ...form,
      // Include ID only in edit mode
      ...(props.isEdit && props.productGroup ? { id: props.productGroup.id } : {})
    })
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
    width="30%"
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