import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard for protected routes
router.beforeEach(async (to, _, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const authStore = useAuthStore()
  
  // If not initialized yet, initialize auth state
  if (!authStore.isInitialized) {
    await authStore.initAuth()
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // Redirect to dashboard if already logged in
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router