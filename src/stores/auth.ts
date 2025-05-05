import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi, checkAuthStatus } from '../services/api'
import type { Admin, LoginCredentials } from '../types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const admin = ref<Admin | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!admin.value)
  
  // Actions
  async function initAuth() {
    if (isInitialized.value) return
    
    isLoading.value = true
    try {
      const { authenticated, admin: userData } = await checkAuthStatus()
      if (authenticated && userData) {
        admin.value = userData
      }
    } catch (err) {
      console.error('Failed to initialize auth:', err)
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  // Initialize auth state when store is created
  initAuth()

  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await loginApi(credentials)
      admin.value = response.admin
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    await logoutApi()
    admin.value = null
  }

  return {
    // State
    admin,
    isLoading,
    error,
    isInitialized,
    // Getters
    isAuthenticated,
    // Actions
    login,
    logout,
    initAuth
  }
})