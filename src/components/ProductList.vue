<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductsStore } from '../stores/products'
import { storeToRefs } from 'pinia'
import ConfirmationDialog from './ConfirmationDialog.vue'
import type { Product } from '../types'

const productsStore = useProductsStore()
const { sortedProducts, isLoading, error } = storeToRefs(productsStore)

// Fetch products when component is mounted
onMounted(() => {
  productsStore.fetchProducts()
})

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
        <el-button type="primary" size="small" icon="el-icon-plus">
          Добавить продукт
        </el-button>
      </div>
    </template>
    
    <el-skeleton :rows="3" animated v-if="isLoading" />
    
    <el-alert
      v-else-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
    />
    
    <el-empty v-else-if="sortedProducts.length === 0" description="Продукты не найдены" />
    
    <el-table v-else :data="sortedProducts" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="Название" />
      <el-table-column prop="productGroup.title" label="Группа" />
      <el-table-column prop="cost" label="Цена" width="120">
        <template #default="{ row }">
          ${{ row.cost.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="200">
        <template #default="{ row }">
          <div class="flex space-x-2">
            <el-button size="small" type="primary" icon="el-icon-edit">Изменить</el-button>
            <el-button 
              size="small" 
              type="danger" 
              icon="el-icon-delete"
              @click="confirmDelete(row)"
            >
              Удалить
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
  </el-card>
</template>

<style scoped>
.product-list {
  padding: 1rem;
}
</style>