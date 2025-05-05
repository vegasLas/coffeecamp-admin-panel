import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getReviews, createReview, deleteReview } from '../services/api'
import type { Review, CreateReviewPayload } from '../types'

export const useReviewsStore = defineStore('reviews', () => {
  // State
  const reviews = ref<Review[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const sortedReviews = computed(() => {
    // Sort by timestamp (newest first)
    return [...reviews.value].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
  })

  const averageRating = computed(() => {
    if (reviews.value.length === 0) return 0
    const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
    return Math.round((sum / reviews.value.length) * 10) / 10 // Round to 1 decimal place
  })

  // Actions
  async function fetchReviews() {
    isLoading.value = true
    error.value = null
    
    try {
      reviews.value = await getReviews()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch reviews'
      console.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  async function addReview(reviewData: CreateReviewPayload) {
    isLoading.value = true
    error.value = null
    
    try {
      const newReview = await createReview(reviewData)
      reviews.value.push(newReview)
      return newReview
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add review'
      console.error(error.value)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  async function removeReview(id: number) {
    isLoading.value = true
    error.value = null
    
    try {
      await deleteReview(id)
      const index = reviews.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reviews.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete review'
      console.error(error.value)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    reviews,
    isLoading,
    error,
    // Getters
    sortedReviews,
    averageRating,
    // Actions
    fetchReviews,
    addReview,
    removeReview
  }
})