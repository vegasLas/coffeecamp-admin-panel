<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElButton, ElDialog } from 'element-plus'

const props = defineProps<{
  visible: boolean
  title: string
  loading?: boolean
  submitDisabled?: boolean
  submitLabel?: string
  cancelLabel?: string
  width?: string
  mobileWidth?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'cancel'): void
  (e: 'submit'): void
}>()

// Responsive dialog width
const window = ref(globalThis.window)
const windowWidth = ref(window.value.innerWidth)

// Update window width on resize
window.value.addEventListener('resize', () => {
  windowWidth.value = window.value.innerWidth
})

const dialogWidth = computed(() => {
  return windowWidth.value <= 768 ? props.mobileWidth || '90%' : props.width || '50%'
})

const handleCancel = () => {
  emit('cancel')
  visibleComputed.value = false
}

const handleSubmit = () => {
  emit('submit')
}

// Computed property for v-model binding
const visibleComputed = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})
</script>

<template>
  <ElDialog
    v-model="visibleComputed"
    :title="title"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <!-- Form content -->
    <slot></slot>
    
    <!-- Dialog footer -->
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">
          {{ cancelLabel || 'Отмена' }}
        </ElButton>
        <ElButton
          type="primary"
          :loading="loading"
          :disabled="submitDisabled"
          @click="handleSubmit"
        >
          {{ submitLabel || 'Сохранить' }}
        </ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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