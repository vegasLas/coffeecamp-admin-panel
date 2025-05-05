<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ProductList from '../components/ProductList.vue'
import ProductGroupList from '../components/ProductGroupList.vue'
import ReviewList from '../components/ReviewList.vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Fold, Close, SwitchButton } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const router = useRouter()

const activeTab = ref('products')
const isMobile = ref(false)
const sidebarVisible = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  // On desktop, sidebar is always visible
  if (!isMobile.value) {
    sidebarVisible.value = true
  } else {
    // On mobile, sidebar is hidden by default
    sidebarVisible.value = false
  }
}

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('Выход выполнен успешно')
  router.push({ name: 'login' })
}
</script>

<template>
  <el-container class="dashboard">
    <!-- Mobile sidebar overlay -->
    <div v-if="isMobile && sidebarVisible" class="mobile-sidebar-overlay" @click="toggleSidebar"></div>
    
    <!-- Sidebar -->
    <el-aside v-if="sidebarVisible" width="250px" class="bg-white shadow-sm fixed-sidebar">
      <div style="padding-left: 4px; padding-left: 4px;" class="py-4 px-4 border-gray-200 flex justify-between items-center sidebar-header">
        <h1 class="text-xl font-bold text-gray-900">Camp Coffee</h1>
        <el-button v-if="isMobile" @click="toggleSidebar" class="p-1" type="default" :icon="Close" />
      </div>
      <el-menu
        :default-active="activeTab"
        class="h-full border-0 px-3"
        @select="(index: any) => { activeTab = index; if (isMobile) toggleSidebar(); }"
      >
        <el-menu-item index="products">
          <span>Продукты</span>
        </el-menu-item>
        <el-menu-item index="productGroups">
          <span>Группы продуктов</span>
        </el-menu-item>
        <el-menu-item index="reviews">
          <span>Отзывы</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container :class="[!isMobile && 'main-content', isMobile && 'main-content-full']">
      <el-header class="bg-white shadow">
        <div class="py-2 px-4 pt-4 flex justify-between items-center">
          <div class="flex items-center">
            <el-button v-if="isMobile && !sidebarVisible" @click="toggleSidebar" class="mr-4 burger-button" type="primary" :icon="Fold" />
          </div>
          <div class="flex items-center space-x-4">
            <el-tag v-if="authStore.admin" type="info" effect="plain" class="py-1.5 px-3 text-sm font-medium">
              {{ authStore.admin.username }}
            </el-tag>
            <el-button 
              type="danger" 
              size="small" 
              :icon="SwitchButton" 
              @click="handleLogout"
              class="custom-logout-btn"
            >
              Выход
            </el-button>
          </div>
        </div>
      </el-header>
      
      <el-main class="bg-white shadow-sm rounded-lg">
        <div v-if="activeTab === 'products'">
          <ProductList />
        </div>
        <div v-else-if="activeTab === 'productGroups'">
          <ProductGroupList />
        </div>
        <div v-else-if="activeTab === 'reviews'">
          <ReviewList />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
}

.fixed-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 11;
}

.burger-button {
  font-size: 1.25rem;
  border-radius: 0.25rem;
  padding: 0.75rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #409EFF;
  color: white;
}

.custom-logout-btn {
  transition: all 0.2s ease;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.custom-logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.main-content {
  margin-left: 250px;
  width: calc(100% - 250px);
}

.main-content-full {
  width: 100%;
}

.mobile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 5;
}

@media (max-width: 767px) {
  .fixed-sidebar {
    width: 100%;
    max-width: 300px;
  }
}
</style>