<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
  message: string
  confirmButtonText?: string
  cancelButtonText?: string
  confirmButtonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  width?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Подтвердите действие',
  confirmButtonText: 'Подтвердить',
  cancelButtonText: 'Отмена',
  confirmButtonType: 'danger',
  width: '30%'
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'update:visible', value: boolean): void
}>()

const dialogVisible = ref(false)

const setVisible = (value: boolean) => {
  dialogVisible.value = value
  emit('update:visible', value)
}

const handleConfirm = () => {
  emit('confirm')
  setVisible(false)
}

const handleCancel = () => {
  emit('cancel')
  setVisible(false)
}

// Expose methods to parent component
defineExpose({
  open: () => setVisible(true),
  close: () => setVisible(false)
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    center
    destroy-on-close
    @close="handleCancel"
  >
    <span>{{ message }}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">{{ cancelButtonText }}</el-button>
        <el-button :type="confirmButtonType" @click="handleConfirm">
          {{ confirmButtonText }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>