// Type definitions for the application

// Auth types
export interface Admin {
  id: number
  username: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  message: string
  token?: string // Optional as we're using HTTP-only cookies now
  admin: Admin
}

// Product types
export interface ProductImage {
  id: number
  path: string
}

export interface ProductGroup {
  id: number
  title: string
  priority: number
  products?: Product[]
}

export interface Product {
  id: number
  title: string
  description: string
  cost: number
  images: ProductImage[]
  productGroup: ProductGroup
}

// Review types
export interface Review {
  id: number
  name: string
  rating: number
  comment?: string
  timestamp: string
}

export interface CreateReviewPayload {
  name: string
  rating: number
  comment?: string
}

// API response types
export type ApiResponse<T> = {
  message?: string
  error?: string
} & T;