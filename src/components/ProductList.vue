<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductsStore } from '../stores/products'
import { storeToRefs } from 'pinia'
import ConfirmationDialog from './ConfirmationDialog.vue'
import ProductForm from './ProductForm.vue'
import type { Product } from '../types'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'

const productsStore = useProductsStore()
const { sortedProducts, isLoading, error } = storeToRefs(productsStore)

// Fetch products when component is mounted
onMounted(() => {
  productsStore.fetchProducts()
})

// Form handling
const productFormRef = ref<InstanceType<typeof ProductForm> | null>(null)

const openAddForm = () => {
  // Set store state for add mode
  productsStore.setEditMode(null)
  productFormRef.value?.open()
}

const openEditForm = (product: Product) => {
  // Set store state for edit mode
  productsStore.setEditMode(product)
  productFormRef.value?.open()
}

const handleFormSubmit = async (formData: FormData) => {
  try {
    if (productsStore.isEditMode && productsStore.currentEditingProduct) {
      // Edit existing product
      await productsStore.editProduct(productsStore.currentEditingProduct.id, formData)
      ElMessage.success('Продукт был успешно обновлен')
    } else {
      // Add new product
      await productsStore.addProduct(formData)
      ElMessage.success('Продукт был успешно добавлен')
    }
  } catch (err) {
    ElMessage.error(error.value || 'Не удалось сохранить продукт')
  }
}

// Delete confirmation
const confirmDialogRef = ref<InstanceType<typeof ConfirmationDialog> | null>(null)
const productToDelete = ref<Product | null>(null)

const confirmDelete = (product: Product) => {
  productToDelete.value = product
  confirmDialogRef.value?.open()
}

const handleDeleteConfirmed = async () => {
  if (!productToDelete.value) return
  
  try {
    await productsStore.removeProduct(productToDelete.value.id)
    ElMessage.success(`Продукт "${productToDelete.value.title}" был удален`)
  } catch (err) {
    ElMessage.error(error.value || 'Не удалось удалить продукт')
  } finally {
    productToDelete.value = null
  }
}
</script>

<template>
  <el-card class="product-list">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Продукты</h2>
        <el-button type="primary" size="small" circle @click="openAddForm">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </template>
    
    <el-skeleton :rows="3" animated v-if="isLoading" />
    
    <!-- <el-alert
      v-else-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
    /> -->
    
    <el-empty v-else-if="sortedProducts.length === 0" description="Продукты не найдены" />
    
    <el-table v-else :data="sortedProducts" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="Название">
        <template #default="{ row }">
          <el-tooltip 
            v-if="row.description" 
            :content="row.description" 
            placement="top" 
            :effect="'light'" 
            :show-after="500"
          >
            <span>{{ row.title }}</span>
          </el-tooltip>
          <span v-else>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Изображение" width="140">
        <template #default="{ row }">
          <img 
            v-if="row.images && row.images.length > 0" 
            :src="`https://coffeecamp.ru${row.images[0].path}`" 
            class="w-16 h-16 object-cover rounded" 
            :alt="row.title"
          />
          <el-tag v-else type="info" size="small">Нет фото</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="productGroup.title" label="Группа" />
      <el-table-column prop="cost" label="Цена" width="120">
        <template #default="{ row }">
          ₽{{ row.cost.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="Видимость" width="120">
        <template #default="{ row }">
          <el-tag :type="row.visible ? 'success' : 'danger'" size="small">
            {{ row.visible ? 'Виден' : 'Скрыт' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="200">
        <template #default="{ row }">
          <div class="flex space-x-2">
            <el-button size="small" type="primary" circle @click="openEditForm(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              circle
              @click="confirmDelete(row)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      ref="confirmDialogRef"
      title="Удалить продукт"
      :message="`Вы уверены, что хотите удалить '${productToDelete?.title || ''}'? Это действие нельзя отменить.`"
      confirm-button-text="Удалить"
      @confirm="handleDeleteConfirmed"
    />
    
    <!-- Product Form -->
    <ProductForm
      ref="productFormRef"
      @submit="handleFormSubmit"
    />
  </el-card>
</template>

<style scoped>
.product-list {
  padding: 1rem;
}
</style>