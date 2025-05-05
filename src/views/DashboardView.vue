<script setup lang="ts">
import { ref } from 'vue'
import ProductList from '../components/ProductList.vue'
import ProductGroupList from '../components/ProductGroupList.vue'
import ReviewList from '../components/ReviewList.vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const router = useRouter()

const activeTab = ref('products')

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('Выход выполнен успешно')
  router.push({ name: 'login' })
}
</script>

<template>
  <el-container class="dashboard">
    <el-header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Панель администратора Camp Coffee</h1>
        <div class="flex items-center space-x-4">
          <el-tag v-if="authStore.admin" type="info" effect="plain">
            {{ authStore.admin.username }}
          </el-tag>
          <el-button type="danger" size="small" icon="el-icon-switch-button" @click="handleLogout">Выход</el-button>
        </div>
      </div>
    </el-header>

    <el-main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <el-tabs v-model="activeTab" class="mb-6">
        <el-tab-pane label="Продукты" name="products">
          <ProductList />
        </el-tab-pane>
        <el-tab-pane label="Группы продуктов" name="productGroups">
          <ProductGroupList />
        </el-tab-pane>
        <el-tab-pane label="Отзывы" name="reviews">
          <ReviewList />
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>