<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

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

interface Props {
  title: string
  visible: boolean
  width?: string
  mobileWidth?: string
  loading?: boolean
  submitLabel?: string
  cancelLabel?: string
  submitDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '40%',
  mobileWidth: '90%',
  loading: false,
  submitLabel: 'Сохранить',
  cancelLabel: 'Отмена',
  submitDisabled: false
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'cancel'): void
  (e: 'submit'): void
}>()

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleSubmit = () => {
  emit('submit')
}

const dialogWidth = computed(() => {
  return window.value.innerWidth <= 768 ? props.mobileWidth : props.width
})
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="dialogWidth"
    center
    destroy-on-close
    @close="handleCancel"
    @update:modelValue="$emit('update:visible', $event)"
  >
    <slot></slot>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" :disabled="loading">{{ cancelLabel }}</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit" 
          :loading="loading"
          :disabled="submitDisabled"
        >
          {{ submitLabel }}
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