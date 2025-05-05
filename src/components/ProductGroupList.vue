<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useProductGroupsStore } from '../stores/product-groups'
import { storeToRefs } from 'pinia'
import ConfirmationDialog from './ConfirmationDialog.vue'
import type { ProductGroup } from '../types'

const productGroupsStore = useProductGroupsStore()
const { sortedProductGroups, isLoading, error } = storeToRefs(productGroupsStore)

// Fetch product groups when component is mounted
onMounted(() => {
  productGroupsStore.fetchProductGroups()
})

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
        <el-button type="primary" size="small" icon="el-icon-plus">
          Добавить группу
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
      <el-table-column prop="priority" label="Приоритет" width="100" />
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
      title="Удалить группу продуктов"
      :message="`Вы уверены, что хотите удалить '${groupToDelete?.title || ''}'? Это действие нельзя отменить, и оно может не выполниться, если с этой группой связаны продукты.`"
      confirm-button-text="Удалить"
      @confirm="handleDeleteConfirmed"
    />
  </el-card>
</template>

<style scoped>
.product-group-list {
  padding: 1rem;
}
</style>