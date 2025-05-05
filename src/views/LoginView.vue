<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import type { LoginCredentials } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const credentials = ref<LoginCredentials>({
  username: '',
  password: ''
})

const isSubmitting = ref(false)

async function handleLogin() {
  if (!credentials.value.username || !credentials.value.password) {
    ElMessage.error('Пожалуйста, введите имя пользователя и пароль')
    return
  }

  isSubmitting.value = true
  
  try {
    const success = await authStore.login(credentials.value)
    if (success) {
      ElMessage.success('Вход выполнен успешно')
      router.push({ name: 'dashboard' })
    } else {
      ElMessage.error(authStore.error || 'Ошибка входа')
    }
  } catch (error) {
    ElMessage.error('Произошла ошибка при входе')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <el-card class="max-w-md w-full" shadow="always">
      <div class="space-y-6">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900">
            Панель администратора Camp Coffee
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Войдите в свою учетную запись
          </p>
        </div>
        
        <el-form @submit.prevent="handleLogin">
          <el-form-item>
            <el-input
              v-model="credentials.username"
              placeholder="Имя пользователя"
              prefix-icon="el-icon-user"
              clearable
            />
          </el-form-item>
          
          <el-form-item>
            <el-input
              v-model="credentials.password"
              type="password"
              placeholder="Пароль"
              prefix-icon="el-icon-lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              native-type="submit"
              :loading="isSubmitting"
              class="w-full"
            >
              Войти
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>