<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductGroupsStore } from '../stores/product-groups'
import { useProductsStore } from '../stores/products'
import { storeToRefs } from 'pinia'
import ConfirmationDialog from './ConfirmationDialog.vue'
import ProductGroupForm from './ProductGroupForm.vue'
import type { ProductGroup } from '../types'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'

const productGroupsStore = useProductGroupsStore()
const { sortedProductGroups, isLoading, error } = storeToRefs(productGroupsStore)

// Products store for counting products in each group
const productsStore = useProductsStore()
const { getProductsByGroup } = storeToRefs(productsStore)

// Fetch products when component is mounted
onMounted(() => {
  productsStore.fetchProducts()
})

// Fetch product groups when component is mounted
onMounted(() => {
  productGroupsStore.fetchProductGroups()
})

// Form handling
const productGroupFormRef = ref<InstanceType<typeof ProductGroupForm> | null>(null)

const openAddForm = () => {
  // Set store state for add mode
  productGroupsStore.setEditMode(null)
  productGroupFormRef.value?.open()
}

const openEditForm = (group: ProductGroup) => {
  // Set store state for edit mode
  productGroupsStore.setEditMode(group)
  productGroupFormRef.value?.open()
}

const handleFormSubmit = async (groupData: Partial<ProductGroup>) => {
  try {
    if (productGroupsStore.isEditMode && productGroupsStore.currentEditingProductGroup) {
      // Edit existing group
      await productGroupsStore.editProductGroup(productGroupsStore.currentEditingProductGroup.id, groupData)
      ElMessage.success(`Группа продуктов "${groupData.title}" была обновлена`)
    } else {
      // Add new group
      await productGroupsStore.addProductGroup(groupData)
      ElMessage.success(`Группа продуктов "${groupData.title}" была добавлена`)
    }
  } catch (err) {
    ElMessage.error(error.value || 'Не удалось сохранить группу продуктов')
  }
}

// Delete confirmation
const confirmDialogRef = ref<InstanceType<typeof ConfirmationDialog> | null>(null)
const groupToDelete = ref<ProductGroup | null>(null)

// Compute the number of products in the group to be deleted
const productsInGroup = computed(() => {
  if (!groupToDelete.value) return 0
  return getProductsByGroup.value.get(groupToDelete.value.id)?.length || 0
})
// Warning message for products that will be deleted
const warningMessage = computed(() => {
  if (!groupToDelete.value || productsInGroup.value === 0) return ''
  
  return `ВНИМАНИЕ: Это действие удалит группу и все ${productsInGroup.value} продуктов, связанных с ней. Это действие нельзя отменить.`
})
// Compute the confirmation message with product count
const confirmationMessage = computed(() => {
  if (!groupToDelete.value) return ''
  
  const baseMessage = `Вы уверены, что хотите удалить \"${groupToDelete.value.title}\"?`
  
  if (productsInGroup.value > 0) {
    return `${baseMessage}\n\n${warningMessage.value}`
  }
  
  return `${baseMessage} Это действие нельзя отменить.`
})



const confirmDelete = (group: ProductGroup) => {
  groupToDelete.value = group
  confirmDialogRef.value?.open()
}

const handleDeleteConfirmed = async () => {
  if (!groupToDelete.value) return
  
  try {
    await productGroupsStore.removeProductGroup(groupToDelete.value.id)
    ElMessage.success(`Группа продуктов "${groupToDelete.value.title}" была удалена`)
  } catch (err) {
    ElMessage.error(error.value || 'Не удалось удалить группу продуктов')
  } finally {
    groupToDelete.value = null
  }
}
</script>

<template>
  <el-card class="product-group-list">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Группы продуктов</h2>
        <el-button type="primary" size="small" circle @click="openAddForm">
          <el-icon><Plus /></el-icon>
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
    
    <el-empty v-else-if="sortedProductGroups.length === 0" description="Группы не найдены" />
    
    <div class="overflow-x-auto pb-2" v-else>
      <el-table 
        :data="sortedProductGroups" 
        stripe 
        style="width: 100%"
        table-layout="auto"
        size="small"
        class="responsive-table"
      >
        <el-table-column prop="title" label="Название" min-width="120">
          <template #default="{ row }">
            <div>
              <span class="font-medium">{{ row.title }}</span>
              
              <!-- Mobile-only product count and visibility -->
              <div class="text-xs text-gray-500 md:hidden mt-1 flex items-center space-x-2">
                <el-tag type="info" size="small">
                  {{ getProductsByGroup.get(row.id)?.length || 0 }} продуктов
                </el-tag>
                <el-tag :type="row.visible ? 'success' : 'danger'" size="small">
                  {{ row.visible ? 'Видна' : 'Скрыта' }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <!-- Desktop-only product count column -->
        <el-table-column label="Кол-во продуктов" width="150" class-name="hidden md:table-cell">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ getProductsByGroup.get(row.id)?.length || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="priority" label="Приоритет" width="120" class-name="hidden md:table-cell" />
        
        <!-- Desktop-only visibility column -->
        <el-table-column label="Видимость" width="120" class-name="hidden md:table-cell">
          <template #default="{ row }">
            <el-tag :type="row.visible ? 'success' : 'danger'" size="small">
              {{ row.visible ? 'Видна' : 'Скрыта' }}
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
      title="Удалить группу продуктов"
      :message="confirmationMessage"
      confirm-button-text="Удалить"
      @confirm="handleDeleteConfirmed"
    >
      <template #extra>
        <el-alert
          v-if="productsInGroup > 0"
          :title="warningMessage"
          type="error"
          effect="dark"
          :closable="false"
          class="mb-4"
        />
      </template>
    </ConfirmationDialog>
    
    <!-- Product Group Form -->
    <ProductGroupForm
      ref="productGroupFormRef"
      @submit="handleFormSubmit"
    />
  </el-card>
</template>

<style scoped>
.product-group-list {
  padding: 1rem;
}

/* Improve spacing in table cells */
.responsive-table :deep(.el-table__row td) {
  padding: 12px 8px;
}
</style>