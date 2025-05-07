<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductGroupsStore } from '../stores/product-groups'
import { storeToRefs } from 'pinia'
import ConfirmationDialog from './ConfirmationDialog.vue'
import ProductGroupForm from './ProductGroupForm.vue'
import type { ProductGroup } from '../types'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'

const productGroupsStore = useProductGroupsStore()
const { sortedProductGroups, isLoading, error } = storeToRefs(productGroupsStore)

// Fetch product groups when component is mounted
onMounted(() => {
  productGroupsStore.fetchProductGroups()
})

// Form handling
const productGroupFormRef = ref<InstanceType<typeof ProductGroupForm> | null>(null)
const groupToEdit = ref<ProductGroup | null>(null)

const openAddForm = () => {
  groupToEdit.value = null
  productGroupFormRef.value?.open()
}

const openEditForm = (group: ProductGroup) => {
  groupToEdit.value = group
  productGroupFormRef.value?.open()
}

const handleFormSubmit = async (groupData: Partial<ProductGroup>) => {
  try {
    if (groupToEdit.value) {
      // Edit existing group
      await productGroupsStore.editProductGroup(groupToEdit.value.id, groupData)
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
    
    <el-empty v-else-if="sortedProductGroups.length === 0" description="Группы продуктов не найдены" />
    
    <el-table v-else :data="sortedProductGroups" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="Название" />
      <el-table-column prop="priority" label="Приоритет" width="150" />
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
      title="Удалить группу продуктов"
      :message="`Вы уверены, что хотите удалить '${groupToDelete?.title || ''}'? Это действие нельзя отменить, и оно может не выполниться, если с этой группой связаны продукты.`"
      confirm-button-text="Удалить"
      @confirm="handleDeleteConfirmed"
    />
    
    <!-- Product Group Form -->
    <ProductGroupForm
      ref="productGroupFormRef"
      :product-group="groupToEdit"
      :is-edit="!!groupToEdit"
      @submit="handleFormSubmit"
    />
  </el-card>
</template>

<style scoped>
.product-group-list {
  padding: 1rem;
}
</style>