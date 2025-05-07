<script setup lang="ts">
import { computed } from 'vue'
import BaseFormModal from './BaseFormModal.vue'
import { useProductGroupForm } from '../composables/forms/useProductGroupForm'
import { useProductGroupsStore } from '../stores/product-groups'
import type { ProductGroupFormEmits } from '../types/forms/ProductGroupFormTypes'

// Define props without isEdit and productGroup since we'll use the store

const emit = defineEmits<ProductGroupFormEmits>()

// Get the product groups store for isEdit state
const productGroupsStore = useProductGroupsStore()
const isEdit = computed(() => productGroupsStore.isEditMode)

// Initialize the form composable - no need to pass productGroup or isEdit
const {
  form,
  formVisible,
  isSubmitting,
  formValid,
  open,
  close,
  handleSubmit
} = useProductGroupForm()

// Handle form submission
const onSubmit = async () => {
  const result = await handleSubmit()
  if (result) {
    emit('submit', result)
    close()
  }
}

// Handle form cancellation
const onCancel = () => {
  close()
  emit('cancel')
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
    :title="isEdit ? 'Редактировать группу товаров' : 'Добавить группу товаров'"
    :loading="isSubmitting"
    :submit-disabled="!formValid"
    :submit-label="isEdit ? 'Сохранить' : 'Добавить'"
    @cancel="onCancel"
    @submit="onSubmit"
  >
    <el-form label-position="top" status-icon>
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
          Группы с более высоким приоритетом отображаются первыми (0-10)
        </div>
      </el-form-item>
    </el-form>
  </BaseFormModal>
</template>