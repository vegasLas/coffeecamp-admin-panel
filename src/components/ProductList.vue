<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductsStore } from '../stores/products'
import { storeToRefs } from 'pinia'
import ConfirmationDialog from './ConfirmationDialog.vue'
import ProductForm from './ProductForm.vue'
import type { Product } from '../types'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'
import { ElCarousel, ElCarouselItem } from 'element-plus'

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
const message = computed(() => {
  return productToDelete.value ? `Вы уверены, что хотите удалить продукт "${productToDelete.value.title}"?` : ''
})
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
    
    <div class="overflow-x-auto pb-2" v-else>
      <el-table 
        :data="sortedProducts" 
        stripe 
        style="width: 100%"
        :default-sort="{ prop: 'productGroup.title', order: 'ascending' }"
        table-layout="auto"
        size="small"
        class="responsive-table"
      >
        <el-table-column prop="title" label="Название" min-width="120">
          <template #default="{ row }">
            <div class="flex items-center">
              <!-- Mobile-only image thumbnail -->
              <div class="mr-2 md:hidden">
                <div class="w-32 h-20 overflow-hidden rounded">
                  <el-carousel v-if="row.images && row.images.length > 0" height="5rem" :autoplay="false" indicator-position="none" arrow="hover">
                    <el-carousel-item v-for="image in row.images" :key="image.path">
                      <img :src="`https://coffeecamp.ru${image.path}`" class="w-full h-full object-cover" :alt="row.title" />
                    </el-carousel-item>
                  </el-carousel>
                  <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                    <span class="text-xs text-gray-400">Нет</span>
                  </div>
                </div>
              </div>
              
                <!-- Mobile-only price and group -->
                <div class="text-xs text-gray-500 md:hidden flex mb-2">
                  <el-tooltip 
                    v-if="row.description" 
                    :content="row.description" 
                    placement="top" 
                    :effect="'light'" 
                    :show-after="500"
                  >
                    <el-tag size="small" type="warning">{{ row.title }}</el-tag>
                  </el-tooltip>
                  <el-tag size="small" type="info">{{ row.productGroup.title }}</el-tag>
                  <el-tag size="small" type="success">₽{{ row.cost.toFixed(2) }}</el-tag>
                </div>
            </div>
            <spap class="hidden md:inline">
              <el-tooltip 
                v-if="row.description" 
                :content="row.description" 
                placement="top" 
                :effect="'light'" 
                :show-after="500"
              >
                <el-tag size="small" type="warning">{{ row.title }}</el-tag>
              </el-tooltip>
            </spap>
          </template>
        </el-table-column>
        
        <!-- Desktop-only image column -->
        <el-table-column prop="images" label="Изображение" width="200" class-name="hidden md:table-cell">
          <template #default="{ row }">
            <div class="w-48 h-32 overflow-hidden rounded">
              <el-carousel v-if="row.images && row.images.length > 0" height="128px" :autoplay="false" indicator-position="none" arrow="hover" trigger="click">
                <el-carousel-item v-for="image in row.images" :key="image.path">
                  <img :src="`https://coffeecamp.ru${image.path}`" class="w-full h-full object-cover" :alt="row.title" />
                </el-carousel-item>
              </el-carousel>
              <div v-else class="w-full h-full flex items-center">
                <el-tag type="info" size="small">Нет фото</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <!-- Desktop-only group column -->
        <el-table-column prop="productGroup.title" label="Группа" class-name="hidden md:table-cell" />
        
        <!-- Desktop-only price column -->
        <el-table-column prop="cost" label="Цена" width="120" class-name="hidden md:table-cell">
          <template #default="{ row }">
            ₽{{ row.cost.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column label="Видимость" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.visible ? 'success' : 'danger'" size="small">
              {{ row.visible ? 'Виден' : 'Скрыт' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="Действия" width="120" align="center">
          <template #default="{ row }">
            <div class="flex space-x-2 justify-center">
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
    </div>
    
    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      ref="confirmDialogRef"
      title="Удалить продукт"
      :message="message"
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


@media (max-width: 768px) {
  .product-list {
    padding: 0.5rem;
  }
  
  /* Increase touch targets on mobile */
  .responsive-table :deep(.el-button) {
    margin: 0.25rem 0;
  }
  
  /* Improve spacing in table cells */
  .responsive-table :deep(.el-table__row td) {
    padding: 12px 8px;
  }
}
</style>