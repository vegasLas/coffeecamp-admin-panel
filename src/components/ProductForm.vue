<script setup lang="ts">
import { computed } from 'vue'
import { useProductGroupsStore } from '../stores/product-groups'
import { useProductsStore } from '../stores/products'
import BaseFormModal from './BaseFormModal.vue'
import ProductImageUpload from './product/ProductImageUpload.vue'

import { useProductForm } from '../composables/forms/useProductForm'
import type { ProductFormEmits } from '../types/forms/ProductFormTypes'



const emit = defineEmits<ProductFormEmits>()

// Get product groups for the dropdown
const productGroupStore = useProductGroupsStore()
const productGroups = computed(() => productGroupStore.productGroups)

// Get the products store for isEdit state
const productsStore = useProductsStore()
const isEdit = computed(() => productsStore.isEditMode)

// Initialize the form composable - no need to pass product or isEdit
const {
  form,
  formVisible,
  isSubmitting,
  formValid,
  fileList,
  open,
  close,
  handleSubmit,
  updateImageFiles
} = useProductForm()

// Handle form submission
const onSubmit = async () => {
  const formData = await handleSubmit()
  if (formData) {
    emit('submit', formData)
    close()
  }
}

// Handle form cancellation
const onCancel = () => {
  close()
  emit('cancel')
}

// Handle image file changes
const handleFilesChanged = (files: File[]) => {
  updateImageFiles(files)
}

// Expose the open method to parent components
defineExpose({ open })
</script>

<template>
  <BaseFormModal
    v-model:visible="formVisible"
    :title="isEdit ? 'Редактировать товар' : 'Добавить товар'"
    :loading="isSubmitting"
    :submit-disabled="!formValid"
    @cancel="onCancel"
    @submit="onSubmit"
  >
    <el-form label-position="top">
      
      <!-- Product Title -->
      <el-form-item label="Название" required>
        <el-input v-model="form.title" placeholder="Введите название товара" />
      </el-form-item>
      
      <!-- Product Group Selection -->
      <el-form-item label="Группа товаров" required>
        <el-select
          v-model="form.productGroupId"
          placeholder="Выберите группу товаров"
          class="w-full"
        >
          <el-option
            v-for="group in productGroups"
            :key="group.id"
            :label="group.title"
            :value="group.id"
          />
        </el-select>
      </el-form-item>

      <!-- Product Description -->
      <el-form-item label="Описание">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="Введите описание товара"
        />
      </el-form-item>

      <!-- Product Cost -->
      <el-form-item label="Цена" required>
        <el-input-number
          v-model="form.cost"
          :min="0"
          :precision="2"
          :step="10"
          class="w-full"
        />
      </el-form-item>

      <!-- Product Images -->
      <ProductImageUpload
        v-model:fileList="fileList"
        :formVisible="formVisible"
        :is-edit="isEdit"
        :required="!isEdit"
        @files-changed="handleFilesChanged"
      />
    </el-form>
  </BaseFormModal>
</template>