<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Props {
  title?: string
  message: string
  confirmButtonText?: string
  cancelButtonText?: string
  confirmButtonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  width?: string
  mobileWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Подтвердите действие',
  confirmButtonText: 'Подтвердить',
  cancelButtonText: 'Отмена',
  confirmButtonType: 'danger',
  width: '30%',
  mobileWidth: '90%'
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'update:visible', value: boolean): void
}>()

// Responsive dialog width
const window = ref(globalThis.window)
const windowWidth = ref(window.value.innerWidth)

const updateWindowWidth = () => {
  windowWidth.value = window.value.innerWidth
}

onMounted(() => {
  window.value.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.value.removeEventListener('resize', updateWindowWidth)
})

const dialogVisible = ref(false)

const dialogWidth = computed(() => {
  return window.value.innerWidth <= 768 ? props.mobileWidth : props.width
})

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
    :width="dialogWidth"
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

@media (max-width: 768px) {
  .dialog-footer {
    flex-direction: column-reverse;
    width: 100%;
  }
  
  .dialog-footer .el-button {
    width: 100%;
    margin-left: 0;
    margin-bottom: 8px;
  }
}
</style>