<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useReviewsStore } from '../stores/reviews'
import { storeToRefs } from 'pinia'
import ConfirmationDialog from './ConfirmationDialog.vue'
import type { Review } from '../types'

const reviewsStore = useReviewsStore()
const { sortedReviews, isLoading, error } = storeToRefs(reviewsStore)

// Fetch reviews when component is mounted
onMounted(() => {
  reviewsStore.fetchReviews()
})

// Delete confirmation
const confirmDialogRef = ref<InstanceType<typeof ConfirmationDialog> | null>(null)
const reviewToDelete = ref<Review | null>(null)

const confirmDelete = (review: Review) => {
  reviewToDelete.value = review
  confirmDialogRef.value?.open()
}

const handleDeleteConfirmed = async () => {
  if (!reviewToDelete.value) return
  
  try {
    await reviewsStore.removeReview(reviewToDelete.value.id)
    ElMessage.success(`Отзыв от "${reviewToDelete.value.name}" был удален`)
  } catch (err) {
    ElMessage.error(error.value || 'Не удалось удалить отзыв')
  } finally {
    reviewToDelete.value = null
  }
}

// Форматирование даты
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <el-card class="review-list">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Отзывы клиентов</h2>
        <el-button type="primary" size="small" circle>
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
    
    <el-empty v-else-if="sortedReviews.length === 0" description="Отзывы не найдены" />
    
    <el-table v-else :data="sortedReviews" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="Клиент" />
      <el-table-column prop="rating" label="Оценка" width="120">
        <template #default="{ row }">
          <el-rate 
            v-model="row.rating" 
            disabled 
            show-score 
            text-color="#ff9900"
          />
        </template>
      </el-table-column>
      <el-table-column prop="comment" label="Комментарий" show-overflow-tooltip />
      <el-table-column prop="timestamp" label="Дата" width="120">
        <template #default="{ row }">
          {{ formatDate(row.timestamp) }}
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="100">
        <template #default="{ row }">
          <el-button 
            size="small" 
            type="danger" 
            @click="confirmDelete(row)"
            circle
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      ref="confirmDialogRef"
      title="Удалить отзыв"
      :message="`Вы уверены, что хотите удалить отзыв от '${reviewToDelete?.name || ''}'? Это действие нельзя отменить.`"
      confirm-button-text="Удалить"
      @confirm="handleDeleteConfirmed"
    />
  </el-card>
</template>

<style scoped>
.review-list {
  padding: 1rem;
}
</style>