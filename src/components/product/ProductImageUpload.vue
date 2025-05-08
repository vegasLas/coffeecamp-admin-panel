<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, ZoomIn } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile, UploadFile } from 'element-plus'

interface Props {
  fileList: UploadUserFile[]
  formVisible: boolean
  isEdit?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  required: false
})

const emit = defineEmits<{
  (e: 'update:fileList', files: UploadUserFile[]): void
  (e: 'filesChanged', files: File[]): void
}>()

const imageFiles = ref<File[]>([])

// Watch for fileList changes to reset internal state when needed
watch(() => props.formVisible, () => {
  imageFiles.value = []
})


const handleExceed = (files: File[]) => {
  ElMessage.warning(`Максимальное количество изображений: 5. Вы пытаетесь добавить еще ${files.length} изображений.`)
}

const handleRemove = (file: UploadFile) => {
  // Remove from fileList
  const updatedFileList = [...props.fileList]
  const index = updatedFileList.findIndex(item => item.name === file.name)
  if (index !== -1) {
    updatedFileList.splice(index, 1)
    emit('update:fileList', updatedFileList)
  }
  
  // Remove from imageFiles if it's a new upload
  if (file.raw) {
    const fileIndex = imageFiles.value.findIndex(f => f === file.raw)
    if (fileIndex !== -1) {
      imageFiles.value.splice(fileIndex, 1)
      emit('filesChanged', [...imageFiles.value])
    }
  }
}

const handlePreview = (file: UploadFile) => {
  // Open image in a new tab for preview
  if (file.url) {
    window.open(file.url)
  }
}

const handleChange: UploadProps['onChange'] = (file, uploadFiles) => {
  // Update fileList for UI
  emit('update:fileList', uploadFiles)
  
  // Update imageFiles for form submission
  if (file.raw && !imageFiles.value.includes(file.raw)) {
    imageFiles.value.push(file.raw)
    emit('filesChanged', [...imageFiles.value])
  }
}

const beforeImageUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('Можно загружать только изображения!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('Размер изображения не должен превышать 2MB!')
    return false
  }
  return true
}
</script>

<template>
  <el-form-item :label="props.isEdit ? 'Изменить изображения' : 'Изображения'" :required="props.required">
    <el-upload
      class="mr-4"
      action="#"
      :auto-upload="false"
      list-type="picture-card"
      :file-list="fileList"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      :before-upload="beforeImageUpload"
      :on-exceed="handleExceed"
      :limit="5"
      multiple
    >
      <el-icon><Plus /></el-icon>
      <template #file="{ file }">
        <div> 
        <img class="el-upload-list__item-thumbnail" :src="`${file.url}`" alt="" />
          <span class="el-upload-list__item-actions">
            <span class="el-upload-list__item-preview" @click="handlePreview(file)">
              <el-icon><zoom-in /></el-icon>
            </span>
            <span class="el-upload-list__item-delete" @click="handleRemove(file)">
              <el-icon><Delete /></el-icon>
            </span>
          </span>
        </div>
      </template>
    </el-upload>
    <div class="text-xs text-gray-500 mt-1">
      Вы можете загрузить до 5 изображений (макс. 2MB каждое)
    </div>
  </el-form-item>
</template>