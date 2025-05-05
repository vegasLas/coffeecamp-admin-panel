<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { ProductGroup } from '../types'

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
  productGroup: ProductGroup | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  productGroup: undefined,
  isEdit: false
})

const emit = defineEmits<{
  (e: 'submit', group: Partial<ProductGroup>): void
  (e: 'cancel'): void
}>()

const formVisible = ref(false)
const isSubmitting = ref(false)

// Form data
const form = reactive<Partial<ProductGroup>>({
  title: props.productGroup?.title || '',
  priority: props.productGroup?.priority || 0
})

// Form validation
const formValid = computed(() => {
  return form.title && form.title.trim() !== '' && form.priority !== undefined
})

const open = () => {
  // Reset form if not in edit mode
  if (!props.isEdit) {
    form.title = ''
    form.priority = 0
  } else if (props.productGroup) {
    // Copy values from the provided product group in edit mode
    form.title = props.productGroup.title
    form.priority = props.productGroup.priority
  }
  
  formVisible.value = true
}

const close = () => {
  formVisible.value = false
}

const handleCancel = () => {
  emit('cancel')
  close()
}

const handleSubmit = async () => {
  if (!formValid.value) {
    ElMessage.warning('Пожалуйста, заполните все обязательные поля')
    return
  }
  
  isSubmitting.value = true
  
  try {
    emit('submit', {
      ...form,
      // Include ID only in edit mode
      ...(props.isEdit && props.productGroup ? { id: props.productGroup.id } : {})
    })
    close()
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Expose methods to parent component
defineExpose({
  open,
  close
})
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="props.isEdit ? 'Редактировать группу продуктов' : 'Добавить группу продуктов'"
    :width="window.innerWidth <= 768 ? '90%' : '30%'"
    center
    destroy-on-close
    @close="handleCancel"
  >
    <el-form :model="form" label-position="top" status-icon>
      <el-form-item label="Название" required :error="!form.title && 'Название обязательно'">
        <el-input 
          v-model="form.title" 
          placeholder="Введите название группы" 
          clearable 
          :maxlength="50"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="Приоритет" required :error="form.priority === undefined && 'Приоритет обязателен'">
        <el-input-number 
          v-model="form.priority" 
          :min="0" 
          :max="100" 
          :step="1"
          :precision="0"
          controls-position="right"
          placeholder="Введите приоритет"
          style="width: 100%"
        />
        <div class="flex items-center mt-4">
          <el-slider 
            v-model="form.priority" 
            :min="0" 
            :max="100" 
            :step="5"
            show-stops
            show-tooltip
            :height="window.innerWidth <= 768 ? '200px' : ''"
            :vertical="window.innerWidth <= 768"
            class="flex-1 slider-custom"
          />
        </div>
        <div class="text-xs text-gray-500 mt-1">
          Группы с более высоким приоритетом отображаются первыми (0-100)
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" :disabled="isSubmitting">Отмена</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit" 
          :loading="isSubmitting"
          :disabled="!formValid"
        >
          {{ props.isEdit ? 'Сохранить' : 'Добавить' }}
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

.slider-custom :deep(.el-slider__runway) {
  margin: 0;
}

.slider-custom :deep(.el-slider__bar) {
  background-color: #409EFF;
}

.slider-custom :deep(.el-slider__stop) {
  width: 8px;
  height: 8px;
  background-color: #E4E7ED;
  border-radius: 50%;
}

.slider-custom :deep(.el-slider__button) {
  border: 2px solid #409EFF;
  width: 16px;
  height: 16px;
}
</style>